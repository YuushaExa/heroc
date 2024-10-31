const fs = require('fs');
const path = require('path');

// Path to the local JSON file
const jsonFilePath = path.join(__dirname, 'posts.json'); // Adjust the path if necessary

function fetchPosts() {
    // Read the JSON file
    fs.readFile(jsonFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading posts.json:', err);
            return;
        }

        try {
            const posts = JSON.parse(data); // Assuming the JSON is an array of posts

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
                const fileName = `${date.replace(/:/g, '-')}-${title.replace(/\s+/g, '-').toLowerCase()}.html`;
                const filePath = path.join(postsDir, fileName);

                const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <h1>${title}</h1>
    <p>${content}</p>
</body>
</html>
`;

                fs.writeFileSync(filePath, htmlContent);
                console.log(`Created post: ${fileName}`);

                // Add entry to index
                indexEntries.push(`<li><a href="${fileName}">${title}</a></li>`);
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
            fs.writeFileSync(path.join(__dirname, 'public', 'index.html'), indexContent.trim());
            console.log('Created index.html');
        } catch (parseError) {
            console.error('Error parsing JSON:', parseError);
        }
    });
}

fetchPosts();
