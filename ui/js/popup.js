class TranscriptController {
  constructor() {
    this.concatenationIndexMap = [];
    this.transcripts = [];
    this.languages = [];
    this.concatenatedSnippets = "";
    this.selected = undefined;
    this.languageSelectElem = document.getElementById("language-dropdown");
    this.searchBar = document.getElementById("search-input");
    this.searchButton = document.getElementById("search-button");
  }

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
  }

  renderResults(results) {
    const resultsContainer = document.getElementById("results-container");
    resultsContainer.innerHTML = "";

    const createResultElement = (result) => {
      const resultElem = document.createElement("div");
      resultElem.className = "result";
      resultElem.innerHTML = `<div class="result-text">${this.concatenatedSnippets.substring(
        result.startIndex,
        result.endIndex
      )}</div><div class="result-time">${this.formatTime(
        result.time
      )}</div><div class="result-target-id">${result.targetId}</div>`;
      return resultElem;
    };

    results.forEach((result) => {
      console.log(result);
      // const resultElem = createResultElement(result);
      // resultsContainer.appendChild(resultElem);
    });
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
    let startPos = this.concatenatedSnippets.indexOf(substring, searchStartPos);

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
      startPos = this.concatenatedSnippets.indexOf(substring, searchStartPos);
    }
    return results;
  }

  getTranscripts() {
    return this.transcripts;
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

document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    if (currentTab) {
      const url = new URL(currentTab.url);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get("v");
      if (videoId) {
        vId = videoId;
        chrome.runtime.sendMessage(
          { type: "sendTranscripts", videoId },
          function (response) {
            controller.setTranscripts(response.transcripts);
            controller.handleStatus(response.status);
            console.log(controller);
          }
        );
      }
    }
  });
});

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.type === "asyncRes") {
    if (message.videoId === vId) {
      controller.setTranscripts(message.transcripts);
      controller.handleStatus(message.status);
      console.log(controller);
    }
  }
  sendResponse({ status: "completed" });
});

//test video https://www.youtube.com/watch?v=WbliHNs4q14
