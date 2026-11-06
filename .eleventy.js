const site = require("./src/_data/site.json");

module.exports = function (eleventyConfig) {
  // Static files that must keep their original names.
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });
  eleventyConfig.addPassthroughCopy({ "src/_headers": "_headers" });
  eleventyConfig.addPassthroughCopy({ "src/robots.txt": "robots.txt" });
  eleventyConfig.addPassthroughCopy({ "src/site.webmanifest": "site.webmanifest" });
  eleventyConfig.addPassthroughCopy({ "src/.assetsignore": ".assetsignore" });
  // Google probes /favicon.ico before parsing <link rel="icon"> tags, so the
  // icon must also exist at the site root (a 404 there falls back to the globe).
  eleventyConfig.addPassthroughCopy({ "src/assets/favicons/favicon.ico": "favicon.ico" });

  eleventyConfig.addWatchTarget("src/assets/");

  eleventyConfig.addFilter("isoDate", (value) =>
    new Date(value).toISOString().slice(0, 10)
  );

  // Keep cache-busting query strings in one place (`src/_data/site.json`)
  // instead of repeating the version in every page template.
  eleventyConfig.addTransform("asset-version", function (content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;
    return content.replace(/\?v=\d{8}/g, `?v=${site.assetVersion}`);
  });

  return {
    dir: {
      input: "src",
      output: "public",
      includes: "_includes",
      data: "_data",
    },
    templateFormats: ["njk", "md", "html"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
};
