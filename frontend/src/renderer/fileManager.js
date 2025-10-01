/**
 * File Manager for handling file upload and management operations
 */
class FileManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.uploadStatus = $("#upload-status");
    this.filesTableBody = $("#files-table-body");
  }

  /**
   * Initialize file manager
   */
  init() {
    this.setupEventHandlers();
    this.loadUploadedFiles();
  }

  /**
   * Setup event handlers for file operations
   */
  setupEventHandlers() {
    // Handle file upload form submission
    $("#upload-form").on("submit", (e) => {
      e.preventDefault();
      this.handleFileUpload();
    });

    // Handle search button click
    $("#search-btn").on("click", () => {
      this.navigateToSearch();
    });
  }

  /**
   * Handle file upload
   */
  async handleFileUpload() {
    const fileInput = $("#files")[0];
    const files = fileInput.files;

    if (!files || files.length === 0) {
      this.showStatus("Please select at least one file to upload", "warning");
      return;
    }

    // Show uploading status
    this.showStatus(
      '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Uploading files...',
      "info"
    );

    try {
      const response = await this.apiClient.uploadFiles(files);

      if (response.success) {
        this.showStatus("Files uploaded successfully!", "success");
        $("#files").val(""); // Clear file input
        this.loadUploadedFiles(); // Refresh file list
      } else {
        throw new Error(
          `Upload failed with status ${response.status}: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Upload failed:", error);
      this.handleUploadError(error);
    }
  }

  /**
   * Handle upload errors
   */
  handleUploadError(error) {
    let errorMessage = "Error uploading files. ";

    if (error.status === 0) {
      errorMessage +=
        "Cannot connect to server. Check if the backend is running.";
    } else if (error.status === 403) {
      errorMessage += "Upload forbidden - CSRF token issue.";
    } else if (error.status === 500) {
      errorMessage += "Server error occurred during processing.";
    } else {
      errorMessage += `Server returned status ${error.status || "unknown"}.`;
    }

    this.showStatus(errorMessage, "danger");
  }

  /**
   * Load uploaded files from server
   */
  async loadUploadedFiles() {
    console.log("Loading uploaded files...");

    try {
      const response = await this.apiClient.getFilesList();

      if (response.success && response.data) {
        this.processFileLoadResponse(response.data);
      } else {
        throw new Error(`Failed to load files: ${response.status}`);
      }
    } catch (error) {
      console.error("Failed to load files:", error);
      this.filesTableBody.html(
        '<tr><td colspan="3" class="text-center text-danger">Could not load files. Check if backend is running.</td></tr>'
      );
    }
  }

  /**
   * Process file load response
   */
  processFileLoadResponse(response) {
    console.log("Processing file response:", response);

    // Handle different response formats
    let data = [];

    if (response && response.data && Array.isArray(response.data)) {
      data = response.data;
    } else if (Array.isArray(response)) {
      data = response;
    } else {
      console.error("Invalid response format:", response);
      this.filesTableBody.html(
        '<tr><td colspan="3" class="text-center text-warning">Invalid response format from server</td></tr>'
      );
      return;
    }

    // Process data to get unique files with their IDs
    const fileMap = new Map();

    data.forEach((item) => {
      if (item.file) {
        const filePath = item.file;
        // Use original filename if available, otherwise extract from file path
        const fileName = item.original_filename || filePath.split("/").pop();

        if (!fileMap.has(fileName)) {
          fileMap.set(fileName, {
            path: filePath,
            ids: [item.id],
            original_name: item.original_filename,
          });
        } else {
          fileMap.get(fileName).ids.push(item.id);
        }
      }
    });

    // Display files in table
    this.displayFilesInTable(fileMap);
  }

  /**
   * Display files in table
   */
  displayFilesInTable(fileMap) {
    this.filesTableBody.empty();

    if (fileMap.size === 0) {
      this.filesTableBody.append(
        `<tr><td colspan="3" class="text-center">No files uploaded yet</td></tr>`
      );
      return;
    }

    let index = 1;
    fileMap.forEach((fileData, fileName) => {
      const shortName =
        fileName.length > 30 ? fileName.substring(0, 27) + "..." : fileName;

      const row = `
        <tr data-filename="${fileName}" data-ids="${fileData.ids.join(",")}">
          <td>${index}</td>
          <td title="${fileName}">${shortName}</td>
          <td>
            <button class="btn btn-sm btn-danger delete-file" data-filename="${fileName}" data-ids="${fileData.ids.join(
        ","
      )}">
              <i class="bi bi-trash"></i> Delete
            </button>
          </td>
        </tr>`;
      this.filesTableBody.append(row);
      index++;
    });

    // Add click handlers for delete buttons
    $(".delete-file")
      .off("click")
      .on("click", (e) => {
        e.preventDefault();
        const fileName = $(e.currentTarget).data("filename");
        const ids = $(e.currentTarget).data("ids").toString().split(",");

        if (confirm(`Are you sure you want to delete "${fileName}"?`)) {
          this.deleteFile(ids, $(e.currentTarget).closest("tr"));
        }
      });
  }

  /**
   * Delete file
   */
  async deleteFile(ids, row) {
    const fileName = row.data("filename");

    this.showStatus(`Deleting ${fileName}...`, "info");

    try {
      // Delete each ID associated with the file
      const deletePromises = ids.map((id) => this.apiClient.deleteFile(id));
      await Promise.all(deletePromises);

      this.showStatus(`${fileName} deleted successfully`, "success");
      row.remove();

      // Check if table is empty
      if (this.filesTableBody.find("tr").length === 0) {
        this.filesTableBody.append(
          '<tr><td colspan="3" class="text-center">No files uploaded yet</td></tr>'
        );
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      this.showStatus(`Error deleting ${fileName}`, "danger");
    }
  }

  /**
   * Navigate to search page
   */
  navigateToSearch() {
    const isElectron = window.electronAPI && window.electronAPI.isElectron;

    if (isElectron && window.electronAPI) {
      window.location.href = "words_table.html";
    } else {
      window.open("words_table.html", "_blank");
    }
  }

  /**
   * Helper function to show status messages
   */
  showStatus(message, type) {
    this.uploadStatus.html(`
      <div class="alert alert-${type} alert-dismissible fade show" role="alert">
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
      </div>
    `);

    if (type === "success") {
      setTimeout(() => {
        this.uploadStatus.find(".alert").alert("close");
      }, 5000);
    }
  }
}

// Make FileManager available globally
window.FileManager = FileManager;
