import Youtube from "./youtube.js";

// Your code to create and use the Youtube instance
const youtubeInstance = new Youtube("your_video_id");
youtubeInstance
  .init()
  .then(() => {
    // Do something with the initialized Youtube instance
  })
  .catch((error) => {
    console.error("Error initializing Youtube:", error);
  });
