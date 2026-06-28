const isDev = process.env.ELEVENTY_ENV === "development";

module.exports = isDev
  ? {}
  : { permalink: false, eleventyExcludeFromCollections: true };
