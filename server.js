const express = require("express");
const cors = require("cors");
require("dotenv").config();
const connectDB = require("./config/db");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

const app = express();
const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per `window`
    message: "Too many requests from this IP, please try again after 15 minutes"
});
app.use("/api", limiter);

// CORS configuration restricted to frontend domains
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174"
].filter(Boolean);

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// Sanitize data
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// Routes
app.use("/api/transactions", require("./routes/transactions"));
app.use("/api/trades", require("./routes/trades"));
app.use("/api/journal-entries", require("./routes/journalEntries"));
app.use("/api/migrate", require("./routes/migration"));
app.use("/api/demo", require("./routes/demo"));

app.get("/", (req, res) => {
  res.json({ message: "Backend is running! Use /api/transactions for data." });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});