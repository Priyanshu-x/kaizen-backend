const express = require("express");
const router = express.Router();
const Transaction = require("../models/Transaction");
const Trade = require("../models/Trade");
const JournalEntry = require("../models/JournalEntry");
const verifyToken = require("../middleware/authMiddleware");

router.use(verifyToken);

router.post("/", async (req, res) => {
    try {
        const userId = req.user.uid;

        // update transactions
        const transactionResult = await Transaction.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: userId } }
        );

        // update trades
        const tradeResult = await Trade.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: userId } }
        );

        // update journal entries
        const journalResult = await JournalEntry.updateMany(
            { userId: { $exists: false } },
            { $set: { userId: userId } }
        );

        res.json({
            message: "Migration successful",
            transactionsUpdated: transactionResult.modifiedCount,
            tradesUpdated: tradeResult.modifiedCount,
            journalEntriesUpdated: journalResult.modifiedCount
        });

    } catch (error) {
        console.error("Migration failed:", error);
        res.status(500).json({ message: "Migration failed" });
    }
});

module.exports = router;
