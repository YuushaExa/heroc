const fs = require('fs').promises;
const path = require('path');
const { marked } = require('marked'); // Import the marked library

const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON and MD files

async function fetchPosts() {
    try {
        const allPosts = [];

        // Function to read JSON and MD files recursively
        async function readFiles(dir) {
            const files = await fs.readdir(dir, { withFileTypes: true });
            for (const file of files) {
                const filePath = path.join(dir, file.name);
                if (file.isDirectory()) {
                    // Recursively read subdirectories
                    await readFiles(filePath);
                } else if (file.isFile()) {
                    if (file.name.endsWith('.json')) {
                        // Read and parse JSON files
                        const data = await fs.readFile(filePath, 'utf8');
                        const posts = JSON.parse(data);
                        const folder = path.relative(postsDirPath, dir); // Get the folder name
                        allPosts.push(...posts.map(post => ({ ...post, folder }))); // Add folder info
                    } else if (file.name.endsWith('.md')) {
                        // Read Markdown files
                        const data = await fs.readFile(filePath, 'utf8');
                        const title = path.basename(file.name, '.md'); // Use the file name as the title
                        const folder = path.relative(postsDirPath, dir); // Get the folder name
                        const date = new Date().toISOString(); // Use current date for the post
                        const content = marked(data); // Convert Markdown to HTML
                        allPosts.push({ title, content, date, folder }); // Add post info
                    }
                }
            }
        }

        // Start reading from the posts directory
        await readFiles(postsDirPath);

        const outputDir = path.join(__dirname, 'public'); // Directly point to the public directory
        await fs.mkdir(outputDir, { recursive: true });

        const titleCount = {}; // Object to keep track of title occurrences

        await Promise.all(allPosts.map(async (post) => {
            const { title, content, folder } = post;
            const baseFileName = title.replace(/\s+/g, '-').toLowerCase(); // Base file name
            let fileName = `${baseFileName}.html`; // Start with the base file name
            let count = 1;

            // Check for duplicates and modify the file name if necessary
            while (titleCount[fileName]) {
                fileName = `${baseFileName}-${count}.html`; // Append counter to the file name
                count++;
            }

            titleCount[fileName] = true; // Mark this file name as used

            const folderPath = path.join(outputDir, folder); // Create a path for the folder
            await fs.mkdir(folderPath, { recursive: true }); // Ensure the folder exists

            const filePath = path.join(folderPath, fileName); // Full path for the HTML file

            const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
</head>
<body>
    <h1>${title}</h1>
    <div>${content}</div> <!-- Use a div to contain the converted Markdown -->
</body>
</html>
`;

            await fs.writeFile(filePath, htmlContent);
            
            // Log the relative URL instead of the full path
            const relativeUrl = `${folder}/${fileName}`;
            console.log(`Created post: ${relativeUrl}`);
        }));

    } catch (err) {
        console.error('Error:', err);
    }
}

fetchPosts();
