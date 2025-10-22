/**
 * API Client for handling HTTP requests and file uploads
 * Works both in Electron environment and web browsers
 */
class APIClient {
  constructor(baseUrl = "http://127.0.0.1:8000") {
    this.API_BASE_URL = baseUrl;
    this.isElectron = window.electronAPI && window.electronAPI.isElectron;
  }

  /**
   * Make HTTP request (GET/POST/DELETE)
   */
  async makeRequest(endpoint, method = "GET", data = null) {
    const url = `${this.API_BASE_URL}${endpoint}`;

    if (this.isElectron) {
      return await this._makeElectronRequest(url, method, data);
    } else {
      return await this._makeWebRequest(url, method, data);
    }
  }

  /**
   * Upload files
   */
  async uploadFiles(files) {
    const uploadUrl = `${this.API_BASE_URL}/file/`;

    if (this.isElectron) {
      return await this._uploadFilesElectron(files, uploadUrl);
    } else {
      return await this._uploadFilesWeb(files, uploadUrl);
    }
  }

  /**
   * Upload directory (as ZIP)
   */
  async uploadDirectory(files) {
    const uploadUrl = `${this.API_BASE_URL}/upload-directory/`;

    if (this.isElectron) {
      return await this._uploadDirectoryElectron(files, uploadUrl);
    } else {
      return await this._uploadDirectoryWeb(files, uploadUrl);
    }
  }

  /**
   * Select directory using Electron dialog
   * Returns directory info with all files and their absolute paths
   */
  async selectDirectoryDialog() {
    if (!this.isElectron) {
      throw new Error("Directory dialog is only available in Electron");
    }

    try {
      const result = await window.electronAPI.selectDirectory();
      return result;
    } catch (error) {
      throw new Error(`Failed to select directory: ${error.message}`);
    }
  }

  /**
   * Select files using Electron dialog
   * Returns array of file paths
   */
  async selectFilesDialog() {
    if (!this.isElectron) {
      throw new Error("File dialog is only available in Electron");
    }

    try {
      const result = await window.electronAPI.selectFiles();
      return result;
    } catch (error) {
      throw new Error(`Failed to select files: ${error.message}`);
    }
  }

  /**
   * Upload directory with full absolute paths (Electron only)
   */
  async uploadDirectoryWithPaths(directoryInfo) {
    const uploadUrl = `${this.API_BASE_URL}/upload-directory/`;

    if (!this.isElectron) {
      throw new Error("uploadDirectoryWithPaths is only available in Electron");
    }

    try {
      return await this._uploadDirectoryWithPathsElectron(
        directoryInfo,
        uploadUrl
      );
    } catch (error) {
      throw new Error(
        `Failed to upload directory with paths: ${error.message}`
      );
    }
  }

  async _uploadDirectoryWithPathsElectron(directoryInfo, uploadUrl) {
    try {
      // Read file contents as buffers with full paths
      // We need to read files using fetch with file:// protocol in Electron
      const fileArray = await Promise.all(
        directoryInfo.files.map(async (fileInfo) => {
          return new Promise(async (resolve, reject) => {
            try {
              // Use fetch to read local file in Electron
              const response = await fetch(`file://${fileInfo.path}`);
              const arrayBuffer = await response.arrayBuffer();
              const uint8Array = new Uint8Array(arrayBuffer);

              resolve({
                buffer: Array.from(uint8Array),
                name: fileInfo.name,
                path: fileInfo.path, // Full absolute path
                size: fileInfo.size,
              });
            } catch (error) {
              reject(error);
            }
          });
        })
      );

      console.log(
        "Uploading directory with absolute paths:",
        fileArray.map((f) => ({ name: f.name, path: f.path }))
      );

      const response = await window.electronAPI.uploadDirectory(
        fileArray,
        uploadUrl
      );
      return response;
    } catch (error) {
      throw new Error(
        `Electron directory upload with paths failed: ${error.message}`
      );
    }
  }

  /**
   * Get uploaded files list
   */
  async getFilesList() {
    return await this.makeRequest("/filetbl/", "GET");
  }

  /**
   * Delete file by ID (deletes entire file with all words and physical file)
   */
  async deleteFile(fileId) {
    return await this.makeRequest(`/api/delete-file/${fileId}`, "DELETE");
  }

  /**
   * Delete all files and clear database
   */
  async clearAllFiles() {
    return await this.makeRequest("/api/clear-all/", "DELETE");
  }

  /**
   * Search for words
   */
  async searchWords(searchWord, searchType = "exact") {
    return await this.makeRequest("/api/search/", "POST", {
      wordsearch: searchWord,
      search_type: searchType,
    });
  }

  // Private methods for Electron
  async _makeElectronRequest(url, method, data) {
    try {
      const response = await window.electronAPI.httpRequest({
        url,
        method,
        data,
      });
      return response;
    } catch (error) {
      throw new Error(`Electron request failed: ${error.message}`);
    }
  }

  async _uploadFilesElectron(files, uploadUrl) {
    try {
      // Check if files is an array of file paths or File objects
      const isFilePaths =
        files.length > 0 &&
        typeof files[0] === "object" &&
        files[0].path &&
        !files[0].size;

      let fileArray;

      if (isFilePaths) {
        // Files are just path objects, need to read them
        fileArray = await Promise.all(
          Array.from(files).map(async (fileObj) => {
            return new Promise(async (resolve, reject) => {
              try {
                // Use fetch to read local file in Electron
                const response = await fetch(`file://${fileObj.path}`);
                const arrayBuffer = await response.arrayBuffer();
                const uint8Array = new Uint8Array(arrayBuffer);

                resolve({
                  buffer: Array.from(uint8Array),
                  name: fileObj.name,
                  path: fileObj.path, // Full absolute path
                  size: arrayBuffer.byteLength,
                  type: "",
                });
              } catch (error) {
                reject(error);
              }
            });
          })
        );
      } else {
        // Files are regular File objects
        fileArray = await Promise.all(
          Array.from(files).map(async (file) => {
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = function (event) {
                const arrayBuffer = event.target.result;
                const uint8Array = new Uint8Array(arrayBuffer);
                resolve({
                  buffer: Array.from(uint8Array), // Convert to regular array for IPC
                  name: file.name,
                  path: file.path || file.name, // Get full absolute path from Electron File object
                  size: file.size,
                  type: file.type,
                });
              };
              reader.onerror = reject;
              reader.readAsArrayBuffer(file);
            });
          })
        );
      }

      console.log(
        "Uploading via Electron:",
        fileArray.map((f) => ({ name: f.name, path: f.path, size: f.size }))
      );

      const response = await window.electronAPI.uploadFiles(
        fileArray,
        uploadUrl
      );
      return response;
    } catch (error) {
      throw new Error(`Electron upload failed: ${error.message}`);
    }
  }

  // Private methods for Web
  async _makeWebRequest(url, method, data) {
    return new Promise((resolve, reject) => {
      const ajaxOptions = {
        url,
        type: method,
        success: function (response) {
          resolve({
            success: true,
            data: response,
            status: 200,
          });
        },
        error: function (xhr, status, error) {
          reject({
            success: false,
            status: xhr.status,
            error: error,
            responseText: xhr.responseText,
          });
        },
      };

      if (data && method !== "GET") {
        if (method === "DELETE") {
          // For DELETE requests, don't send data in body
        } else {
          ajaxOptions.dataType = "json";
          ajaxOptions.contentType = "application/json";
          ajaxOptions.data = JSON.stringify(data);
        }
      } else if (method === "GET") {
        ajaxOptions.dataType = "json";
      }

      $.ajax(ajaxOptions);
    });
  }

  async _uploadFilesWeb(files, uploadUrl) {
    return new Promise((resolve, reject) => {
      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("file", files[i]);
      }

      console.log("Uploading via web:", files.length, "files");

      $.ajax({
        url: uploadUrl,
        type: "POST",
        data: formData,
        processData: false,
        contentType: false,
        success: function (response) {
          resolve({
            success: true,
            data: response,
            status: 200,
          });
        },
        error: function (xhr, status, error) {
          reject({
            success: false,
            status: xhr.status,
            error: error,
            responseText: xhr.responseText,
          });
        },
      });
    });
  }

  async _uploadDirectoryElectron(files, uploadUrl) {
    try {
      // Create ZIP file from directory files
      const zip = new JSZip();

      // Add files to ZIP maintaining directory structure
      const filePromises = Array.from(files).map(async (file) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            const arrayBuffer = event.target.result;
            const relativePath = file.webkitRelativePath || file.name;
            zip.file(relativePath, arrayBuffer);
            resolve();
          };
          reader.onerror = reject;
          reader.readAsArrayBuffer(file);
        });
      });

      await Promise.all(filePromises);

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "arraybuffer" });
      const zipUint8Array = new Uint8Array(zipBlob);

      // Upload ZIP via Electron
      const zipFile = {
        buffer: Array.from(zipUint8Array),
        name: "directory.zip",
        size: zipBlob.byteLength,
        type: "application/zip",
      };

      const response = await window.electronAPI.uploadDirectory(
        [zipFile],
        uploadUrl
      );
      return response;
    } catch (error) {
      throw new Error(`Electron directory upload failed: ${error.message}`);
    }
  }

  async _uploadDirectoryWeb(files, uploadUrl) {
    return new Promise(async (resolve, reject) => {
      try {
        console.log("Starting directory upload, files:", files.length);
        console.log("JSZip available:", typeof JSZip !== "undefined");

        // Create ZIP file from directory files
        const zip = new JSZip();

        // Add files to ZIP maintaining directory structure
        const filePromises = Array.from(files).map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
              const arrayBuffer = event.target.result;
              const relativePath = file.webkitRelativePath || file.name;
              zip.file(relativePath, arrayBuffer);
              resolve();
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
        });

        await Promise.all(filePromises);

        console.log("All files processed, generating ZIP...");

        // Generate ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });

        console.log("ZIP generated, size:", zipBlob.size);

        // Upload ZIP file
        const formData = new FormData();
        formData.append("directory_zip", zipBlob, "directory.zip");

        console.log(
          "Uploading directory via web:",
          files.length,
          "files as ZIP"
        );

        $.ajax({
          url: uploadUrl,
          type: "POST",
          data: formData,
          processData: false,
          contentType: false,
          success: function (response) {
            resolve({
              success: true,
              data: response,
              status: 200,
            });
          },
          error: function (xhr, status, error) {
            reject({
              success: false,
              status: xhr.status,
              error: error,
              responseText: xhr.responseText,
            });
          },
        });
      } catch (error) {
        reject({
          success: false,
          error: error.message,
        });
      }
    });
  }
}

// Make APIClient available globally
window.APIClient = APIClient;
