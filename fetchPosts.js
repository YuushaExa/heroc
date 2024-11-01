const fs = require('fs').promises;
const path = require('path');

const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON files
const outputDir = path.join(__dirname, 'public'); // Output directory for HTML files

async function fetchPosts() {
    try {
        const allPosts = [];

        // Function to read JSON files recursively
        async function readJsonFiles(dir) {
            const files = await fs.readdir(dir, { withFileTypes: true });
            const readPromises = files.map(async (file) => {
                const filePath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    await readJsonFiles(filePath); // Recursively read subdirectories
                } else if (file.isFile() && file.name.endsWith('.json')) {
                    const data = await fs.readFile(filePath, 'utf8');
                    const posts = JSON.parse(data);
                    const folder = path.relative(postsDirPath, dir); // Get the folder name
                    allPosts.push(...posts.map(post => ({ ...post, folder }))); // Add folder info
                }
            });
            await Promise.all(readPromises); // Wait for all file reads to complete
        }

        // Start reading from the posts directory
        await readJsonFiles(postsDirPath);
        await fs.mkdir(outputDir, { recursive: true }); // Ensure output directory exists

        const indexEntries = await Promise.all(allPosts.map(async (post) => {
            const { title, content, date, folder } = post;
            const fileName = `${date.replace(/:/g, '-')}-${title.replace(/\s+/g, '-').toLowerCase()}.html`;
            const folderPath = path.join(outputDir, folder);
            await fs.mkdir(folderPath, { recursive: true }); // Ensure the folder exists

            const filePath = path.join(folderPath, fileName); // Full path for the HTML file

            const htmlContent = `
<!DOCTYPE html>
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
            const relativeUrl = `${folder}/${fileName}`;
            console.log(`Created post: ${relativeUrl}`);
            return `<li><a href="${relativeUrl}">${title}</a></li>`; // Link with folder structure
        }));

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
        await fs.writeFile(path.join(outputDir, 'index.html'), indexContent.trim());
        console.log('Created index.html');
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchPosts();
