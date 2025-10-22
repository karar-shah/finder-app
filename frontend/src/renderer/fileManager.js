/**
 * File Manager for handling file upload and management operations
 */
class FileManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.uploadStatus = $("#upload-status");
    this.filesTableBody = $("#files-table-body");
    this.progressPollingInterval = null;
    this.lastFileCount = 0;
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
    // Check if running in Electron
    this.isElectron =
      window.electronAPI && window.electronAPI.isElectron === true;

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

    // Handle file input change (only for web or fallback)
    $("#files").on("change", (e) => {
      this.handleFileSelection(e.target.files, "files");
    });

    // Handle directory input change (only for web or fallback)
    $("#directory").on("change", (e) => {
      this.handleFileSelection(e.target.files, "directory");
    });

    // Handle upload mode toggle
    $('input[name="upload-mode"]').on("change", (e) => {
      this.handleUploadModeChange(e.target.id);
    });

    // Remove any existing click handlers to prevent conflicts
    $("#upload-area").off("click");

    // If running in Electron, add click handler for upload area to trigger dialogs
    if (this.isElectron) {
      $("#upload-area").on("click", (e) => {
        const mode = $('input[name="upload-mode"]:checked').attr("id");
        if (mode === "directory-mode") {
          this.handleDirectoryDialogSelection();
        } else {
          this.handleFilesDialogSelection();
        }
      });
    }
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

      // If running in Electron, always use dialogs for better path handling
      if (this.isElectron) {
        const mode = $('input[name="upload-mode"]:checked').attr("id");
        if (mode === "directory-mode") {
          // Open the directory dialog
          this.handleDirectoryDialogSelection();
        } else {
          // Open the file dialog
          this.handleFilesDialogSelection();
        }
        return;
      }

      // Web fallback behavior (no full paths available)
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

      // If running in Electron, hide the file inputs (we'll use dialogs)
      if (this.isElectron) {
        filesInput.hide();
        directoryInput.hide();
      } else {
        // For web - hide files input
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
      }
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

      // If running in Electron, hide both inputs (we'll use dialogs)
      if (this.isElectron) {
        filesInput.hide();
        directoryInput.hide();
      } else {
        // For web - hide directory input
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
   * Handle directory selection using Electron dialog
   */
  async handleDirectoryDialogSelection() {
    try {
      const result = await this.apiClient.selectDirectoryDialog();

      if (result.canceled) {
        return;
      }

      // Store selected directory info for later upload
      this.selectedDirectory = result;

      const uploadArea = $("#upload-area");
      const dirName = result.directoryPath.split("/").pop();

      uploadArea
        .find(".file-upload-text")
        .html(`<strong>Directory selected:</strong> ${dirName}`);
      uploadArea
        .find(".file-upload-hint")
        .text(`${result.files.length} files found in directory`);
    } catch (error) {
      console.error("Error selecting directory:", error);
      this.showStatus("Error selecting directory: " + error.message, "danger");
    }
  }

  /**
   * Handle files selection using Electron dialog
   */
  async handleFilesDialogSelection() {
    try {
      const result = await this.apiClient.selectFilesDialog();

      if (result.canceled) {
        return;
      }

      // Store selected files for later upload
      this.selectedFiles = result.files;

      const uploadArea = $("#upload-area");
      const fileNames = result.files.map((f) => f.split("/").pop()).join(", ");

      uploadArea
        .find(".file-upload-text")
        .html(`<strong>${result.files.length} file(s) selected:</strong>`);
      uploadArea
        .find(".file-upload-hint")
        .text(
          fileNames.length > 50 ? fileNames.substring(0, 50) + "..." : fileNames
        );
    } catch (error) {
      console.error("Error selecting files:", error);
      this.showStatus("Error selecting files: " + error.message, "danger");
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
    let files;
    let fileCount;

    // Use selected files from dialog if available (Electron), otherwise use file input
    if (
      this.isElectron &&
      this.selectedFiles &&
      this.selectedFiles.length > 0
    ) {
      // Convert file paths to File objects for upload
      files = await this.convertFilePathsToFiles(this.selectedFiles);
      fileCount = files.length;
    } else {
      const fileInput = $("#files")[0];
      files = fileInput.files;
      fileCount = files ? files.length : 0;
    }

    if (!files || fileCount === 0) {
      this.showStatus("Please select at least one file to upload", "warning");
      return;
    }

    // Remove "No files uploaded yet" message if it exists
    this.clearNoFilesMessage();

    // Show uploading status with file count (won't auto-hide)
    if (fileCount === 1) {
      this.showStatus(
        `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing ${files[0].name}...`,
        "info",
        false
      );
    } else {
      this.showStatus(
        `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing 0/${fileCount} files...`,
        "info",
        false
      );
    }

    // Start progressive polling to show files as they're processed
    this.startProgressivePolling(fileCount);

    try {
      const response = await this.apiClient.uploadFiles(files);

      // Stop polling
      this.stopProgressivePolling();

      if (response.success) {
        // Final update of file list
        await this.loadUploadedFiles();

        $("#files").val(""); // Clear file input
        this.selectedFiles = null; // Clear selected files
        this.resetUploadDisplay();

        // Now show success message with results
        const results = response.data?.results || [];
        const successCount = results.filter(
          (r) => !r.error && r.status !== "skipped"
        ).length;
        const skippedCount = results.filter(
          (r) => r.status === "skipped"
        ).length;

        let message = `Successfully processed ${successCount} file${
          successCount !== 1 ? "s" : ""
        }`;
        if (skippedCount > 0) {
          message += `, skipped ${skippedCount} duplicate${
            skippedCount !== 1 ? "s" : ""
          }`;
        }

        this.showStatus(message, "success");
      } else {
        throw new Error(
          `Upload failed with status ${response.status}: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      // Stop polling on error
      this.stopProgressivePolling();
      console.error("Upload failed:", error);
      this.handleUploadError(error);
    }
  }

  /**
   * Convert file paths to File objects for upload (used in Electron)
   */
  async convertFilePathsToFiles(filePaths) {
    const filePromises = filePaths.map(async (filePath) => {
      return new Promise((resolve, reject) => {
        const fileName = filePath.split("/").pop();
        // Create a File-like object with the full path
        resolve({
          name: fileName,
          path: filePath, // This is the full absolute path
          // We'll read the file in the apiClient
        });
      });
    });

    return Promise.all(filePromises);
  }
  /**
   * Handle directory upload
   */
  async handleDirectoryUpload() {
    let files;
    let totalFiles;
    let directoryInfo;

    // Use selected directory from dialog if available (Electron)
    if (
      this.isElectron &&
      this.selectedDirectory &&
      this.selectedDirectory.files.length > 0
    ) {
      directoryInfo = this.selectedDirectory;
      files = directoryInfo.files;
      totalFiles = files.length;
    } else {
      const directoryInput = $("#directory")[0];
      files = directoryInput.files;
      totalFiles = files ? files.length : 0;
    }

    if (!files || totalFiles === 0) {
      this.showStatus("Please select a directory to upload", "warning");
      return;
    }

    // Remove "No files uploaded yet" message if it exists
    this.clearNoFilesMessage();

    // Show initial processing status (won't auto-hide)
    this.showStatus(
      `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing directory (${totalFiles} files found)...`,
      "info",
      false
    );

    // Start progressive polling to show files as they're processed
    this.startProgressivePolling(totalFiles);

    try {
      let response;

      // If using Electron dialog, call special upload method with full paths
      if (this.isElectron && directoryInfo) {
        response = await this.apiClient.uploadDirectoryWithPaths(directoryInfo);
      } else {
        response = await this.apiClient.uploadDirectory(files);
      }

      // Stop polling
      this.stopProgressivePolling();

      if (response.success) {
        const results = response.data?.results || [];
        const successCount = results.filter(
          (r) => r.status === "success"
        ).length;
        const skippedCount = results.filter(
          (r) => r.status === "skipped"
        ).length;
        const errorCount = results.filter((r) => r.status === "error").length;

        // Final update of file list
        await this.loadUploadedFiles();

        $("#directory").val(""); // Clear directory input
        this.selectedDirectory = null; // Clear selected directory
        this.resetUploadDisplay();

        // Now show detailed success message
        let message = `Successfully processed ${successCount} file${
          successCount !== 1 ? "s" : ""
        }`;
        if (skippedCount > 0) {
          message += `, skipped ${skippedCount} duplicate${
            skippedCount !== 1 ? "s" : ""
          }`;
        }
        if (errorCount > 0) {
          message += `, ${errorCount} error${errorCount !== 1 ? "s" : ""}`;
        }

        this.showStatus(message, successCount > 0 ? "success" : "warning");

        // Show detailed results if available
        if (results.length > 0) {
          this.showDetailedResults(results);
        }
      } else {
        throw new Error(
          `Directory upload failed with status ${response.status}: ${
            response.data?.message || "Unknown error"
          }`
        );
      }
    } catch (error) {
      // Stop polling on error
      this.stopProgressivePolling();
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
        // `original_filename` contains the full path or filename as stored by backend
        const originalPath =
          item.original_filename || filePath.split("/").pop();
        // Extract just the filename from the full path for display
        const fileName = originalPath.split("/").pop();
        const fileId = item.file_id;

        if (!fileMap.has(fileId)) {
          fileMap.set(fileId, {
            path: filePath,
            fileId: fileId,
            fileName: fileName,
            wordCount: 1,
            original_name: item.original_filename,
            original_path: originalPath,
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
      const originalPath = fileData.original_path;
      const shortName =
        fileName.length > 35 ? fileName.substring(0, 32) + "..." : fileName;

      // Use the same purple file icon for both single and directory uploads
      const iconClass = "bi-file-earmark-text text-primary";

      const row = `
        <tr data-filename="${fileName}" data-file-id="${fileId}" class="slide-up">
          <td><span class="badge bg-primary">${index}</span></td>
          <td>
            <div class="d-flex align-items-center">
              <span class="file-path-icon" data-path="${this.escapeHtml(
                originalPath
              )}">
                <i class="bi ${iconClass} me-2"></i>
              </span>
              <div class="file-info">
                <div class="file-name">${shortName}</div>
                <small class="text-muted">(${fileData.wordCount} words)</small>
              </div>
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

    // Initialize custom tooltips for file path icons
    this.initializePathTooltips();

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

    this.showStatus(`Deleting ${fileName}...`, "info", false); // Don't auto-hide

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

    this.showStatus("Clearing all files...", "info", false); // Don't auto-hide

    try {
      const response = await this.apiClient.clearAllFiles();

      if (response.success) {
        // Keep processing message while loading file list
        this.showStatus(
          '<span class="spinner-border spinner-border-sm me-2" role="status"></span>Updating file list...',
          "info",
          false
        );

        // Wait for file list to load before showing success
        await this.loadUploadedFiles();

        // Now show success message
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
   * @param {string} message - The message to display
   * @param {string} type - Type of message: 'success', 'info', 'warning', 'danger'
   * @param {boolean} autoHide - Whether to auto-hide the message after 5 seconds (default: true)
   */
  showStatus(message, type, autoHide = true) {
    const statusClass = `status-${type}`;
    this.uploadStatus.html(`
      <div class="status-message ${statusClass}">
        ${message}
      </div>
    `);
    this.uploadStatus.show();

    // Auto-hide success/info messages after 5 seconds only if autoHide is true
    if (autoHide && (type === "success" || type === "info")) {
      setTimeout(() => {
        this.uploadStatus.fadeOut();
      }, 5000);
    }
  }

  /**
   * Initialize custom tooltips for file path icons
   */
  initializePathTooltips() {
    $(".file-path-icon").on("mouseenter", function (e) {
      const path = $(this).data("path");
      const tooltip = $(`
        <div class="custom-tooltip">
          <div class="custom-tooltip-arrow"></div>
          <div class="custom-tooltip-inner">${path}</div>
        </div>
      `);

      $("body").append(tooltip);

      const iconRect = this.getBoundingClientRect();
      const tooltipWidth = tooltip.outerWidth();
      const tooltipHeight = tooltip.outerHeight();

      // Position tooltip above the icon
      const left = iconRect.left + iconRect.width / 2 - tooltipWidth / 2;
      const top = iconRect.top - tooltipHeight - 8;

      tooltip.css({
        left: `${left}px`,
        top: `${top}px`,
        opacity: 0,
      });

      // Fade in
      setTimeout(() => {
        tooltip.css({ opacity: 1 });
      }, 10);
    });

    $(".file-path-icon").on("mouseleave", function () {
      $(".custom-tooltip").remove();
    });
  }

  /**
   * Start progressive file list polling during upload
   */
  startProgressivePolling(expectedCount) {
    this.lastFileCount = this.filesTableBody.find("tr[data-file-id]").length;
    let processedCount = 0;

    this.progressPollingInterval = setInterval(async () => {
      try {
        // Check for new files without rebuilding the entire table
        const newFilesAdded = await this.checkAndAddNewFiles();

        if (newFilesAdded > 0) {
          processedCount += newFilesAdded;
          this.lastFileCount += newFilesAdded;

          // Update status with progress
          if (expectedCount > 0) {
            this.showStatus(
              `<span class="spinner-border spinner-border-sm me-2" role="status"></span>Processing: ${processedCount}/${expectedCount} files completed...`,
              "info",
              false
            );
          }
        }
      } catch (error) {
        console.error("Error polling file list:", error);
      }
    }, 2000); // Poll every 2 seconds
  }

  /**
   * Stop progressive polling
   */
  stopProgressivePolling() {
    if (this.progressPollingInterval) {
      clearInterval(this.progressPollingInterval);
      this.progressPollingInterval = null;
    }
  }

  /**
   * Check for new files and add them to the table without rebuilding
   * Returns the number of new files added
   */
  async checkAndAddNewFiles() {
    try {
      const response = await this.apiClient.getFilesList();

      if (!response.success || !response.data) {
        return 0;
      }

      // Parse response data
      let data = [];
      if (
        response.data &&
        response.data.data &&
        Array.isArray(response.data.data)
      ) {
        data = response.data.data;
      } else if (Array.isArray(response.data)) {
        data = response.data;
      }

      // Get currently displayed file IDs
      const existingFileIds = new Set();
      this.filesTableBody.find("tr[data-file-id]").each(function () {
        existingFileIds.add(parseInt($(this).data("file-id")));
      });

      // Build map of all files from response
      const fileMap = new Map();
      data.forEach((item) => {
        if (item.file && item.file_id) {
          const filePath = item.file;
          const originalPath =
            item.original_filename || filePath.split("/").pop();
          const fileName = originalPath.split("/").pop();
          const fileId = item.file_id;

          if (!fileMap.has(fileId)) {
            fileMap.set(fileId, {
              path: filePath,
              fileId: fileId,
              fileName: fileName,
              wordCount: 1,
              original_name: item.original_filename,
              original_path: originalPath,
            });
          } else {
            fileMap.get(fileId).wordCount += 1;
          }
        }
      });

      // Find new files that aren't in the current table
      let newFilesAdded = 0;
      fileMap.forEach((fileData, fileId) => {
        if (!existingFileIds.has(fileId)) {
          // This is a new file, append it to the table
          this.appendFileToTable(fileData, fileId);
          newFilesAdded++;
        }
      });

      // Update file count badge
      this.updateFileCount(existingFileIds.size + newFilesAdded);

      return newFilesAdded;
    } catch (error) {
      console.error("Error checking for new files:", error);
      return 0;
    }
  }

  /**
   * Append a single file to the table without rebuilding
   */
  appendFileToTable(fileData, fileId) {
    const fileName = fileData.fileName;
    const originalPath = fileData.original_path;
    const shortName =
      fileName.length > 35 ? fileName.substring(0, 32) + "..." : fileName;
    const iconClass = "bi-file-earmark-text text-primary";

    // Get current row count to determine index
    const currentRowCount = this.filesTableBody.find("tr[data-file-id]").length;
    const index = currentRowCount + 1;

    const row = `
      <tr data-filename="${fileName}" data-file-id="${fileId}" class="slide-up">
        <td><span class="badge bg-primary">${index}</span></td>
        <td>
          <div class="d-flex align-items-center">
            <span class="file-path-icon" data-path="${this.escapeHtml(
              originalPath
            )}">
              <i class="bi ${iconClass} me-2"></i>
            </span>
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

    // Re-initialize tooltips for the new row
    this.initializePathTooltips();

    // Add click handler for the new delete button
    this.filesTableBody
      .find(`button[data-file-id="${fileId}"]`)
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
   * Clear the "No files uploaded yet" message from the table
   */
  clearNoFilesMessage() {
    const noResultsRow = this.filesTableBody.find(".no-results").closest("tr");
    if (noResultsRow.length > 0) {
      noResultsRow.remove();
    }
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;",
    };
    return text.replace(/[&<>"']/g, (m) => map[m]);
  }
}

// Make FileManager available globally
window.FileManager = FileManager;
