const { Innertube, UniversalCache } = require("youtubei.js");

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 *
 */

const createResponse = (statusCode, message) => ({
  statusCode,
  body: JSON.stringify(message),
});

const parseTranscriptObject = (transcriptObject) => {
  return transcriptObject.content.body.initial_segments.map((segment) => ({
    start_ms: segment.start_ms,
    end_ms: segment.end_ms,
    target_id: segment.target_id,
    text: segment?.snippet?.text || "",
    strike_through: segment?.snippet?.runs?.strike_through || false,
  }));
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
        let languageTranscript = await transcriptInfo.selectLanguage(language);
        return {
          language: languageTranscript.selectedLanguage,
          transcript: parseTranscriptObject(languageTranscript.transcript), // languageTranscript.transcript.content.body.initial_segments,
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
