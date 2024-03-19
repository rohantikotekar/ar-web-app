
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');

const app = express();
const port = 3000;

let currentSessionId = null; // Keep track of the current upload session ID

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Serve the index.html file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle file uploads
app.post('/upload', (req, res) => {
    const sessionId = uuidv4();
    currentSessionId = sessionId; // Set currentSessionId to the new sessionId
    const sessionDirectory = path.join(__dirname, 'uploads', sessionId);

    if (!fs.existsSync(sessionDirectory)) {
        fs.mkdirSync(sessionDirectory, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, sessionDirectory);
        },
        filename: (req, file, cb) => {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    const upload = multer({ storage: storage }).array('images');

    upload(req, res, async (err) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }

        // Execute the command-line tool binary
        try {
            await executeBinary(sessionDirectory);
            res.json({ message: 'Images uploaded and processed successfully!' });
        } catch (error) {
            console.error('Error executing binary:', error);
            res.status(500).json({ error: 'Error executing binary' });
        }
    });
});


// Function to execute the command-line tool binary
const executeBinary = async (sessionDirectory) => {
    const binaryPath = './public/HelloPhotogrammetry';

    const command = `${binaryPath} ${sessionDirectory} ${sessionDirectory}/output.usdz -d raw -o unordered -f high`;

    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                console.log(stdout);
                console.error(stderr);
                resolve();
            }
        });
    });
};

// Serve the generated .usdz file for download
app.get('/download', (req, res) => {
    const filePath = path.join(__dirname, 'uploads', currentSessionId, 'output.usdz');
    res.download(filePath);
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
