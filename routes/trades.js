const express = require("express");
const router = express.Router();
const Trade = require("../models/Trade");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

// POST new trade
router.post("/", async (req, res) => {
    const { date, instrument, amount, description } = req.body;
    const newTrade = new Trade({ userId: req.user.uid, date, instrument, amount, description });
    try {
        const savedTrade = await newTrade.save();
        res.status(201).json(savedTrade);
    } catch (err) {
        console.error("Error saving trade:", err);
        res.status(500).json({ message: "Error saving trade" });
    }
});

// GET trades (with optional date filter)
router.get("/", async (req, res) => {
    try {
        const { date } = req.query;
        let query = { userId: req.user.uid };
        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setUTCHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setUTCHours(23, 59, 59, 999);
            query.date = { $gte: startOfDay, $lte: endOfDay };
        }
        const trades = await Trade.find(query);
        res.json(trades);
    } catch (err) {
        console.error("Error fetching trades:", err);
        res.status(500).json({ message: "Error fetching trades" });
    }
});

module.exports = router;
