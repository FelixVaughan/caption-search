class TranscriptController {
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
    this.caseToggle.addEventListener("click", this.handleCaseToggle);
  }

  handleCaseToggle = () => {
    this.caseSensitive = !this.caseSensitive;
    this.caseToggle.classList.toggle("active-case");
    this.searchButton.click();
  };
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

  setSelectedTranscript(language) {
    const buildSearchData = () => {
      const delimiter = " ";
      this.concatenatedSnippets = "";
      this.concatenationIndexMap = [];
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

  handleIndexChange(newIndex) {
    const results = this.getHighlightedElements();
    if (
      this.resultIndex !== -1 &&
      this.resultIndex < results.length &&
      this.resultIndex != newIndex
    ) {
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

  renderResultsIndex() {
    this.resultsCounter.innerHTML = `${this.resultIndex + 1} of ${
      this.getHighlightedElements().length
    }`;
  }

  getHighlightedElements() {
    return Array.from(
      this.resultsContainer.getElementsByClassName("result-item-container")
    );
  }

  handleKeyNavigation(event) {
    const results = this.getHighlightedElements();
    if (!results.length) return;

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      let newIndex = this.resultIndex + (event.key === "ArrowDown" ? 1 : -1);
      this.handleIndexChange(newIndex);
    } else if (event.key === "Enter" && this.resultIndex >= 0) {
      results[this.resultIndex].click();
    }
  }

  createHighlightedElement = (snippet, start, end, time, index) => {
    const seekCallback = () => {
      chrome.tabs.sendMessage(currentTab.id, {
        type: "seekTo",
        time: Number(time),
      });
    };

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
    end = start === 0 && end + 1 < snippet.length ? end + 1 : end;
    const prefix = snippet.substring(0, start - 1);
    const suffix = snippet.substring(end - 1);
    const highlightedSlice = snippet.substring(start - 1, end - 1);
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
  };

  highlightedSnippet = (result, index) => {
    let { startIndex, endIndex } = result;
    if (startIndex >= endIndex) return null;
    const nearestSpace = (index, text, searchLeft = false) => {
      //check and set index if out of bounds
      if (index < 0) index = 0;
      if (index >= text.length) index = text.length - 1;
      while (index > 0 && index < text.length && text[index] !== " ") {
        index += searchLeft ? -1 : 1;
      }
      return index >= 0 && index < text.length ? index : -1;
    };

    const highlightLength = endIndex - startIndex;
    const remainingLength = this.MAX_HIGHLIGHT_LENGTH - highlightLength;
    if (remainingLength <= 0) {
      endIndex = startIndex + this.MAX_HIGHLIGHT_LENGTH;
    }
    const extraLength = Math.floor(remainingLength / 2);

    const startBoundary = nearestSpace(
      startIndex - extraLength,
      this.concatenatedSnippets
    );
    const endBoundary = nearestSpace(
      endIndex + extraLength,
      this.concatenatedSnippets,
      true
    );
    let snippet = this.concatenatedSnippets.substring(
      startBoundary,
      endBoundary
    );

    //get relative highlighh start and end index
    let relativeStartIndex = startIndex - startBoundary;
    let relativeEndIndex = endIndex - startBoundary;
    snippet = snippet.trim();
    const highlightedSnippet = this.createHighlightedElement(
      snippet,
      relativeStartIndex,
      relativeEndIndex,
      result.time,
      index
    );
    return highlightedSnippet;
  };

  renderResults(results) {
    this.resultsContainer.innerHTML = "";
    results.forEach((result, index) => {
      const resultElem = this.highlightedSnippet(result, index);
      this.resultsContainer.appendChild(resultElem);
    });
    this.renderResultsIndex();
  }

  updateLanguages() {
    this.languages = this.transcripts.map((t) => t.language);
    this.updateLanguageDropdown();
  }

  updateLanguageDropdown() {
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

  // Function to search for a substring across snippets
  searchSelectedTranscript(substring) {
    if (substring === "") return [];
    let results = [];
    let searchStartPos = 0;
    let searchedSnippets = this.concatenatedSnippets;
    if (!this.caseSensitive) {
      substring = substring.toLowerCase();
      searchedSnippets = searchedSnippets.toLowerCase();
    }
    let startPos = searchedSnippets.indexOf(substring, searchStartPos);
    while (startPos !== -1) {
      const endPos = startPos + substring.length;
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

  digestMessage(message) {
    this.setTranscripts(message.transcripts);
    this.handleStatus(message.status);
  }

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
}

let animationInterval;
const controller = new TranscriptController();
let vId = undefined;
let currentTab = undefined;

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

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "asyncRes") {
    if (message.videoId === vId) {
      controller.digestMessage(message);
    }
  }
  sendResponse({ status: "completed" });
});

//test video https://www.youtube.com/watch?v=WbliHNs4q14

//todo
//1. vertical overflow bug
