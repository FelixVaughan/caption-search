import { Innertube, UniversalCache } from "youtubei.js";

class Youtube {
  #videoId = null;
  #youtube = null;
  constructor(videoId) {
    this.#videoId = videoId; // Assign the videoId properly
  }

  async init() {
    this.#youtube = await Innertube.create({
      cache: new UniversalCache(false),
    });
  }
}

export default Youtube; // Export the class for use in other files
