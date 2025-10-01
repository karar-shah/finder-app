const { ipcMain } = require("electron");
const https = require("https");
const http = require("http");
const { URL } = require("url");
const FormData = require("form-data");

class IPCHandlers {
  constructor() {
    this.setupHandlers();
  }

  setupHandlers() {
    // HTTP request handler
    ipcMain.handle("http-request", this.handleHttpRequest.bind(this));

    // File upload handler
    ipcMain.handle("upload-files", this.handleFileUpload.bind(this));
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
        files.map((f) => ({ name: f.name, size: f.size }))
      );

      files.forEach((file, index) => {
        if (file.buffer && Array.isArray(file.buffer)) {
          // Convert array back to Buffer
          const buffer = Buffer.from(file.buffer);
          form.append("file", buffer, file.name);
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
}

module.exports = IPCHandlers;
