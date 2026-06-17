const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const verifyToken = require("../middleware/authMiddleware");

// POST /api/demo/seed
// Seed dummy data for anonymous demo users
router.post("/seed", verifyToken, async (req, res) => {
    try {
        const userId = req.user.uid;
        
        // Security check: Only allow seeding if the user has no existing transactions
        // This prevents abuse of the endpoint to spam the database
        const existingCount = await Transaction.countDocuments({ userId });
        if (existingCount > 0) {
            return res.status(400).json({ error: "Account already has data" });
        }

        const now = new Date();
        const dummyTransactions = [
            // Day -4
            { date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000), source: "XAUUSD", amount: 250, category: "Trading", type: "income", instrument: "XAUUSD", lotSize: "0.2", buyingPrice: 2010.50, sellingPrice: 2013.00, entryTime: "08:30", exitTime: "09:45", tax: 3, ruleFollowed: true, userId },
            { date: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), source: "NIFTY50", amount: -1200, category: "Trading", type: "expense", instrument: "NIFTY50", lotSize: "50", buyingPrice: 22050, sellingPrice: 22026, entryTime: "09:30", exitTime: "10:15", tax: 45, ruleFollowed: false, userId },
            // Day -3
            { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), source: "BANKNIFTY", amount: 2400, category: "Trading", type: "income", instrument: "BANKNIFTY", lotSize: "15", buyingPrice: 47800, sellingPrice: 47960, entryTime: "09:15", exitTime: "10:30", tax: 60, ruleFollowed: true, userId },
            { date: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000), source: "GBPUSD", amount: -45, category: "Trading", type: "expense", instrument: "GBPUSD", lotSize: "0.5", buyingPrice: 1.2650, sellingPrice: 1.2641, entryTime: "11:00", exitTime: "11:30", tax: 0, ruleFollowed: true, userId },
            // Day -2
            { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), source: "RELIANCE", amount: 1500, category: "Trading", type: "income", instrument: "RELIANCE", lotSize: "100", buyingPrice: 2900.50, sellingPrice: 2915.50, entryTime: "09:30", exitTime: "14:30", tax: 55, ruleFollowed: true, userId },
            { date: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000 + 5 * 60 * 60 * 1000), source: "NAS100", amount: 450, category: "Trading", type: "income", instrument: "NAS100", lotSize: "2.0", buyingPrice: 17500, sellingPrice: 17522.5, entryTime: "14:30", exitTime: "15:45", tax: 5, ruleFollowed: true, userId },
            // Day -1
            { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), source: "HDFCBANK", amount: -500, category: "Trading", type: "expense", instrument: "HDFCBANK", lotSize: "200", buyingPrice: 1450.00, sellingPrice: 1447.50, entryTime: "10:00", exitTime: "10:15", tax: 20, ruleFollowed: false, userId },
            { date: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000 + 1 * 60 * 60 * 1000), source: "XAUUSD", amount: -200, category: "Trading", type: "expense", instrument: "XAUUSD", lotSize: "0.2", buyingPrice: 2025.00, sellingPrice: 2015.00, entryTime: "15:00", exitTime: "15:30", tax: 0, ruleFollowed: false, userId }, // Revenge trade
            // Day 0 (Today)
            { date: now, source: "NIFTY50", amount: 3200, category: "Trading", type: "income", instrument: "NIFTY50", lotSize: "100", buyingPrice: 22100, sellingPrice: 22132, entryTime: "09:20", exitTime: "11:00", tax: 85, ruleFollowed: true, userId },
            { date: new Date(now.getTime() + 2 * 60 * 60 * 1000), source: "US30", amount: 180, category: "Trading", type: "income", instrument: "US30", lotSize: "0.5", buyingPrice: 38100, sellingPrice: 38136, entryTime: "10:30", exitTime: "11:45", tax: 2, ruleFollowed: true, userId }
        ];

        await Transaction.insertMany(dummyTransactions);

        res.status(201).json({ message: "Demo data seeded successfully" });
    } catch (error) {
        console.error("Error seeding demo data:", error);
        res.status(500).json({ error: "Server error while seeding demo data" });
    }
});

module.exports = router;
