/**
 * Search Manager for handling word search operations
 */
class SearchManager {
  constructor(apiClient) {
    this.apiClient = apiClient;
    this.searchResults = $("#search-results");
    this.resultsTable = $("#results-table-container");
    this.resultsTableBody = $("#results-table-body");
    this.searchLoading = $("#search-loading");
    this.noResults = $("#no-results");
    this.searchStats = $("#search-stats");
    this.totalMatches = $("#total-matches");
    this.filesFound = $("#files-found");
    this.resultsCountBadge = $("#results-count-badge");
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
    $("#search-form").on("submit", (e) => {
      e.preventDefault();
      this.handleSearch();
    });

    // Handle radio button changes
    $('input[name="search_type"]').on("change", () => {
      this.updateSearchPlaceholder();
    });

    this.updateSearchPlaceholder();
  }

  /**
   * Update search placeholder based on search type
   */
  updateSearchPlaceholder() {
    const searchType = $('input[name="search_type"]:checked').val();
    const placeholder =
      searchType === "contains"
        ? "Enter text to find within words..."
        : "Enter exact word to find...";
    $("#wordsearch").attr("placeholder", placeholder);
  }

  /**
   * Handle search form submission
   */
  async handleSearch() {
    const searchWord = $("#wordsearch").val().trim();

    if (!searchWord) {
      this.showNoResults("Please enter a word to search for");
      return;
    }

    // Show loading state
    this.showLoadingState(searchWord);

    // Disable search button during search
    const submitBtn = $('button[type="submit"]');
    submitBtn
      .prop("disabled", true)
      .html('<div class="loading-spinner"></div>Searching...');

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
        .html('<i class="bi bi-search me-1"></i>Search');
    }
  }

  /**
   * Show loading state
   */
  showLoadingState(searchWord) {
    this.hideAllStates();
    this.searchLoading.removeClass("d-none");
    this.searchLoading
      .find("p")
      .text(`Searching for "${searchWord}" in your files...`);
  }

  /**
   * Hide all result states
   */
  hideAllStates() {
    this.searchResults.addClass("d-none");
    this.resultsTable.addClass("d-none");
    this.searchLoading.addClass("d-none");
    this.noResults.addClass("d-none");
    this.searchStats.addClass("d-none");
    this.resultsCountBadge.addClass("d-none");
  }

  /**
   * Handle successful search response
   */
  handleSearchSuccess(response, searchWord, searchType) {
    console.log("Search response:", response);

    if (!response.results || !Array.isArray(response.results)) {
      console.error("Invalid response format:", response);
      this.showNoResults("Invalid response from server");
      return;
    }

    const matches = response.results;

    if (matches.length === 0) {
      const searchTypeText =
        searchType === "contains"
          ? `containing "${searchWord}"`
          : `matching "${searchWord}" exactly`;

      this.showNoResults(`No words found ${searchTypeText}`);
      return;
    }

    // Process matches to get unique filenames
    const fileResults = this.processSearchResults(matches, searchWord);

    // Show results
    this.displaySearchResults(fileResults, matches.length);
  }

  /**
   * Show no results state
   */
  showNoResults(message) {
    this.hideAllStates();
    this.noResults.removeClass("d-none");
    this.noResults.find("p").text(message);
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
  displaySearchResults(fileResults, totalMatches) {
    this.hideAllStates();

    this.resultsTableBody.empty();
    this.resultsTable.removeClass("d-none");

    // Update statistics
    this.updateSearchStats(totalMatches, fileResults.size);

    let rowIndex = 1;
    fileResults.forEach((result, fileName) => {
      const shortName =
        fileName.length > 35 ? fileName.substring(0, 32) + "..." : fileName;

      const row = `
        <tr class="slide-up">
          <td>
            <div class="d-flex align-items-center">
              <span class="badge bg-primary me-2">${result.word}</span>
              ${
                result.exact
                  ? '<i class="bi bi-check-circle text-success" title="Exact match"></i>'
                  : '<i class="bi bi-search text-info" title="Contains match"></i>'
              }
            </div>
          </td>
          <td title="${fileName}">
            <div class="d-flex align-items-center justify-content-between">
              <div>
                <i class="bi bi-file-earmark-text text-primary me-2"></i>
                <span class="fw-medium">${shortName}</span>
              </div>
            </div>
          </td>
        </tr>`;
      this.resultsTableBody.append(row);
      rowIndex++;
    });
  }

  /**
   * Update search statistics
   */
  updateSearchStats(totalMatches, filesFound) {
    this.totalMatches.text(totalMatches);
    this.filesFound.text(filesFound);
    this.resultsCountBadge.text(totalMatches).removeClass("d-none");
    this.searchStats.removeClass("d-none");
  }

  /**
   * Handle search error
   */
  handleSearchError(error) {
    console.error("Search failed:", error);

    let errorMessage = "Error while searching";

    if (error.status === 0) {
      errorMessage =
        "Cannot connect to server. Check if the backend is running.";
    } else if (error.status === 404) {
      errorMessage = "Search endpoint not found.";
    } else if (error.status === 500) {
      errorMessage = "Server error occurred during search.";
    } else {
      errorMessage = `Server returned status ${error.status || "unknown"}.`;
    }

    this.showNoResults(errorMessage);
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
}

// Make SearchManager available globally
window.SearchManager = SearchManager;
