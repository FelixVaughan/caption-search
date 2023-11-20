document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    if (currentTab) {
      const url = new URL(currentTab.url);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get("v");
      if (videoId) {
        console.log(`Fetching transcripts for videoId: ${videoId}`);
        chrome.runtime.sendMessage(
          { type: "sendTranscripts", videoId },
          function (response) {
            console.log(response);
          }
        );
      }
    }
  });
});
