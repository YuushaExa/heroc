const fs = require('fs').promises;
const path = require('path');

// Load the markdown-it library from the local file
const MarkdownIt = require('./libs/markdown-it'); // Adjust the path as necessary
const md = new MarkdownIt(); // Create an instance of markdown-it

const postsDirPath = path.join(__dirname, 'posts'); // Directory containing JSON and MD files

async function fetchPosts() {
    try {
        const allPosts = [];
        let totalPages = 0; // Total number of posts created

        // Generate 500,000 fake posts
        for (let i = 0; i < 50000; i++) {
            const title = `Post Title ${i + 1}`; // Generate a simple title
            const content = generateFakeContent(); // Generate random content
            const date = new Date().toISOString(); // Use current date for the post
            const folder = 'generated'; // Use a static folder for generated posts

            allPosts.push({ title, content, date, folder });
            totalPages++; // Increment total pages count
        }

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
    <div>${content}</div> 
</body>
</html>
`;

            await fs.writeFile(filePath, htmlContent);
        }));

        // After processing all posts, log the statistics
        console.log('--- Build Statistics ---');
        console.log(`Total Pages Created: ${totalPages}`);
        console.log(`Total Build Time: ${Date.now() - startTime} ms`); // Log total build time

    } catch (err) {
        console.error('Error:', err);
    }
}

// Function to generate fake content
function generateFakeContent() {
    const paragraphs = [];
    const numParagraphs = Math.floor(Math.random() * 5) + 1; // Random number of paragraphs (1 to 5)
    for (let i = 0; i < numParagraphs; i++) {
        const sentenceCount = Math.floor(Math.random() * 5) + 3; // Random number of sentences (3 to 7)
        const sentences = [];
        for (let j = 0; j < sentenceCount; j++) {
            sentences.push(generateRandomSentence());
        }
        paragraphs.push(sentences.join(' '));
    }
    return paragraphs.join('\n\n'); // Join paragraphs with double line breaks
}

// Function to generate a random sentence
function generateRandomSentence() {
    const words = Math.floor(Math.random() * 10) + 5; // Random number of words (5 to 15)
    const sentence = [];
    for (let i = 0; i < words; i++) {
        sentence.push(generateRandomWord());
    }
    return sentence.join(' ') + '.'; // Join words and add a period at the end
}

// Function to generate a random word
function generateRandomWord() {
    const length = Math.floor(Math.random() * 8) + 3; // Random word length (3 to 10)
    let word = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz'; // Characters to choose from
       for (let i = 0; i < length; i++) {
        word += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return word;
}

// Start the timer to measure build time
const startTime = Date.now();
fetchPosts();
