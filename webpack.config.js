const path = require("path");

module.exports = {
  entry: "./js/index.js", // Entry point of application
  output: {
    filename: "bundle.js", // Output file name
    path: path.resolve(__dirname, "dist"), // Output directory
  },
};
