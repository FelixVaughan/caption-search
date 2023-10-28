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
      generate_session_locally: true,
      fetch: async (input, init) => {
        const url =
          typeof input === "string"
            ? new URL(input)
            : input instanceof URL
            ? input
            : new URL(input.url);

        // Transform the URL for use with our proxy.
        url.searchParams.set("__host", url.host);
        url.host = "localhost:4000";
        url.protocol = "http";
        //add path of proxy
        url.pathname = "/proxy";

        const headers = init?.headers
          ? new Headers(init.headers)
          : input instanceof Request
          ? input.headers
          : new Headers();

        // Serialize the headers as JSON and set them as a query parameter.
        url.searchParams.set("__headers", JSON.stringify([...headers]));

        if (input instanceof Request) {
          input.duplex = "half"; // This is specific to your code; you may omit it if not needed.
        }

        // Create a new Request object with the modified URL and headers.
        const request = new Request(
          url,
          input instanceof Request ? input : undefined
        );

        // Delete the 'user-agent' header from the request headers.
        headers.delete("user-agent");

        // Use the standard fetch function to send the modified request.
        return fetch(request, init ? { ...init, headers } : { headers });
      },
    });
  }
}

export default Youtube; // Export the class for use in other files
