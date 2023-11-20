const requestUrl = "http://127.0.0.1:3333";
let transcripts = {};

const messageHandler = async (message, sender, sendResponse) => {
  const videoId = message.videoId;
  if (message.type === "fetchTranscripts") {
    if (transcripts[videoId]?.length || false) {
      return sendResponse({ fetch: "success" });
    }
    try {
      const videoUrl = `${requestUrl}?videoId=${videoId}`;
      const result = await fetch(videoUrl);
      if (result.status === 200) {
        let data = await result.json();
        data = data === "No Transcript Found" ? [] : data;
        transcripts[videoId] = data;
        return sendResponse({ fetch: "success" });
      }
      return sendResponse({ fetch: "failure" });
    } catch (err) {
      console.error(err);
      return sendResponse({ fetch: "failure" });
    }
  }

  if (message.type === "sendTranscripts") {
    if (transcripts[videoId]) {
      sendResponse({ transcripts: transcripts[videoId] });
    } else {
      sendResponse({ transcripts: [] });
    }
  }

  sendResponse({ message: "recieved" });
  return true; // Keep the message channel open for sendResponse
};

chrome.runtime.onMessage.addListener(messageHandler);

//todo delete entries from transcripts when tab is closed and transripts grow above a certain size (15)
