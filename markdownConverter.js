// markdownConverter.js
function markdownToHtml(markdown) {
    // Simple Markdown to HTML conversion logic
    markdown = markdown.replace(/###### (.*)/g, '<h6>$1</h6>');
    markdown = markdown.replace(/##### (.*)/g, '<h5>$1</h5>');
    markdown = markdown.replace(/#### (.*)/g, '<h4>$1</h4>');
    markdown = markdown.replace(/### (.*)/g, '<h3>$1</h3>');
    markdown = markdown.replace(/## (.*)/g, '<h2>$1</h2>');
    markdown = markdown.replace(/# (.*)/g, '<h1>$1</h1>');
    markdown = markdown.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    markdown = markdown.replace(/\*(.*?)\*/g, '<em>$1</em>');
    markdown = markdown.replace(/\n/g, '<br>');
    return markdown;
}

// Export the function
module.exports = { markdownToHtml };
