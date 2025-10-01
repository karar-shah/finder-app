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
    this.setupDragAndDrop();
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

    // Handle clear all button click
    $("#clear-all-btn").on("click", () => {
      this.handleClearAll();
    });

    // Handle file input change
    $("#files").on("change", (e) => {
      this.handleFileSelection(e.target.files);
    });
  }

  /**
   * Setup drag and drop functionality
   */
  setupDragAndDrop() {
    const uploadArea = $("#upload-area");

    uploadArea.on("dragover", (e) => {
      e.preventDefault();
      uploadArea.addClass("dragover");
    });

    uploadArea.on("dragleave", (e) => {
      e.preventDefault();
      uploadArea.removeClass("dragover");
    });

    uploadArea.on("drop", (e) => {
      e.preventDefault();
      uploadArea.removeClass("dragover");

      const files = e.originalEvent.dataTransfer.files;
      if (files.length > 0) {
        $("#files")[0].files = files;
        this.handleFileSelection(files);
      }
    });
  }

  /**
   * Handle file selection (from input or drag-drop)
   */
  handleFileSelection(files) {
    if (files && files.length > 0) {
      const fileNames = Array.from(files)
        .map((file) => file.name)
        .join(", ");
      const uploadArea = $("#upload-area");

      uploadArea
        .find(".file-upload-text")
        .html(`<strong>${files.length} file(s) selected:</strong>`);
      uploadArea
        .find(".file-upload-hint")
        .text(
          fileNames.length > 50 ? fileNames.substring(0, 50) + "..." : fileNames
        );
    }
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
    this.updateFileCount(fileMap.size);

    if (fileMap.size === 0) {
      this.filesTableBody.append(`
        <tr>
          <td colspan="3" class="text-center">
            <div class="no-results">
              <div class="no-results-icon">
                <i class="bi bi-file-earmark-plus"></i>
              </div>
              <div>No files uploaded yet</div>
            </div>
          </td>
        </tr>
      `);
      return;
    }

    let index = 1;
    fileMap.forEach((fileData, fileName) => {
      const shortName =
        fileName.length > 35 ? fileName.substring(0, 32) + "..." : fileName;

      const row = `
        <tr data-filename="${fileName}" data-ids="${fileData.ids.join(
        ","
      )}" class="slide-up">
          <td><span class="badge bg-primary">${index}</span></td>
          <td title="${fileName}">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-text text-primary me-2"></i>
              <span>${shortName}</span>
            </div>
          </td>
          <td>
            <button class="btn-danger-modern delete-file" data-filename="${fileName}" data-ids="${fileData.ids.join(
        ","
      )}">
              <i class="bi bi-trash"></i>
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
   * Update file count badge
   */
  updateFileCount(count) {
    const badge = $("#file-count-badge");
    badge.text(count);
    badge.toggleClass("d-none", count === 0);
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

      // Check if table is empty and update display
      const remainingRows = this.filesTableBody.find("tr[data-ids]").length;
      if (remainingRows === 0) {
        this.filesTableBody.append(`
          <tr>
            <td colspan="3" class="text-center">
              <div class="no-results">
                <div class="no-results-icon">
                  <i class="bi bi-file-earmark-plus"></i>
                </div>
                <div>No files uploaded yet</div>
              </div>
            </td>
          </tr>
        `);
        this.updateFileCount(0);
      } else {
        this.updateFileCount(remainingRows);
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
   * Handle clear all files
   */
  async handleClearAll() {
    const rows = this.filesTableBody.find("tr[data-ids]");
    if (rows.length === 0) {
      this.showStatus("No files to clear", "info");
      return;
    }

    if (!confirm("Are you sure you want to delete all uploaded files?")) {
      return;
    }

    this.showStatus("Clearing all files...", "info");

    try {
      const deletePromises = [];
      rows.each((index, row) => {
        const ids = $(row).data("ids").toString().split(",");
        ids.forEach((id) => {
          deletePromises.push(this.apiClient.deleteFile(id));
        });
      });

      await Promise.all(deletePromises);
      this.showStatus("All files cleared successfully", "success");
      this.loadUploadedFiles();
    } catch (error) {
      console.error("Failed to clear all files:", error);
      this.showStatus("Error clearing files", "danger");
    }
  }

  /**
   * Helper function to show status messages
   */
  showStatus(message, type) {
    const statusClass = `status-${type}`;
    this.uploadStatus.html(`
      <div class="status-message ${statusClass} fade-in">
        ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()" aria-label="Close" style="float: right; background: none; border: none; font-size: 1.2rem; cursor: pointer;">&times;</button>
      </div>
    `);

    if (type === "success") {
      setTimeout(() => {
        this.uploadStatus.find(".status-message").fadeOut();
      }, 5000);
    }
  }
}

// Make FileManager available globally
window.FileManager = FileManager;
