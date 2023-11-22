const requestUrl = "http://127.0.0.1:3333";
let transcripts = {};
let fetchStatuses = {};
const messageHandler = async (message, sender, sendResponse) => {
  const videoId = message.videoId;
  if (message.type === "fetchTranscripts") {
    if (["pending", "success"].includes(fetchStatuses[videoId])) {
      return sendResponse({ fetch: fetchStatuses[videoId] });
    }
    try {
      fetchStatuses[videoId] = "pending";
      const videoUrl = `${requestUrl}?videoId=${videoId}`;
      const result = await fetch(videoUrl);
      if (result.status === 200) {
        let data = await result.json();
        data = data === "No transcript found" ? [] : data;
        transcripts[videoId] = data;
        fetchStatuses[videoId] = "success";
      } else fetchStatuses[videoId] = "failure";
      chrome.runtime.sendMessage({
        type: "asyncRes",
        videoId,
        status: fetchStatuses[videoId],
      });
      return sendResponse({ fetch: fetchStatuses[videoId] });
    } catch (err) {
      console.error(err);
      return sendResponse({ fetch: "failure" });
    }
  }

  if (message.type === "sendTranscripts") {
    console.log(fetchStatuses[videoId]);
    const videoTranscripts = transcripts[videoId] || []; // Use empty array as default
    sendResponse({
      transcripts: videoTranscripts,
      status: fetchStatuses[videoId],
    });
  }

  sendResponse({ message: "recieved" });
  return true; // Keep the message channel open for sendResponse
};

const tabEventHandler = (tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete") {
    //if page has finished loading
    chrome.tabs.sendMessage(tabId, { type: "checkURL" });
  }
};

chrome.runtime.onMessage.addListener(messageHandler);
chrome.tabs.onUpdated.addListener(tabEventHandler);

//TODO: delete entries from transcripts when tab is closed and transcripts grow above a certain size (15)
//TODO: delete entries from transcripts when video is deleted from history
