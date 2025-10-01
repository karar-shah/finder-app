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
   * Get uploaded files list
   */
  async getFilesList() {
    return await this.makeRequest("/filetbl/", "GET");
  }

  /**
   * Delete file by ID
   */
  async deleteFile(fileId) {
    return await this.makeRequest(`/filetbl/${fileId}`, "DELETE");
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
      // Read file contents as buffers
      const fileArray = await Promise.all(
        Array.from(files).map(async (file) => {
          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function (event) {
              const arrayBuffer = event.target.result;
              const uint8Array = new Uint8Array(arrayBuffer);
              resolve({
                buffer: Array.from(uint8Array), // Convert to regular array for IPC
                name: file.name,
                size: file.size,
                type: file.type,
              });
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
          });
        })
      );

      console.log(
        "Uploading via Electron:",
        fileArray.map((f) => ({ name: f.name, size: f.size }))
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
}

// Make APIClient available globally
window.APIClient = APIClient;
