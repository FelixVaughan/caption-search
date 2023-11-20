const backkgroundFetchTranscripts = async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const videoId = urlParams.get("v");
  if (videoId) {
    chrome.runtime.sendMessage(
      { type: "fetchTranscripts", videoId },
      function (response) {
        console.log("Response:", response);
      }
    );
  }
};

backkgroundFetchTranscripts();
