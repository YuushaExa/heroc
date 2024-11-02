const fs = require('fs').promises;
const path = require('path');

const MAX_CONCURRENT_WRITES = 100; // Adjust this number based on your system's capabilities

async function fetchPosts() {
    try {
        const allPosts = [];
        let totalPages = 0;

        // Generate 500,000 fake posts
        for (let i = 0; i < 100000; i++) {
            const title = `Post Title ${i + 1}`;
            const content = generateFakeContent();
            const date = new Date().toISOString();
            const folder = 'generated';

            allPosts.push({ title, content, date, folder });
            totalPages++;
        }

        const outputDir = path.join(__dirname, 'public');
        await fs.mkdir(outputDir, { recursive: true });

        const titleCount = {};

        // Function to write a single post
        const writePost = async (post) => {
            const { title, content, folder } = post;
            const baseFileName = title.replace(/\s+/g, '-').toLowerCase();
            let fileName = `${baseFileName}.html`;
            let count = 1;

            while (titleCount[fileName]) {
                fileName = `${baseFileName}-${count}.html`;
                count++;
            }

            titleCount[fileName] = true;

            const folderPath = path.join(outputDir, folder);
            await fs.mkdir(folderPath, { recursive: true });

            const filePath = path.join(folderPath, fileName);
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
        };

        // Process posts with limited concurrency
        const processPosts = async () => {
            for (let i = 0; i < allPosts.length; i += MAX_CONCURRENT_WRITES) {
                const chunk = allPosts.slice(i, i + MAX_CONCURRENT_WRITES);
                await Promise.all(chunk.map(writePost));
            }
        };

        await processPosts();

        console.log('--- Build Statistics ---');
        console.log(`Total Pages Created: ${totalPages}`);
        console.log(`Total Build Time: ${Date.now() - startTime} ms`);

    } catch (err) {
        console.error('Error:', err);
    }
}

// Function to generate fake content
function generateFakeContent() {
    const paragraphs = [];
    const numParagraphs = Math.floor(Math.random() * 5) + 1;
    for (let i = 0; i < numParagraphs; i++) {
        const sentenceCount = Math.floor(Math.random() * 5) + 3;
        const sentences = [];
        for (let j = 0; j < sentenceCount; j++) {
            sentences.push(generateRandomSentence());
        }
        paragraphs.push(sentences.join(' '));
    }
    return paragraphs.join('\n\n');
}

// Function to generate a random sentence
function generateRandomSentence() {
    const words = Math.floor(Math.random() * 10) + 5;
    const sentence = [];
    for (let i = 0; i < words; i++) {
        sentence.push(generateRandomWord());
    }
    return sentence.join(' ') + '.';
}

// Function to generate a random word
function generateRandomWord() {
    const length = Math.floor(Math.random() * 8) + 3;
    let word = '';
    const characters = 'abcdefghijklmnopqrstuvwxyz';
    for (let i = 0; i < length; i++) {
               word += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return word;
}

// Start the timer to measure build time
const startTime = Date.now();
fetchPosts();
