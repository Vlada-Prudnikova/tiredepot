const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs").promises;

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware for parsing JSON data
app.use(bodyParser.json());

// Load tire inventory and sold tires data from files
let tireInventory = [];
let tiresSold = [];

const loadTireInventory = async () => {
  try {
    const data = await fs.readFile("tireInventory.json");
    tireInventory = JSON.parse(data);
  } catch (error) {
    console.error("Error loading tire inventory:", error);
  }
};

const loadTiresSold = async () => {
  try {
    const data = await fs.readFile("tiresSold.json");
    tiresSold = JSON.parse(data);
  } catch (error) {
    console.error("Error loading tires sold:", error);
  }
};

// Initialize tire inventory and sold tires data
loadTireInventory();
loadTiresSold();

// Middleware for saving tire inventory and sold tires data to files
const saveData = async (fileName, data) => {
  try {
    await fs.writeFile(fileName, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error(`Error saving ${fileName}:`, error);
  }
};

app.post("/api/add-tire", (req, res) => {
  const { brand, quantity, width, aspectRatio, rimDiameter } = req.body;
  const size = `${width}/${aspectRatio}R${rimDiameter}`;

  const existingTireIndex = tireInventory.findIndex(
    (tire) => tire.brand === brand && tire.size === size
  );
  if (existingTireIndex !== -1) {
    tireInventory[existingTireIndex].quantity += quantity;
  } else {
    tireInventory.push({ brand, quantity, size });
  }

  saveData("tireInventory.json", tireInventory);

  res.json({ message: "Tire added successfully." });
});

app.post("/api/sell-tire", (req, res) => {
  const { brand, quantity, width, aspectRatio, rimDiameter, sellNotes } =
    req.body;
  const size = `${width}/${aspectRatio}R${rimDiameter}`;

  const tireIndex = tireInventory.findIndex(
    (tire) => tire.brand === brand && tire.size === size
  );
  if (tireIndex !== -1) {
    if (tireInventory[tireIndex].quantity >= quantity) {
      tireInventory[tireIndex].quantity -= quantity;
      if (tireInventory[tireIndex].quantity === 0) {
        tireInventory.splice(tireIndex, 1);
      }

      const soldTires = {
        brand,
        quantity,
        width,
        aspectRatio,
        rimDiameter,
        sellNotes,
      };
      tiresSold.push(soldTires);

      saveData("tireInventory.json", tireInventory);
      saveData("tiresSold.json", tiresSold);

      res.json({ message: "Tire sold successfully." });
    } else {
      res.status(400).json({ message: "Insufficient quantity in inventory." });
    }
  } else {
    res.status(404).json({ message: "Tire not found in inventory." });
  }
});

app.get("/api/tire-inventory", (req, res) => {
  res.json(tireInventory);
});

app.get("/api/sold-tires", (req, res) => {
  res.json(tiresSold);
});

app.use(express.static("public")); // Serve static files from public directory

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
