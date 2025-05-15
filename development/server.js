const express = require('express');
const path = require('path');

const app = express();
const PORT = 9000;

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

// Serve index.js as plain text
app.get('/index.js', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.js'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});