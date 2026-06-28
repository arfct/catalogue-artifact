const yaml = require("js-yaml");
const fs = require("fs");

module.exports = function () {
  const config = yaml.load(fs.readFileSync("catalogue.config.yml", "utf8"));
  config.media_base_url =
    config.stack === "cloudflare"
      ? (config.cloudflare?.r2_media_base_url || "").replace(/\/$/, "")
      : "/media";
  return config;
};
