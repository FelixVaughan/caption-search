const transcripts = [];
document.addEventListener("DOMContentLoaded", function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    var currentTab = tabs[0];
    if (currentTab) {
      const url = new URL(currentTab.url);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get("v");
      if (videoId) {
        chrome.runtime.sendMessage(
          { type: "sendTranscripts", videoId },
          function (response) {
            const transcripts = response.transcripts;
            console.log(transcripts);
          }
        );
      }
    }
  });
});
