const { Innertube, UniversalCache } = require("youtubei.js");

const createResponse = (statusCode, message) => ({
  statusCode,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Credentials": true,
    "Content-Type": "application/json",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS,POST",
  },
  body: JSON.stringify(message),
});

const parseTranscriptObject = (transcriptObject) => {
  return transcriptObject.content.body.initial_segments.map(
    (segment) => ({
      start_ms: segment.start_ms,
      end_ms: segment.end_ms,
      target_id: segment.target_id,
      text: segment?.snippet?.text || "",
      strike_through: segment?.snippet?.runs?.strike_through || false,
    })
  );
};

const lambdaHandler = async (event) => {
  try {
    const youtube = await Innertube.create({
      cache: new UniversalCache(false),
    });

    const videoId = event.queryStringParameters.videoId;
    const info = await youtube.getInfo(videoId);
    const transcriptInfo = await info.getTranscript();

    const languageTranscripts = await Promise.all(
      transcriptInfo.languages.map(async (language) => {
        let languageTranscript = await transcriptInfo.selectLanguage(
          language
        );
        return {
          language: languageTranscript.selectedLanguage,
          transcript: parseTranscriptObject(
            languageTranscript.transcript
          ), // languageTranscript.transcript.content.body.initial_segments,
        };
      })
    );

    // If we want to filter or reduce the data in languageTranscripts, do it here before returning
    return createResponse(200, languageTranscripts);
  } catch (err) {
    console.error(err); // Only log the error details
    const message =
      err.message ===
      "Transcript panel not found. Video likely has no transcript."
        ? "No transcript found"
        : err.message;

    const statusCode = message === "No transcript found" ? 200 : 500;

    return createResponse(statusCode, message);
  }
};

module.exports = {
  lambdaHandler,
};

//strip /n and ♪
