const express = require("express");
const router = express.Router();
const JournalEntry = require("../models/JournalEntry");
const Trade = require("../models/Trade");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

// POST new journal entry
router.post("/", async (req, res) => {
    const { date, title, content, linkedTrades } = req.body;

    // Validate linked trades
    if (linkedTrades && linkedTrades.length > 0) {
        const tradeIds = linkedTrades.map(trade => trade._id);
        const existingTrades = await Trade.find({ _id: { $in: tradeIds }, date: new Date(date), userId: req.user.uid });

        if (existingTrades.length !== tradeIds.length) {
            return res.status(400).json({ message: "One or more linked trades not found for the selected date." });
        }
    }

    const newJournalEntry = new JournalEntry({ userId: req.user.uid, date, title, content, linkedTrades });
    try {
        const savedJournalEntry = await newJournalEntry.save();
        res.status(201).json(savedJournalEntry);
    } catch (err) {
        console.error("Error saving journal entry:", err);
        res.status(500).json({ message: "Error saving journal entry" });
    }
});

// GET all journal entries
router.get("/", async (req, res) => {
    try {
        const journalEntries = await JournalEntry.find({ userId: req.user.uid });
        res.json(journalEntries);
    } catch (err) {
        console.error("Error fetching journal entries:", err);
        res.status(500).json({ message: "Error fetching journal entries" });
    }
});

// PUT update journal entry
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const { date, title, content, linkedTrades } = req.body;

    // Validate linked trades
    if (linkedTrades && linkedTrades.length > 0) {
        const tradeIds = linkedTrades.map(trade => trade._id);
        const existingTrades = await Trade.find({ _id: { $in: tradeIds }, date: new Date(date), userId: req.user.uid });

        if (existingTrades.length !== tradeIds.length) {
            return res.status(400).json({ message: "One or more linked trades not found for the selected date." });
        }
    }

    try {
        const updatedJournalEntry = await JournalEntry.findOneAndUpdate(
            { _id: id, userId: req.user.uid },
            { date, title, content, linkedTrades },
            { new: true, runValidators: true }
        );
        if (!updatedJournalEntry) return res.status(404).json({ message: "Journal entry not found" });
        res.json(updatedJournalEntry);
    } catch (err) {
        console.error("Error updating journal entry:", err);
        res.status(500).json({ message: "Error updating journal entry" });
    }
});

// DELETE journal entry
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedJournalEntry = await JournalEntry.findOneAndDelete({ _id: id, userId: req.user.uid });
        if (!deletedJournalEntry) return res.status(404).json({ message: "Journal entry not found" });
        res.json({ message: "Journal entry deleted" });
    } catch (err) {
        console.error("Error deleting journal entry:", err);
        res.status(500).json({ message: "Error deleting journal entry" });
    }
});

module.exports = router;
