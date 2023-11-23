class TranscriptController {
  constructor() {
    this.transcripts = [];
    this.languages = [];
    this.selectedTranscript = undefined;
  }

  setTranscripts(newTranscripts) {
    this.transcripts = newTranscripts;
    this.updateLanguages();
    this.updateLanguageDropdown();
    this.selectedTranscript = newTranscripts[0] || undefined;
  }

  updateLanguages() {
    this.languages = this.transcripts.map((t) => t.language);
  }

  updateLanguageDropdown() {
    const languageSelectElem = document.getElementById("language-dropdown");
    if (languageSelectElem) {
      languageSelectElem.innerHTML = "";
      this.languages.forEach((language) =>
        this.addOptionToDropdown(language, languageSelectElem)
      );
      this.addLanguageChangeListener(languageSelectElem);
    }
  }

  addOptionToDropdown(language, selectElement) {
    const optionElem = document.createElement("option");
    optionElem.value = language;
    optionElem.text = language;
    selectElement.appendChild(optionElem);
  }

  addLanguageChangeListener(selectElement) {
    selectElement.addEventListener("change", () => {
      const selectedLanguage = selectElement.value;
      this.selectedTranscript = this.transcripts.find(
        (t) => t.language === selectedLanguage
      );
      console.log(this.selectedTranscript);
    });
  }

  search(substring) {
    const results = this.selectedTranscript.transcript.filter((subtitle) =>
      subtitle.text.toLowerCase().includes(substring.toLowerCase())
    );
    console.log(results);
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
    const statusElement = document.getElementById("search-input");
    statusElement.placeholder =
      status === "success"
        ? "Search"
        : status === "failure"
        ? "No subtitles found"
        : "Fetching subtitles";
    if (status !== "success") {
      startAnimation(statusElement);
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
    }
  }
  sendResponse({ status: "completed" });
});
