let transcripts = [];
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
            transcripts = response.transcripts;
            handleStatus(response.status);
            console.log(transcripts);
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
      transcripts = message.transcripts;
    }
  }
  sendResponse({ status: "completed" });
});
