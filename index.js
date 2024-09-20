const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.get('/:hash', (req, res) => {
    const urlData = loadURLData();
    const hash = req.params.hash;

    if (urlData[hash]) {
        const entry = urlData[hash];

        // Check if the URL has reached its max clicks
        if (entry.clickCount >= entry.maxClicks) {
            return res.status(403).send('This URL has expired due to too many clicks.');
        }

        entry.clickCount++;

        // Save the updated click count
        saveURLData(urlData);

        // Redirect to the original URL
        return res.redirect(entry.originalURL);
    }

    return res.status(404).send('URL not found');
});

app.use(express.json());

// API to shorten a URL
app.post('/shorten', (req, res) => {
    const { originalURL } = req.body;

    if (!originalURL) {
        return res.status(400).send('URL is required.');
    }

    const shortenedURL = shortenURL(originalURL);
    res.send({ shortenedURL });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Shorten the URL, store it, and return the shortened version
function shortenURL(originalURL) {
    const urlData = loadURLData();

    // Generate a unique hash for the URL
    const hash = generateHashedURL(originalURL);

    // Store the original URL and set initial click count to 0
    urlData[hash] = {
        originalURL: originalURL,
        clickCount: 0,
        maxClicks: 5 // Limit to 5 clicks 
    };

    // Save the updated data
    saveURLData(urlData);

    // Return the hashed URL
    return `http://localhost:3000/${hash}`;
}

const fs = require('fs');
const dataFilePath = './urlData.json';

// Load URL data from a JSON file
function loadURLData() {
    if (fs.existsSync(dataFilePath)) {
        const rawData = fs.readFileSync(dataFilePath);
        return JSON.parse(rawData);
    }
    return {};
}

// Save URL data to the JSON file
function saveURLData(data) {
    fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
}

const crypto = require('crypto');

// Function to hash a URL using SHA-256
function generateHashedURL(originalURL) {
    const hash = crypto.createHash('sha256').update(originalURL).digest('hex');
    return hash;
}

