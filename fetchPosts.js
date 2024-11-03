const fs = require('fs').promises;
const path = require('path');

// Load the markdown-it library from the local file
const MarkdownIt = require('./libs/markdown-it'); // Adjust the path as necessary
const md = new MarkdownIt(); // Create an instance of markdown-it
const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON and MD files
const MAX_CONCURRENT_WRITES = 200; // Maximum concurrent writes

async function fetchPosts() {
    try {
        const allPosts = [];
        let totalPages = 0;
        let paginatorPages = 0; // You can implement pagination logic if needed
        let nonPageFiles = 0; // Count of non-page files
        let staticFiles = 0; // Count of static files
        let processedImages = 0; // Count of processed images (if applicable)
        let aliases = 0; // Count of aliases (if applicable)
        let sitemaps = 0; // Count of sitemaps (if applicable)
        let cleaned = 0; // Count of cleaned files (if applicable)

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
                        totalPages += posts.length; // Increment total pages by the number of posts in the JSON file
                        nonPageFiles++; // Increment non-page files count
                    } else if (file.name.endsWith('.md')) {
                        // Read Markdown files
                        const data = await fs.readFile(filePath, 'utf8');
                        const title = path.basename(file.name, '.md'); // Use the file name as the title
                        const folder = path.relative(postsDirPath, dir); // Get the folder name
                        const date = new Date().toISOString(); // Use current date for the post
                        const content = md.render(data); // Convert Markdown to HTML using markdown-it
                        allPosts.push({ title, content, date, folder }); // Add post info
                        totalPages++; // Increment total pages count for Markdown files
                    } else {
                        staticFiles++; // Increment static files count for other file types
                    }
                }
            }
        }

        // Start reading from the posts directory
        await readFiles(postsDirPath);

        const outputDir = path.join(__dirname, 'public'); // Directly point to the public directory
        await fs.mkdir(outputDir, { recursive: true });

        const titleCount = {}; // Object to keep track of title occurrences
        // Function to write a single post to a file
        const writePost = async (post) => {
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
    <div>${content}</div> 
</body>
</html>
`;

            await fs.writeFile(filePath, htmlContent);

            // Log the relative URL
            const relativeUrl = `${folder}/${fileName}`;
            console.log(`Created post: ${relativeUrl}`);
        };

        // Process posts with limited concurrency
        const processPosts = async () => {
            for (let i = 0; i < allPosts.length; i += MAX_CONCURRENT_WRITES) {
                const chunk = allPosts.slice(i, i + MAX_CONCURRENT_WRITES);
                await Promise.all(chunk.map(writePost));
            }
        };

        // Start processing posts
        await processPosts();

        // After processing all posts, log the statistics
        console.log('--- Build Statistics ---');
        console.log(`Total Pages: ${totalPages}`);
        console.log(`Paginator Pages: ${paginatorPages}`);
        console.log(`Non-page Files: ${nonPageFiles}`);
        console.log(`Static Files: ${staticFiles}`);
        console.log(`Processed Images: ${processedImages}`);
        console.log(`Aliases: ${aliases}`);
        console.log(`Sitemaps: ${sitemaps}`);
        console.log(`Cleaned: ${cleaned}`);
        console.log(`Total Build Time: ${Date.now() - startTime} ms`); // Log total build time

    } catch (err) {
        console.error('Error:', err);
    }
}

// Start the timer to measure build time
const startTime = Date.now();
fetchPosts();
