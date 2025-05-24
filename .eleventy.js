module.exports = function(eleventyConfig) {
  // 静态文件复制
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/js");
  eleventyConfig.addPassthroughCopy("src/styles");
  eleventyConfig.addPassthroughCopy("src/manifest.json");
  eleventyConfig.addPassthroughCopy("src/service-worker.js");
  eleventyConfig.addPassthroughCopy("src/_headers");
  eleventyConfig.addPassthroughCopy("src/_redirects");

  // 自定义过滤器
  eleventyConfig.addFilter("shuffle", function(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  });

  eleventyConfig.addFilter("randomQuote", function(quotes) {
    return quotes[Math.floor(Math.random() * quotes.length)];
  });

  eleventyConfig.addFilter("dateFormat", function(date) {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  // 自定义短代码
  eleventyConfig.addShortcode("quote", function(text, author, translation) {
    return `
      <blockquote class="philosophical-quote" data-author="${author}">
        <p class="quote-text">${text}</p>
        ${translation ? `<p class="quote-translation">${translation}</p>` : ''}
        <cite class="quote-author">—— ${author}</cite>
      </blockquote>
    `;
  });

  // 监视文件变化
  eleventyConfig.addWatchTarget("src/styles/");
  eleventyConfig.addWatchTarget("src/js/");

  // 设置输入输出目录
  return {
    dir: {
      input: "src",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["njk", "md", "html"],
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk"
  };
}; 