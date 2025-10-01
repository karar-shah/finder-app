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

    // Initialize with files mode as default
    this.handleUploadModeChange("files-mode");
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
      this.handleFileSelection(e.target.files, "files");
    });

    // Handle directory input change
    $("#directory").on("change", (e) => {
      this.handleFileSelection(e.target.files, "directory");
    });

    // Handle upload mode toggle
    $('input[name="upload-mode"]').on("change", (e) => {
      this.handleUploadModeChange(e.target.id);
    });

    // Remove any existing click handlers to prevent conflicts
    $("#upload-area").off("click");
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
        const mode = $('input[name="upload-mode"]:checked').attr("id");

        // Check if it's a directory being dropped (files with webkitRelativePath)
        const hasDirectoryStructure = Array.from(files).some(
          (file) =>
            file.webkitRelativePath && file.webkitRelativePath.includes("/")
        );

        if (hasDirectoryStructure || mode === "directory-mode") {
          // Switch to directory mode if not already
          if (mode !== "directory-mode") {
            $("#directory-mode").prop("checked", true);
            this.handleUploadModeChange("directory-mode");
          }
          $("#directory")[0].files = files;
          this.handleFileSelection(files, "directory");
        } else {
          // Switch to files mode if not already
          if (mode !== "files-mode") {
            $("#files-mode").prop("checked", true);
            this.handleUploadModeChange("files-mode");
          }
          $("#files")[0].files = files;
          this.handleFileSelection(files, "files");
        }
      }
    });
  }

  /**
   * Handle upload mode change
   */
  handleUploadModeChange(mode) {
    const uploadArea = $("#upload-area");
    const uploadIcon = $("#upload-icon");
    const uploadText = $("#upload-text");
    const uploadHint = $("#upload-hint");
    const uploadBtn = $("#upload-btn");
    const filesInput = $("#files");
    const directoryInput = $("#directory");

    if (mode === "directory-mode") {
      // Switch to directory mode
      uploadIcon
        .removeClass("bi-file-earmark-arrow-up")
        .addClass("bi-folder-plus");
      uploadText.html(
        "<strong>Click to upload</strong> or drag and drop a directory here"
      );
      uploadHint.text(
        "All supported files in the directory will be processed automatically"
      );
      uploadBtn.html('<i class="bi bi-upload me-2"></i>Upload Directory');

      // Hide files input completely
      filesInput.hide();

      // Show and position directory input
      directoryInput.show().css({
        position: "absolute",
        top: "0",
        left: "0",
        opacity: "0",
        width: "100%",
        height: "100%",
        cursor: "pointer",
        "z-index": "10",
      });
    } else {
      // Switch to files mode
      uploadIcon
        .removeClass("bi-folder-plus")
        .addClass("bi-file-earmark-arrow-up");
      uploadText.html(
        "<strong>Click to upload</strong> or drag and drop files here"
      );
      uploadHint.text(
        "Supports: TXT, DOCX, XLSX, PDF, CSV, PNG, JPG, WAV, MP4"
      );
      uploadBtn.html('<i class="bi bi-upload me-2"></i>Upload Files');

      // Hide directory input completely
      directoryInput.hide();

      // Show and position files input
      filesInput.show().css({
        position: "absolute",
        top: "0",
        left: "0",
        opacity: "0",
        width: "100%",
        height: "100%",
        cursor: "pointer",
        "z-index": "10",
      });
    }

    // Reset selection display
    this.resetUploadDisplay();
  }

  /**
   * Reset upload display to default state
   */
  resetUploadDisplay() {
    const mode = $('input[name="upload-mode"]:checked').attr("id");
    const uploadArea = $("#upload-area");

    if (mode === "directory-mode") {
      uploadArea
        .find(".file-upload-text")
        .html(
          "<strong>Click to upload</strong> or drag and drop a directory here"
        );
      uploadArea
        .find(".file-upload-hint")
        .text(
          "All supported files in the directory will be processed automatically"
        );
    } else {
      uploadArea
        .find(".file-upload-text")
        .html("<strong>Click to upload</strong> or drag and drop files here");
      uploadArea
        .find(".file-upload-hint")
        .text("Supports: TXT, DOCX, XLSX, PDF, CSV, PNG, JPG, WAV, MP4");
    }
  }

  /**
   * Handle file selection (from input or drag-drop)
   */
  handleFileSelection(files, type) {
    if (files && files.length > 0) {
      const uploadArea = $("#upload-area");

      if (type === "directory") {
        // For directory selection, show directory name and file count
        const firstFile = files[0];
        const directoryPath = firstFile.webkitRelativePath || firstFile.name;
        const directoryName = directoryPath.split("/")[0];

        uploadArea
          .find(".file-upload-text")
          .html(`<strong>Directory selected:</strong> ${directoryName}`);
        uploadArea
          .find(".file-upload-hint")
          .text(`${files.length} files found in directory`);
      } else {
        // For individual files
        const fileNames = Array.from(files)
          .map((file) => file.name)
          .join(", ");

        uploadArea
          .find(".file-upload-text")
          .html(`<strong>${files.length} file(s) selected:</strong>`);
        uploadArea
          .find(".file-upload-hint")
          .text(
            fileNames.length > 50
              ? fileNames.substring(0, 50) + "..."
              : fileNames
          );
      }
    }
  }

  /**
   * Handle file upload
   */
  async handleFileUpload() {
    const mode = $('input[name="upload-mode"]:checked').attr("id");

    if (mode === "directory-mode") {
      await this.handleDirectoryUpload();
    } else {
      await this.handleFilesUpload();
    }
  }

  /**
   * Handle individual files upload
   */
  async handleFilesUpload() {
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
        this.resetUploadDisplay();
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
   * Handle directory upload
   */
  async handleDirectoryUpload() {
    const directoryInput = $("#directory")[0];
    const files = directoryInput.files;

    if (!files || files.length === 0) {
      this.showStatus("Please select a directory to upload", "warning");
      return;
    }

    // Show uploading status
    this.showStatus(
      '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing directory...',
      "info"
    );

    try {
      const response = await this.apiClient.uploadDirectory(files);

      if (response.success) {
        const message =
          response.data?.message || "Directory processed successfully!";
        this.showStatus(message, "success");

        // Show detailed results if available
        if (response.data?.results && response.data.results.length > 0) {
          this.showDetailedResults(response.data.results);
        }

        $("#directory").val(""); // Clear directory input
        this.resetUploadDisplay();
        this.loadUploadedFiles(); // Refresh file list
      } else {
        throw new Error(
          `Directory upload failed with status ${response.status}: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("Directory upload failed:", error);
      this.handleUploadError(error);
    }
  }

  /**
   * Show detailed results from directory processing
   */
  showDetailedResults(results) {
    const successCount = results.filter((r) => r.status === "success").length;
    const errorCount = results.filter((r) => r.status === "error").length;

    let detailsHtml = `
      <div class="mt-2">
        <small class="text-success">✓ ${successCount} files processed successfully</small>
    `;

    if (errorCount > 0) {
      detailsHtml += `<br><small class="text-warning">⚠ ${errorCount} files had errors</small>`;
    }

    detailsHtml += "</div>";

    // Add details to the current status message
    setTimeout(() => {
      this.uploadStatus.find(".status-message").append(detailsHtml);
    }, 100);
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

    // Process data to get unique files with their file IDs
    const fileMap = new Map();

    data.forEach((item) => {
      if (item.file && item.file_id) {
        const filePath = item.file;
        const fileName = item.original_filename || filePath.split("/").pop();
        const fileId = item.file_id;

        if (!fileMap.has(fileId)) {
          fileMap.set(fileId, {
            path: filePath,
            fileId: fileId,
            fileName: fileName,
            wordCount: 1,
            original_name: item.original_filename,
          });
        } else {
          fileMap.get(fileId).wordCount += 1;
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
    fileMap.forEach((fileData, fileId) => {
      const fileName = fileData.fileName;
      const shortName =
        fileName.length > 35 ? fileName.substring(0, 32) + "..." : fileName;

      const row = `
        <tr data-filename="${fileName}" data-file-id="${fileId}" class="slide-up">
          <td><span class="badge bg-primary">${index}</span></td>
          <td title="${fileName}">
            <div class="d-flex align-items-center">
              <i class="bi bi-file-earmark-text text-primary me-2"></i>
              <span>${shortName}</span>
              <small class="text-muted ms-2">(${fileData.wordCount} words)</small>
            </div>
          </td>
          <td>
            <button class="btn-danger-modern delete-file" data-filename="${fileName}" data-file-id="${fileId}">
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
        const fileId = $(e.currentTarget).data("file-id");

        if (
          confirm(
            `Are you sure you want to delete "${fileName}"?\n\nThis will permanently delete the file and all its extracted words.`
          )
        ) {
          this.deleteFile(fileId, $(e.currentTarget).closest("tr"));
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
  async deleteFile(fileId, row) {
    const fileName = row.data("filename");

    this.showStatus(`Deleting ${fileName}...`, "info");

    try {
      const response = await this.apiClient.deleteFile(fileId);

      if (response.success) {
        this.showStatus(`${fileName} deleted successfully`, "success");
        row.remove();

        // Check if table is empty and update display
        const remainingRows =
          this.filesTableBody.find("tr[data-file-id]").length;
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
      } else {
        throw new Error(response.data?.msg || "Delete failed");
      }
    } catch (error) {
      console.error("Failed to delete file:", error);
      this.showStatus(`Error deleting ${fileName}: ${error.message}`, "danger");
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
    const rows = this.filesTableBody.find("tr[data-file-id]");
    if (rows.length === 0) {
      this.showStatus("No files to clear", "info");
      return;
    }

    if (
      !confirm(
        "Are you sure you want to delete all uploaded files?\n\nThis will permanently delete all files and their extracted words."
      )
    ) {
      return;
    }

    this.showStatus("Clearing all files...", "info");

    try {
      const response = await this.apiClient.clearAllFiles();

      if (response.success) {
        const message =
          response.data?.message || "All files cleared successfully";
        this.showStatus(message, "success");

        // Show detailed results if available
        if (
          response.data?.deleted_files &&
          response.data.deleted_files.length > 0
        ) {
          console.log("Deleted files:", response.data.deleted_files);
        }

        // Refresh the file list
        this.loadUploadedFiles();
      } else {
        throw new Error(response.data?.message || "Clear all failed");
      }
    } catch (error) {
      console.error("Failed to clear all files:", error);
      this.showStatus(`Error clearing files: ${error.message}`, "danger");
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

    // Auto-dismiss all notifications after 5 seconds
    setTimeout(() => {
      this.uploadStatus.find(".status-message").fadeOut();
    }, 5000);
  }
}

// Make FileManager available globally
window.FileManager = FileManager;
