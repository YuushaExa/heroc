const fs = require('fs').promises;
const path = require('path');

const jsonFilePath = path.join(__dirname, 'posts.json');

async function fetchPosts() {
    try {
        const data = await fs.readFile(jsonFilePath, 'utf8');
        const posts = JSON.parse(data);

        const postsDir = path.join(__dirname, 'posts');
        await fs.mkdir(postsDir, { recursive: true });

        const indexEntries = await Promise.all(posts.map(async (post) => {
            const { title, content, date } = post;
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

            await fs.writeFile(filePath, htmlContent);
            console.log(`Created post: ${fileName}`);
            return `<li><a href="${fileName}">${title}</a></li>`;
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
