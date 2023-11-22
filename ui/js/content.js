const backgroundFetchTranscripts = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");
  if (videoId) {
    chrome.runtime.sendMessage(
      { type: "fetchTranscripts", videoId },
      function (response) {
        if (response.fetch === "success") {
          console.log("Transcripts fetched successfully.");
        } else {
          console.log("Failed to fetch transcripts.");
        }
      }
    );
  }
};

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.type === "checkURL") {
    backgroundFetchTranscripts();
  }
  sendResponse({ status: "completed" });
});

backgroundFetchTranscripts();
