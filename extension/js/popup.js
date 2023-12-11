class TranscriptController {
  //Initialize field values and event listeners
  constructor() {
    this.transcripts = [];
    this.languages = [];
    this.concatenationIndexMap = [];
    this.concatenatedSnippets = "";
    this.selected = undefined;
    this.resultIndex = -1;
    this.MAX_HIGHLIGHT_LENGTH = 200;
    this.searchBar = document.getElementById("search-input");
    this.searchButton = document.getElementById("search-button");
    this.resultsCounter = document.getElementById("results-counter");
    this.resultsContainer = document.getElementById("results-container");
    this.languageSelectElem = document.getElementById("language-dropdown");
    this.caseToggle = document.getElementById("case-toggle");
    this.caseSensitive = false;
    this.caseToggle.addEventListener("click", this.handleCaseToggle.bind(this));
  }

  /**
   * Toggles the case sensitivity for searching.
   * @returns {void}
   */
  handleCaseToggle() {
    this.caseSensitive = !this.caseSensitive;
    this.caseToggle.classList.toggle("active-case");
    this.searchButton.click();
  }

  /**
   * Set avaialable video transcripts and default to english
   * @param {Array} newTranscripts - The new transcripts to set.
   * @returns {void}
   */
  setTranscripts(newTranscripts) {
    this.transcripts = newTranscripts;
    if (newTranscripts.length > 0) {
      const defaultTranscript = newTranscripts.find((t) => {
        return t.language.toLowerCase().indexOf("english") != -1;
      });
      const language =
        defaultTranscript?.language || newTranscripts[0].language;
      this.setSelectedTranscript(language);
    }
    this.updateLanguages();
  }

  /**
   * Sets the selected transcript based on the specified language.
   * Builds concatenated transcript string and corresponding index map.
   * @param {string} language - The language of the transcript to be selected.
   * @returns {void}
   */
  setSelectedTranscript(language) {
    const buildSearchData = () => {
      const delimiter = " ";
      this.concatenatedSnippets = "";
      this.concatenationIndexMap = [];

      //For each snippet text, append it to the concatenation string.
      //Store in the index map the start and end position along with the text's corresponding start time.
      this.selected.transcript.forEach((obj, index) => {
        let snippetText = obj.text;
        this.concatenatedSnippets += (index > 0 ? delimiter : "") + snippetText;
        this.concatenationIndexMap.push({
          startIndex: this.concatenatedSnippets.length - snippetText.length,
          endIndex: this.concatenatedSnippets.length,
          startTime: obj.start_ms,
          targetId: obj.target_id,
        });
      });
    };

    this.selected = this.transcripts.find((t) => t.language === language);
    buildSearchData();
    this.addSearchListeners();
  }

  /**
   * Adds event listeners for search functionality.
   * When the search bar value changes or the search button is clicked,
   * it triggers the search and renders the results.
   * Additionally, it adds a keydown event listener for handling key navigation.
   * @returns {void}
   */
  addSearchListeners() {
    const handleSearch = () => {
      const searchString = this.searchBar.value;
      const results = this.searchSelectedTranscript(searchString);
      this.renderResults(results);
    };

    this.searchBar.addEventListener("keyup", (event) => {
      if (event.key === "Enter") {
        handleSearch();
      }
    });

    this.searchButton.addEventListener("click", () => {
      handleSearch();
    });

    document.addEventListener("keydown", this.handleKeyNavigation.bind(this));
  }

  /**
   * Handles the change of the index for the highlighted result.
   * @param {number} newIndex - The new index value.
   * @returns {void}
   */
  handleIndexChange(newIndex) {
    const results = this.getHighlightedResultElements();
    if (
      this.resultIndex !== -1 &&
      this.resultIndex < results.length &&
      this.resultIndex != newIndex
    ) {
      //remove current selected if applicable
      results[this.resultIndex].classList.remove("selected-item");
    }

    this.resultIndex = newIndex;
    if (this.resultIndex < 0) {
      this.resultIndex = results.length - 1; // Wrap to last item
    } else if (this.resultIndex >= results.length) {
      this.resultIndex = 0; // Wrap to first item
    }
    results[this.resultIndex].classList.add("selected-item");
    results[this.resultIndex].scrollIntoView({
      block: "nearest",
      behavior: "smooth",
    });
    this.renderResultsIndex();
  }

  /**
   * render the current result index and total number of results
   * @returns {void}
   */
  renderResultsIndex() {
    this.resultsCounter.innerHTML = `${this.resultIndex + 1} of ${
      this.getHighlightedResultElements().length
    }`;
  }

  /**
   * @returns {void}
   */
  getHighlightedResultElements() {
    return Array.from(
      this.resultsContainer.getElementsByClassName("result-item-container")
    );
  }

  /**
   * Handles key navigation for the results and enter to seek.
   * @param {Event} event - The key event.
   * @returns {void}
   */
  handleKeyNavigation(event) {
    const results = this.getHighlightedResultElements();
    if (!results.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      let newIndex = this.resultIndex + (event.key === "ArrowDown" ? 1 : -1);
      this.handleIndexChange(newIndex);
    } else if (event.key === "Enter" && this.resultIndex >= 0) {
      results[this.resultIndex].click();
    }
  }

  /**
   * Creates a highlighted element for a given snippet.
   *
   * @param {string} snippet - The original snippet.
   * @param {number} start - The start index of the highlighted portion.
   * @param {number} end - The end index of the highlighted portion.
   * @param {number} time - The time associated with the snippet.
   * @param {number} index - The index of the snippet.
   * @returns {HTMLElement} - The created highlighted element.
   */
  createHighlightedElement(snippet, start, end, time, index) {
    const seekCallback = () => {
      chrome.tabs.sendMessage(currentTab.id, {
        type: "seekTo",
        time: Number(time),
      });
    };

    // Format milliseconds to a time string
    const formatMilliseconds = (milliseconds) => {
      const totalSeconds = Math.floor(milliseconds / 1000);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      const secondsStr = String(seconds).padStart(2, "0");
      let timeString = `${minutes}:${secondsStr}`;

      if (hours > 0) {
        const minutesStr = String(minutes).padStart(2, "0");
        timeString = `${hours}:${minutesStr}:${secondsStr}`;
      }

      return timeString;
    };
    // Get the three sections of the snippet and apply appropriate styling to the highlighted section then add time
    const prefix = snippet.substring(0, start);
    const suffix = snippet.substring(end);
    const highlightedSlice = snippet.substring(start, end);
    const highlightedSnippet =
      prefix +
      `<span class="highlighted-item">${highlightedSlice}</span>` +
      suffix +
      `<span class="result-time">${formatMilliseconds(time)}</span>`;

    const snippetElem = document.createElement("div");
    snippetElem.className = "result-item-container";
    snippetElem.innerHTML = highlightedSnippet;
    snippetElem.addEventListener("click", () => {
      this.handleIndexChange(index);
      seekCallback();
    });
    return snippetElem;
  }

  /**
   * Returns a highlighted snippet based on the provided result and index.
   * @param {Object} result - The result object containing startIndex and endIndex.
   * @param {number} index - The index of the snippet.
   * @returns {HTMLElement|null} - The highlighted snippet element or null if startIndex is greater than or equal to endIndex.
   */
  highlightedSnippet = (result, index) => {
    let { startIndex, endIndex } = result;
    if (startIndex >= endIndex) return null;

    // Calculate the remaining length to be add to the snippet for context
    const highlightLength = endIndex - startIndex;
    const remainingLength = this.MAX_HIGHLIGHT_LENGTH - highlightLength;
    if (remainingLength <= 0) {
      endIndex = startIndex + this.MAX_HIGHLIGHT_LENGTH;
    }
    const extraLength = Math.floor(remainingLength / 2);

    //find the word boundary for the start and end of the snippet
    const findBoundary = (index, text, extraLength, searchLeft) => {
      let boundary = index + (searchLeft ? -extraLength : extraLength);
      boundary = Math.max(0, Math.min(boundary, text.length));

      // Adjust to the nearest space if possible, within bounds
      while (boundary > 0 && boundary < text.length && text[boundary] !== " ") {
        boundary += searchLeft ? -1 : 1;
      }
      return boundary;
    };

    const startBoundary = findBoundary(
      startIndex,
      this.concatenatedSnippets,
      extraLength,
      true
    );
    const endBoundary = findBoundary(
      endIndex,
      this.concatenatedSnippets,
      extraLength,
      false
    );

    let snippet = this.concatenatedSnippets.substring(
      startBoundary,
      endBoundary
    );

    // Get relative highlight start and end index
    let relativeStartIndex = startIndex - startBoundary;
    let relativeEndIndex = endIndex - startBoundary;
    const highlightedSnippet = this.createHighlightedElement(
      snippet,
      relativeStartIndex,
      relativeEndIndex,
      result.time,
      index
    );
    return highlightedSnippet;
  };

  /**
   * Renders the results on the display.
   * @param {Array} results - The array of results to be rendered.
   * @returns {void}
   */
  renderResults(results) {
    this.resultsContainer.innerHTML = "";
    results.forEach((result, index) => {
      const resultElem = this.highlightedSnippet(result, index);
      this.resultsContainer.appendChild(resultElem);
    });
    this.renderResultsIndex();
  }

  /**
   * @returns {void}
   */
  updateLanguages() {
    this.languages = this.transcripts.map((t) => t.language);
    this.updateLanguageDropdown();
  }

  /**
   * Populates the select dropdown with available transcript languages.
   * Adds listeners to the dropdown to update the selected transcript.
   * @returns {void}
   */
  updateLanguageDropdown() {
    //Creates an option element for each language found in the transcripts
    const addOptionToDropdown = (language, selectElement) => {
      const optionElem = document.createElement("option");
      optionElem.value = language;
      optionElem.text = language;
      if (this.selected?.language === language) {
        optionElem.selected = true;
      }
      selectElement.appendChild(optionElem);
    };

    const addLanguageChangeListener = (selectElement) => {
      selectElement.addEventListener("change", () => {
        const selectedLanguage = selectElement.value;
        this.setSelectedTranscript(selectedLanguage);
      });
    };

    if (this.languages.length > 0) {
      this.languageSelectElem.innerHTML = "";
      this.languages.forEach((language) =>
        addOptionToDropdown(language, this.languageSelectElem)
      );
      addLanguageChangeListener(this.languageSelectElem);
    }
  }

  /**
   * Searches the selected transcript for a given substring.
   *
   * @param {string} substring - The substring to search for.
   * @returns {Array} - An array of objects containing the start index, end index, and time of each matching result.
   */
  searchSelectedTranscript(substring) {
    //dont be a derp
    if (substring === "") return [];
    let results = [];
    let searchStartPos = 0;
    let searchedSnippets = this.concatenatedSnippets;

    if (!this.caseSensitive) {
      substring = substring.toLowerCase();
      searchedSnippets = searchedSnippets.toLowerCase();
    }
    //iteratively find all instances of the substring in the concatenated snippets
    let startPos = searchedSnippets.indexOf(substring, searchStartPos);
    while (startPos !== -1) {
      const endPos = startPos + substring.length;
      //find the mapping that contains the start position
      const mapping = this.concatenationIndexMap.find((mapping) => {
        const { startIndex, endIndex } = mapping;
        return startIndex <= startPos && startPos < endIndex;
      });
      if (mapping) {
        let result = {
          startIndex: startPos,
          endIndex: endPos,
          time: mapping.startTime,
        };
        results.push(result);
      }
      // Move search start position past the current found position
      searchStartPos = startPos + 1;
      startPos = searchedSnippets.indexOf(substring, searchStartPos);
    }
    return results;
  }

  /**
   * Handles the status animation and display.
   * @param {string} status - The status of the subtitle fetching process
   * @returns {void}
   */
  handleStatus(status) {
    const startAnimation = (element) => {
      let dotCount = 0;
      animationInterval = setInterval(() => {
        element.placeholder = `Fetching subtitles${".".repeat(dotCount++ % 4)}`;
      }, 200);
    };
    clearInterval(animationInterval);
    if (status === "success") {
      this.searchBar.placeholder = "Search";
    } else if (["failure", "empty"].includes(status)) {
      this.searchBar.placeholder = "No subtitles found";
    } else {
      // Only start the animation if the status is not 'success' or 'failure'
      this.searchBar.placeholder = "Fetching subtitles";
      startAnimation(this.searchBar);
    }
  }

  /**
   * @param {Object} message - The message object.
   * @returns {void}
   */
  digestMessage(message) {
    this.setTranscripts(message.transcripts);
    this.handleStatus(message.status);
  }
}

let animationInterval;
const controller = new TranscriptController();
let vId = undefined;
let currentTab = undefined;

/*Listen for DOMContentLoaded event to get the current tab
and send a message to background.js to fetch transcripts
*/
document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    currentTab = tabs[0];
    if (currentTab) {
      const url = new URL(currentTab.url);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get("v");
      if (videoId) {
        vId = videoId;
        chrome.runtime.sendMessage(
          { type: "sendTranscripts", videoId },
          function (response) {
            controller.digestMessage(response);
          }
        );
      }
    }
  });
});

// Listen for incoming messages from background about received transcripts
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "asyncRes") {
    if (message.videoId === vId) {
      controller.digestMessage(message);
    }
  }
  sendResponse({ status: "success" });
});
