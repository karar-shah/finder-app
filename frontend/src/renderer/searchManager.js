/**
 * Search Manager for handling word search operations
 */
class SearchManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.searchResults = $("#search-results");
    this.resultsTable = $("#results-table-container");
    this.resultsTableBody = $("#results-table-body");
  }

  /**
   * Initialize search manager
   */
  init() {
    this.setupEventHandlers();
  }

  /**
   * Setup event handlers for search operations
   */
  setupEventHandlers() {
    // Handle upload button click
    $("#upload-btn").on("click", () => {
      this.navigateToUpload();
    });

    // Handle search form submission
    $("form").on("submit", (e) => {
      e.preventDefault();
      this.handleSearch();
    });
  }

  /**
   * Handle search form submission
   */
  async handleSearch() {
    const searchWord = $("input[name='wordsearch']").val().trim();

    if (!searchWord) {
      this.showSearchMessage("Please enter a word to search for", "warning");
      return;
    }

    // Show loading state
    this.showSearchMessage(
      `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Searching for "${searchWord}"...`,
      "info"
    );

    // Disable search button during search
    const submitBtn = $('button[type="submit"]');
    submitBtn
      .prop("disabled", true)
      .html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Searching...'
      );

    const searchType = $('input[name="search_type"]:checked').val() || "exact";

    try {
      const response = await this.apiClient.searchWords(searchWord, searchType);

      if (response.success) {
        this.handleSearchSuccess(response.data, searchWord, searchType);
      } else {
        throw new Error(`Search failed with status ${response.status}`);
      }
    } catch (error) {
      console.error("Search failed:", error);
      this.handleSearchError(error);
    } finally {
      submitBtn
        .prop("disabled", false)
        .html('<i class="bi bi-search"></i> Search');
    }
  }

  /**
   * Handle successful search response
   */
  handleSearchSuccess(response, searchWord, searchType) {
    console.log("Search response:", response);

    if (!response.results || !Array.isArray(response.results)) {
      console.error("Invalid response format:", response);
      this.showSearchMessage("Invalid response from server", "danger");
      return;
    }

    const matches = response.results;

    if (matches.length === 0) {
      const searchTypeText =
        searchType === "contains"
          ? `containing "${searchWord}"`
          : `matching "${searchWord}" exactly`;

      this.showSearchMessage(`No words found ${searchTypeText}`, "warning");
      this.resultsTable.addClass("d-none");
      return;
    }

    // Process matches to get unique filenames
    const fileResults = this.processSearchResults(matches, searchWord);

    // Show search message with search type context
    const searchTypeText =
      searchType === "contains"
        ? `containing "${searchWord}"`
        : `matching "${searchWord}" exactly`;

    this.showSearchMessage(
      `Found words ${searchTypeText} in ${fileResults.size} file(s)`,
      "success"
    );

    // Populate results table
    this.displaySearchResults(fileResults);
  }

  /**
   * Process search results to group by filename
   */
  processSearchResults(matches, searchWord) {
    const fileResults = new Map();

    matches.forEach((item) => {
      if (item.file) {
        const filePath = item.file;
        // Use original filename if available, otherwise extract from file path
        const fileName = item.original_filename || filePath.split("/").pop();

        if (!fileResults.has(fileName)) {
          fileResults.set(fileName, {
            word: item.word,
            count: 1,
            exact: item.word.toLowerCase() === searchWord.toLowerCase(),
          });
        } else {
          fileResults.get(fileName).count++;
        }
      }
    });

    return fileResults;
  }

  /**
   * Display search results in table
   */
  displaySearchResults(fileResults) {
    this.resultsTableBody.empty();
    this.resultsTable.removeClass("d-none");

    fileResults.forEach((result, fileName) => {
      const shortName =
        fileName.length > 40 ? fileName.substring(0, 37) + "..." : fileName;

      const occurrenceText =
        result.count > 1
          ? `${result.count} occurrences`
          : `${result.count} occurrence`;

      const row = `
        <tr>
          <td>${result.word}</td>
          <td title="${fileName}">
            <span class="fw-medium">${shortName}</span>
            <span class="badge bg-secondary ms-2">${occurrenceText}</span>
          </td>
        </tr>`;
      this.resultsTableBody.append(row);
    });
  }

  /**
   * Handle search error
   */
  handleSearchError(error) {
    console.error("Search failed:", error);

    let errorMessage = "Error while searching. ";

    if (error.status === 0) {
      errorMessage +=
        "Cannot connect to server. Check if the backend is running.";
    } else if (error.status === 404) {
      errorMessage += "Search endpoint not found.";
    } else if (error.status === 500) {
      errorMessage += "Server error occurred.";
    } else {
      errorMessage += `Server returned status ${error.status || "unknown"}.`;
    }

    this.showSearchMessage(errorMessage, "danger");
  }

  /**
   * Navigate to upload page
   */
  navigateToUpload() {
    const isElectron = window.electronAPI && window.electronAPI.isElectron;

    if (isElectron && window.electronAPI) {
      window.location.href = "index.html";
    } else {
      window.open("index.html", "_self");
    }
  }

  /**
   * Helper function to show search messages
   */
  showSearchMessage(message, type) {
    this.searchResults.html(`
      <div class="alert alert-${type}" role="alert">
        ${
          type === "info"
            ? message
            : `<i class="bi bi-${this.getAlertIcon(type)} me-2"></i>${message}`
        }
      </div>
    `);
  }

  /**
   * Helper to get the appropriate Bootstrap icon for alert type
   */
  getAlertIcon(type) {
    switch (type) {
      case "success":
        return "check-circle";
      case "danger":
        return "exclamation-triangle";
      case "warning":
        return "exclamation-circle";
      default:
        return "info-circle";
    }
  }
}

// Make SearchManager available globally
window.SearchManager = SearchManager;
