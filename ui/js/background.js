const requestUrl = "http://127.0.0.1:3333";
let transcripts = new Map();
let fetchStatuses = new Map(); // Initialize fetchStatuses as a Map

const MAX_SIZE = 15;

const enforceMapSizeCap = (...maps) => {
  maps.forEach((map) => {
    if (map.size > MAX_SIZE) {
      const excess = [...map.keys()].slice(0, map.size - MAX_SIZE);
      excess.forEach((key) => map.delete(key));
    }
  });
};

const messageHandler = async (message, sender, sendResponse) => {
  const videoId = message.videoId;
  if (message.type === "fetchTranscripts") {
    if (
      fetchStatuses.has(videoId) &&
      ["pending", "success"].includes(fetchStatuses.get(videoId))
    ) {
      return sendResponse({ fetch: fetchStatuses.get(videoId) });
    }
    try {
      fetchStatuses.set(videoId, "pending"); // Set status in the Map
      const videoUrl = `${requestUrl}?videoId=${videoId}`;
      const result = await fetch(videoUrl);
      if (result.status === 200) {
        let data = await result.json();
        data = data === "No transcript found" ? [] : data;
        transcripts.set(videoId, data);
        fetchStatuses.set(videoId, "success"); // Update status in the Map
      } else {
        fetchStatuses.set(videoId, "failure"); // Update status in the Map
      }
      chrome.runtime.sendMessage({
        type: "asyncRes",
        videoId,
        status: fetchStatuses.get(videoId),
        transcripts: transcripts.get(videoId) || [],
      });
      return sendResponse({ fetch: fetchStatuses.get(videoId) });
    } catch (err) {
      console.error(err);
      fetchStatuses.set(videoId, "failure"); // Set status in the Map
      return sendResponse({ fetch: "failure" });
    } finally {
      enforceMapSizeCap(transcripts, fetchStatuses);
    }
  }

  if (message.type === "sendTranscripts") {
    console.log(fetchStatuses.get(videoId));
    const videoTranscripts = transcripts.get(videoId) || [];
    sendResponse({
      transcripts: videoTranscripts,
      status: fetchStatuses.get(videoId),
    });
  }

  sendResponse({ message: "received" });
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
