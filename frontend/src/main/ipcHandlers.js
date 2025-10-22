const { ipcMain, dialog } = require("electron");
const https = require("https");
const http = require("http");
const { URL } = require("url");
const FormData = require("form-data");
const fs = require("fs");
const path = require("path");

class IPCHandlers {
  constructor() {
    this.setupHandlers();
  }

  setupHandlers() {
    // HTTP request handler
    ipcMain.handle("http-request", this.handleHttpRequest.bind(this));

    // File upload handler
    ipcMain.handle("upload-files", this.handleFileUpload.bind(this));

    // Directory upload handler
    ipcMain.handle("upload-directory", this.handleDirectoryUpload.bind(this));

    // Directory dialog handler
    ipcMain.handle("select-directory", this.handleSelectDirectory.bind(this));

    // File dialog handler for single files
    ipcMain.handle("select-files", this.handleSelectFiles.bind(this));
  }

  /**
   * Handle directory selection dialog
   * Returns an array of file objects with full absolute paths
   */
  async handleSelectDirectory(event) {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openDirectory"],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, files: [] };
      }

      const directoryPath = result.filePaths[0];
      const files = await this.getAllFilesInDirectory(directoryPath);

      return {
        canceled: false,
        directoryPath: directoryPath,
        files: files,
      };
    } catch (error) {
      console.error("Error selecting directory:", error);
      throw error;
    }
  }

  /**
   * Handle file selection dialog for single files
   * Returns an array of file paths
   */
  async handleSelectFiles(event) {
    try {
      const result = await dialog.showOpenDialog({
        properties: ["openFile", "multiSelections"],
        filters: [
          {
            name: "Supported Files",
            extensions: [
              "txt",
              "docx",
              "xlsx",
              "pdf",
              "csv",
              "png",
              "jpg",
              "jpeg",
              "wav",
              "mp4",
            ],
          },
          { name: "All Files", extensions: ["*"] },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true, files: [] };
      }

      return {
        canceled: false,
        files: result.filePaths,
      };
    } catch (error) {
      console.error("Error selecting files:", error);
      throw error;
    }
  }

  /**
   * Recursively get all files in a directory with full absolute paths
   */
  async getAllFilesInDirectory(dirPath, fileList = []) {
    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await this.getAllFilesInDirectory(filePath, fileList);
      } else {
        fileList.push({
          path: filePath,
          name: file,
          size: stat.size,
        });
      }
    }

    return fileList;
  }

  async handleHttpRequest(event, options) {
    return new Promise((resolve, reject) => {
      const { url, method = "GET", data, headers = {} } = options;
      const urlObj = new URL(url);
      const client = urlObj.protocol === "https:" ? https : http;

      // Prepare request body
      let requestBody = "";
      let contentType = "application/json";

      if (data && method !== "GET") {
        if (typeof data === "object") {
          requestBody = JSON.stringify(data);
          contentType = "application/json";
        } else {
          requestBody = data;
        }
      }

      const requestOptions = {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: method,
        headers: {
          "Content-Type": contentType,
          "Content-Length": Buffer.byteLength(requestBody),
          "User-Agent": "Electron-App/1.0.0",
          ...headers,
        },
      };

      console.log("Making HTTP request:", {
        url,
        method,
        headers: requestOptions.headers,
        bodyLength: requestBody.length,
      });

      const req = client.request(requestOptions, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk.toString();
        });

        res.on("end", () => {
          console.log("HTTP response:", {
            status: res.statusCode,
            headers: res.headers,
            bodyLength: responseData.length,
          });

          try {
            const jsonData = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              data: jsonData,
              success: res.statusCode >= 200 && res.statusCode < 300,
            });
          } catch (e) {
            // If it's not JSON, return as text
            resolve({
              status: res.statusCode,
              data: responseData,
              success: res.statusCode >= 200 && res.statusCode < 300,
            });
          }
        });
      });

      req.on("error", (error) => {
        console.error("HTTP request error:", error);
        reject({
          error: error.message,
          success: false,
        });
      });

      if (requestBody) {
        req.write(requestBody);
      }

      req.end();
    });
  }

  async handleFileUpload(event, files, uploadUrl) {
    return new Promise((resolve, reject) => {
      const form = new FormData();

      console.log(
        "Uploading files:",
        files.map((f) => ({ name: f.name, path: f.path, size: f.size }))
      );

      files.forEach((file, index) => {
        if (file.buffer && Array.isArray(file.buffer)) {
          // Convert array back to Buffer
          const buffer = Buffer.from(file.buffer);
          form.append("file", buffer, file.name);
          // Send the full absolute path as a separate field
          form.append(`file_path_${index}`, file.path || file.name);
        } else {
          reject({
            error: `File buffer missing or invalid for: ${file.name}`,
            success: false,
          });
          return;
        }
      });

      const urlObj = new URL(uploadUrl);

      const options = {
        host: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname,
        protocol: urlObj.protocol,
        headers: form.getHeaders(),
      };

      console.log("Form submission options:", options);

      form.submit(options, (err, res) => {
        if (err) {
          console.error("Form submission error:", err);
          reject({ error: err.message, success: false });
          return;
        }

        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk.toString();
        });

        res.on("end", () => {
          console.log("Upload response:", {
            status: res.statusCode,
            body:
              responseData.substring(0, 200) +
              (responseData.length > 200 ? "..." : ""),
          });

          try {
            const jsonData = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              data: jsonData,
              success: res.statusCode >= 200 && res.statusCode < 300,
            });
          } catch (e) {
            // Handle HTML responses (like Django success pages)
            const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
            resolve({
              status: res.statusCode,
              data: {
                message: isSuccess
                  ? "Files uploaded successfully"
                  : responseData,
              },
              success: isSuccess,
            });
          }
        });

        res.on("error", (error) => {
          console.error("Upload response error:", error);
          reject({ error: error.message, success: false });
        });
      });
    });
  }

  async handleDirectoryUpload(event, files, uploadUrl) {
    return new Promise((resolve, reject) => {
      const form = new FormData();

      console.log(
        "Uploading directory:",
        files.map((f) => ({ name: f.name, path: f.path, size: f.size }))
      );

      files.forEach((file, index) => {
        if (file.buffer && Array.isArray(file.buffer)) {
          // Convert array back to Buffer
          const buffer = Buffer.from(file.buffer);
          // Use 'directory_zip' as the field name for directory uploads
          form.append("directory_zip", buffer, file.name);
          // Send the full absolute path as a separate field for each file
          form.append(`file_path_${index}`, file.path || file.name);
        } else {
          reject({
            error: `File buffer missing or invalid for: ${file.name}`,
            success: false,
          });
          return;
        }
      });

      const urlObj = new URL(uploadUrl);

      const options = {
        host: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === "https:" ? 443 : 80),
        path: urlObj.pathname,
        protocol: urlObj.protocol,
        headers: form.getHeaders(),
      };

      console.log("Directory upload options:", options);

      form.submit(options, (err, res) => {
        if (err) {
          console.error("Directory upload error:", err);
          reject({ error: err.message, success: false });
          return;
        }

        let responseData = "";
        res.on("data", (chunk) => {
          responseData += chunk.toString();
        });

        res.on("end", () => {
          console.log("Directory upload response:", {
            status: res.statusCode,
            body:
              responseData.substring(0, 200) +
              (responseData.length > 200 ? "..." : ""),
          });

          try {
            const jsonData = JSON.parse(responseData);
            resolve({
              status: res.statusCode,
              data: jsonData,
              success: res.statusCode >= 200 && res.statusCode < 300,
            });
          } catch (e) {
            // Handle HTML responses (like Django success pages)
            const isSuccess = res.statusCode >= 200 && res.statusCode < 300;
            resolve({
              status: res.statusCode,
              data: {
                message: isSuccess
                  ? "Directory uploaded successfully"
                  : responseData,
              },
              success: isSuccess,
            });
          }
        });

        res.on("error", (error) => {
          console.error("Directory upload response error:", error);
          reject({ error: error.message, success: false });
        });
      });
    });
  }
}

module.exports = IPCHandlers;
