const fs = require('fs').promises;
const path = require('path');

const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON files

async function fetchPosts() {
    try {
        // Read all files in the posts directory
        const files = await fs.readdir(postsDirPath);
        
        // Filter for JSON files
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        const indexEntries = await Promise.all(jsonFiles.map(async (file) => {
            const jsonFilePath = path.join(postsDirPath, file);
            const data = await fs.readFile(jsonFilePath, 'utf8');
            const posts = JSON.parse(data);

            return Promise.all(posts.map(async (post) => {
                const { title, content, date } = post;
                const fileName = `${date.replace(/:/g, '-')}-${title.replace(/\s+/g, '-').toLowerCase()}.html`;
                const filePath = path.join(outputDirPath, fileName);

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

                await fs.writeFile(filePath, htmlContent);
                console.log(`Created post: ${fileName}`);
                return `<li><a href="${fileName}">${title}</a></li>`;
            }));
        }));

        // Flatten the indexEntries array
        const flattenedIndexEntries = indexEntries.flat();

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
        ${flattenedIndexEntries.join('\n')}
    </ul>
</body>
</html>
`;
        await fs.writeFile(path.join(__dirname, 'public', 'index.html'), indexContent.trim());
        console.log('Created index.html');
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchPosts();
