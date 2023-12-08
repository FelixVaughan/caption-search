const backgroundFetchTranscripts = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  //get video id from querystring
  const videoId = urlParams.get("v");
  if (videoId) {
    chrome.runtime.sendMessage({ type: "fetchTranscripts", videoId });
  }
};

const seek = (milliseconds) => {
  let videoPlayer = document.querySelector("video");
  if (videoPlayer) {
    // Convert milliseconds to seconds and set the current time
    videoPlayer.currentTime = milliseconds / 1000;
  } else {
    console.error("YouTube video player not found");
  }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "checkURL") {
    //send message to background.js to fetch transcripts
    backgroundFetchTranscripts();
  }
  if (request.type === "seekTo") {
    //if popup sends a request to seek to a timestamp
    seek(request.time);
  }
  sendResponse({ status: "success" });
});

backgroundFetchTranscripts();
