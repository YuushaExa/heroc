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
        let totalPages = 0; // Total pages count
        let nonPageFiles = 0; // Count of non-page files
        let staticFiles = 0; // Count of static files

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
                        // Read and copy JSON files as raw files
                        const data = await fs.readFile(filePath, 'utf8');
                        const folder = path.relative(postsDirPath, dir); // Get the folder name
                        allPosts.push({ content: data, folder, isJson: true }); // Mark as JSON
                        totalPages++; // Increment total pages count for JSON files
                        nonPageFiles++; // Increment non-page files count
                    } else if (file.name.endsWith('.md')) {
                        // Read Markdown files
                        const data = await fs.readFile(filePath, 'utf8');
                        const folder = path.relative(postsDirPath, dir); // Get the folder name
                        const content = md.render(data); // Convert Markdown to HTML using markdown-it
                        allPosts.push({ content, folder }); // Add post info without title
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
// Function to format JSON content into HTML
const formatJson = (jsonString) => {
    try {
        const jsonData = JSON.parse(jsonString);
        return `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`; // Format JSON with indentation
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return '<p>Error parsing JSON data.</p>';
    }
};

// Function to write a single post to a file
const writePost = async (post, index) => {
    const { content, folder, isJson } = post;
    const fileName = `post-${index + 1}.html`; // Use incremental numbers for file names

    const folderPath = path.join(outputDir, folder); // Create a path for the folder
    await fs.mkdir(folderPath, { recursive: true }); // Ensure the folder exists

    const filePath = path.join(folderPath, fileName); // Full path for the file

    // Write HTML content for both JSON and Markdown files
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post ${index + 1}</title>
</head>
<body>
    <h1>Post ${index + 1}</h1>
    <div>${isJson ? formatJson(content) : content}</div> 
</body>
</html>
`;

    await fs.writeFile(filePath, htmlContent);
};

// The rest of your fetchPosts function remains unchanged

        // Function to write a single post to a file
  // Function to write a single post to a file
const writePost = async (post, index) => {
    const { content, folder, isJson } = post;
    const fileName = `post-${index + 1}.html`; // Use incremental numbers for file names

    const folderPath = path.join(outputDir, folder); // Create a path for the folder
    await fs.mkdir(folderPath, { recursive: true }); // Ensure the folder exists

    const filePath = path.join(folderPath, fileName); // Full path for the file

    // Write HTML content for both JSON and Markdown files
    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Post ${index + 1}</title>
</head>
<body>
    <h1>Post ${index + 1}</h1>
    <div>${isJson ? formatJson(content) : content}</div> 
</body>
</html>
`;

// Function to format JSON content into HTML
const formatJson = (jsonString) => {
    try {
        const jsonData = JSON.parse(jsonString);
        return `<pre>${JSON.stringify(jsonData, null, 2)}</pre>`; // Format JSON with indentation
    } catch (error) {
        console.error('Error parsing JSON:', error);
        return '<p>Error parsing JSON data.</p>';
    }
};

await fs.writeFile(filePath, htmlContent);
};


        // Process posts with limited concurrency
        const processPosts = async () => {
            for (let i = 0; i < allPosts.length; i += MAX_CONCURRENT_WRITES) {
                const chunk = allPosts.slice(i, i + MAX_CONCURRENT_WRITES);
                await Promise.all(chunk.map((post, index) => writePost(post, i + index)));
            }
        };

        // Start processing posts
        const startTime = Date.now();
        await processPosts();
        const endTime = Date.now();

        // Log the statistics
        console.log('--- Build Statistics ---');
        console.log(`Total Posts Created: ${allPosts.length}`);
        console.log(`Total Build Time: ${endTime - startTime} ms`); // Log total build time
               console.log(`Total JSON Files Processed: ${nonPageFiles}`);
        console.log(`Total Static Files Ignored: ${staticFiles}`);

    } catch (err) {
        console.error('Error:', err);
    }
}

// Start the fetchPosts function
fetchPosts();
