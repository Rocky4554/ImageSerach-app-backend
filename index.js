import express from "express";
import mongoose from "mongoose";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import MongoStore from "connect-mongo";
import dotenv from "dotenv";
import serverless from "serverless-http";

// Load environment variables
dotenv.config();

// Import routes and passport config
import authRoutes from "./routes/authRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import "./config/passport.js";

const app = express();

// ===================
// 🧠 Connect to MongoDB
// ===================
let cached = global.mongoose;
if (!cached) cached = global.mongoose = { conn: null, promise: null };

async function connectDB() {
  if (cached.conn) return cached.conn;
  if (!cached.promise) {
    cached.promise = mongoose.connect(process.env.MONGODB_URI).then((mongoose) => mongoose);
  }
  cached.conn = await cached.promise;
  return cached.conn;
}
connectDB();

// ===================
// ⚙️ Middlewares
// ===================

app.set("trust proxy", 1); // Required for Vercel proxy

const allowedOrigins = [
  "https://image-serach-app-frontend.vercel.app",
  "http://localhost:5173",
];

// Dynamic CORS
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Access-Control-Allow-Credentials", "true");
  }
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===================
// 💾 Session Configuration
// ===================
app.use(
  session({
    secret: process.env.SESSION_SECRET || "fallback-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600, // Lazy session update every 24h
      crypto: {
        secret: process.env.SESSION_SECRET || "fallback-secret-key",
      },
    }),
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      secure: process.env.NODE_ENV === "production",
      domain: process.env.NODE_ENV === "production" ? ".vercel.app" : undefined,
    },
    proxy: true,
    name: "sessionId",
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ===================
// 🪵 Debug Logs (Optional in Prod)
// ===================
app.use((req, res, next) => {
  console.log("=== Request Debug ===");
  console.log("Method:", req.method);
  console.log("Path:", req.path);
  console.log("Origin:", req.headers.origin);
  console.log("Session ID:", req.sessionID);
  console.log("Is Authenticated:", req.isAuthenticated());
  console.log("Cookie Header:", req.headers.cookie);
  console.log("User:", req.user ? { id: req.user._id, email: req.user.email } : "None");
  console.log("==================");
  next();
});

// ===================
// 🚀 Routes
// ===================
app.use("/api/auth", authRoutes);
app.use("/api", searchRoutes);
app.use("/api", historyRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ===================
// ❌ Error Handling
// ===================
app.use((err, req, res, next) => {
  console.error("Server Error:", err);
  res.status(500).json({ error: "Internal Server Error", message: err.message });
});

// ===================
// 🧩 Serverless Export (Vercel)
// ===================
export const handler = serverless(app);
export default app;
