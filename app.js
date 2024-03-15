const express = require('express');
const path = require('path'); // Correct import for the path module

const app = express();

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Dummy tire inventory data
let tireInventory = [
    { brand: 'Brand A', quantity: 10, size: '195/65R15' },
    { brand: 'Brand B', quantity: 8, size: '205/55R16' },
    // Add more tire inventory data as needed
];

// Dummy sold tires data
let soldTires = [];

// Middleware to log the path of the current endpoint being accessed
app.use((req, res, next) => {
    console.log(`Request received for path: ${req.path}`);
    next();
});

// Endpoint to fetch tire inventory data
app.get('/api/tire-inventory', (req, res) => {
    res.json(tireInventory);
});

// Endpoint to fetch sold tires data
app.get('/api/sold-tires', (req, res) => {
    res.json(soldTires);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
