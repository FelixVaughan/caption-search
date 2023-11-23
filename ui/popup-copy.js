let controller = {
  transcripts: [],
  languages: [],
  selectedTranscript: undefined,
  set(newTranscripts) {
    this.transcripts = newTranscripts;
    this.languages = newTranscripts.map((transcript) => transcript.language);
    if (this.languages.length > 0) {
      const languageSelectElem = document.getElementById("language-dropdown");
      languageSelectElem.innerHTML = ""; // Clear existing options

      this.languages.forEach((language) => {
        const optionElem = document.createElement("option");
        optionElem.value = language;
        optionElem.text = language;
        languageSelectElem.appendChild(optionElem);
      });

      this.selectedTranscript = this.transcripts[0];

      // Add change event listener to the select element
      languageSelectElem.addEventListener("change", () => {
        const selectedLanguage = languageSelectElem.value;
        this.selectedTranscript = this.transcripts.find(
          (transcript) => transcript.language === selectedLanguage
        );
        console.log(this.selectedTranscript);
      });
    }
  },
  get() {
    return this.transcripts;
  },
};

let vId = undefined;
let animationInterval;

const handleStatus = (status) => {
  const statusElement = document.getElementById("search-input");
  clearInterval(animationInterval); // Clear any existing animation

  if (status === "success") {
    statusElement.placeholder = "Search";
  } else if (status === "failure") {
    statusElement.placeholder = "No subtitles found";
  } else {
    statusElement.placeholder = "Fetching subtitles";
    startAnimation(statusElement);
  }
};

function startAnimation(element) {
  let dotCount = 0;
  animationInterval = setInterval(() => {
    element.placeholder = `Fetching subtitles${".".repeat(dotCount % 4)}`;
    dotCount++;
  }, 200);
}

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
            controller.set(response.transcripts);
            handleStatus(response.status);
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
      handleStatus(message.status);
      controller.set(message.transcripts);
    }
  }
  sendResponse({ status: "completed" });
});
