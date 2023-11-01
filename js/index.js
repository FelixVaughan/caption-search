import Youtube from "./youtube.js";

async function main() {
  const youtubeInstance = new Youtube("your_video_id");
  await youtubeInstance.init();
  // Do something with the initialized Youtube instance
}
main();
// const youtubeInstance = new Youtube("your_video_id");
// await youtubeInstance.init();

// youtubeInstance
//   .init()
//   .then(() => {
//     // Do something with the initialized Youtube instance
//   })
//   .catch((error) => {
//     console.error("Error initializing Youtube:", error);
//   });
