const fs = require('fs').promises;
const path = require('path');

const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON files

async function fetchPosts() {
    try {
        const allPosts = [];

        // Function to read JSON files recursively
        async function readJsonFiles(dir) {
            const files = await fs.readdir(dir, { withFileTypes: true });
            for (const file of files) {
                const filePath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    // Recursively read subdirectories
                    await readJsonFiles(filePath);
                } else if (file.isFile() && file.name.endsWith('.json')) {
                    // Read and parse JSON files
                    const data = await fs.readFile(filePath, 'utf8');
                    const posts = JSON.parse(data);
                    allPosts.push(...posts.map(post => ({ ...post, folder: path.relative(postsDirPath, dir) }))); // Add folder info
                }
            }
        }

        // Start reading from the posts directory
        await readJsonFiles(postsDirPath);

        const outputDir = path.join(__dirname, 'public'); // Directly point to the public directory
        await fs.mkdir(outputDir, { recursive: true });

        const indexEntries = await Promise.all(allPosts.map(async (post) => {
            const { title, content, date, folder } = post;
            const fileName = `${date.replace(/:/g, '-')}-${title.replace(/\s+/g, '-').toLowerCase()}.html`;
            const filePath = path.join(outputDir, fileName);

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
            // Create a link with the folder structure
            const folderPath = folder ? `${folder}/` : ''; // Add folder path if it exists
            return `<li><a href="${folderPath}${fileName}">${title}</a></li>`;
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
        await fs.writeFile(path.join(__dirname, 'public', 'index.html'), indexContent.trim());
        console.log('Created index.html');
    } catch (err) {
        console.error('Error:', err);
    }
}

fetchPosts();
