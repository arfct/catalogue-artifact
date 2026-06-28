const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function (eleventyConfig) {
  // Load catalogue.config.yml as global data
  eleventyConfig.addGlobalData("site", () => {
    const config = yaml.load(fs.readFileSync("catalogue.config.yml", "utf8"));
    config.media_base_url =
      config.stack === "cloudflare"
        ? (config.cloudflare?.r2_media_base_url || "").replace(/\/$/, "")
        : "/media";
    return config;
  });

  // Resolve a media src to a root-relative or absolute URL
  eleventyConfig.addFilter("mediaUrl", function (src) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const base = (this.ctx?.site?.media_base_url || "/media").replace(/\/$/, "");
    return `${base}/${src}`;
  });

  // Resolve a media src to a fully absolute URL (required for og:image)
  eleventyConfig.addFilter("absoluteMediaUrl", function (src) {
    if (!src) return "";
    if (src.startsWith("http://") || src.startsWith("https://")) return src;
    const siteUrl = (this.ctx?.site?.url || "").replace(/\/$/, "");
    if (!siteUrl) return "";
    const base = this.ctx?.site?.stack === "cloudflare"
      ? (this.ctx?.site?.cloudflare?.r2_media_base_url || "").replace(/\/$/, "")
      : `${siteUrl}/media`;
    return `${base}/${src}`;
  });

  const isDev = process.env.ELEVENTY_ENV === "development";

  eleventyConfig.addCollection("entries", (api) => {
    if (isDev) {
      return [
        ...api.getFilteredByGlob("projects/*.md"),
        ...api.getFilteredByGlob("projects/_samples/*.md"),
      ].sort((a, b) => a.date - b.date);
    }
    return api.getFilteredByGlob("projects/[!_]*.md");
  });

  // Pass through static assets
  eleventyConfig.addPassthroughCopy("media");
  eleventyConfig.addPassthroughCopy("styles");

  // Watch for config and media changes
  eleventyConfig.addWatchTarget("catalogue.config.yml");
  eleventyConfig.addWatchTarget("media/");

  return {
    dir: {
      input: ".",
      includes: "_includes",
      data: "_data",
      output: "_site",
    },
    // Ignore files that aren't pages
    templateFormats: ["md", "njk", "html"],
  };
};
