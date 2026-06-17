const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

// Apply middleware to all routes
router.use(verifyToken);

// GET all transactions for the user
router.get("/", async (req, res) => {
    try {
        const transactions = await Transaction.find({ userId: req.user.uid });
        res.json(transactions);
    } catch (err) {
        console.error("Error fetching transactions:", err);
        res.status(500).json({ message: "Error fetching transactions" });
    }
});

// POST new transaction
router.post("/", async (req, res) => {
    const {
        date, source, amount, category, description, type,
        instrument, lotSize, buyingPrice, sellingPrice, entryTime, exitTime, tax, ruleFollowed
    } = req.body;

    // Validate amount based on type
    if (type === "expense" && amount > 0) {
        return res.status(400).json({ message: "Expense amount must be negative" });
    }
    if (type === "income" && amount < 0) {
        return res.status(400).json({ message: "Income amount must be positive" });
    }

    const newTransaction = new Transaction({
        userId: req.user.uid, // Link to user
        date, source, amount, category, description, type,
        instrument, lotSize, buyingPrice, sellingPrice, entryTime, exitTime, tax, ruleFollowed
    });
    try {
        const savedTransaction = await newTransaction.save();
        res.status(201).json(savedTransaction);
    } catch (err) {
        console.error("Error saving transaction:", err);
        res.status(500).json({ message: "Error saving transaction" });
    }
});

// PUT update transaction
router.put("/:id", async (req, res) => {
    const { id } = req.params;
    const {
        date, source, amount, category, description, type,
        instrument, lotSize, buyingPrice, sellingPrice, entryTime, exitTime, tax, ruleFollowed
    } = req.body;

    // Validate amount based on type if type is provided
    if (type === "expense" && amount > 0) {
        return res.status(400).json({ message: "Expense amount must be negative" });
    }
    if (type === "income" && amount < 0) {
        return res.status(400).json({ message: "Income amount must be positive" });
    }

    try {
        const updatedTransaction = await Transaction.findOneAndUpdate(
            { _id: id, userId: req.user.uid }, // Ensure user owns the transaction
            {
                date, source, amount, category, description, type,
                instrument, lotSize, buyingPrice, sellingPrice, entryTime, exitTime, tax, ruleFollowed
            },
            { new: true, runValidators: true }
        );
        if (!updatedTransaction) return res.status(404).json({ message: "Transaction not found or unauthorized" });
        res.json(updatedTransaction);
    } catch (err) {
        console.error("Error updating transaction:", err);
        res.status(500).json({ message: "Error updating transaction" });
    }
});

// DELETE transaction
router.delete("/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const deletedTransaction = await Transaction.findOneAndDelete({ _id: id, userId: req.user.uid });
        if (!deletedTransaction) return res.status(404).json({ message: "Transaction not found or unauthorized" });
        res.json({ message: "Transaction deleted" });
    } catch (err) {
        console.error("Error deleting transaction:", err);
        res.status(500).json({ message: "Error deleting transaction" });
    }
});

module.exports = router;
