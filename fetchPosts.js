const fs = require('fs');
const axios = require('axios');
const path = require('path');

// URL of the JSON data
const jsonUrl = 'posts.json'; // Replace with your JSON URL

async function fetchPosts() {
    try {
        const response = await axios.get(jsonUrl);
        const posts = response.data; // Assuming the JSON is an array of posts

        // Create a directory for posts if it doesn't exist
        const postsDir = path.join(__dirname, 'posts');
        if (!fs.existsSync(postsDir)) {
            fs.mkdirSync(postsDir);
        }

        // Create an array to hold the index entries
        const indexEntries = [];

        // Loop through each post and create a Markdown file
        posts.forEach(post => {
            const { title, content, date } = post; // Adjust based on your JSON structure
            const fileName = `${date.replace(/:/g, '-')}-${title.replace(/\s+/g, '-').toLowerCase()}.md`;
            const filePath = path.join(postsDir, fileName);

            const markdownContent = `---
title: "${title}"
date: "${date}"
---

${content}
`;

            fs.writeFileSync(filePath, markdownContent);
            console.log(`Created post: ${fileName}`);

            // Add entry to index
            indexEntries.push(`<li><a href="${filePath}">${title}</a></li>`);
        });

        // Create the index.html file
        const indexContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Blog Posts</title>
</head>
<body>
    <h1>Blog Posts</h1>
    <h2>Latest Posts</h2>
    <ul>
        ${indexEntries.join('\n')}
    </ul>
</body>
</html>
`;
        fs.writeFileSync(path.join(__dirname, 'index.html'), indexContent.trim());
        console.log('Created index.html');
    } catch (error) {
        console.error('Error fetching posts:', error);
    }
}

fetchPosts();
