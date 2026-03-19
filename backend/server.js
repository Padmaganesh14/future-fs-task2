require("dotenv").config(); // Ensure dotenv is at the top of the file
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Lead = require("./models/Lead");
const Admin = require("./models/Admin");

const app = express();

// Middleware — allow frontend URL set via FRONTEND_URL env var (for Vercel)
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:4173',
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (mobile apps, curl, etc.)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json());

// MongoDB connection — lazy connect so Vercel serverless works correctly
let isConnected = false;
const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB Atlas Connected");
};

// Nodemailer Gmail Setup — credentials come from environment variables only
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,  // Set in Vercel env vars
    pass: process.env.GMAIL_PASS   // Set in Vercel env vars (App Password, no spaces)
  }
});

// Test route
app.get("/", (req, res) => {
  res.send("CRM Backend Working");
});

/* ================= AUTH ROUTES ================= */

// Send OTP / Signup
app.post("/signup", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    let admin = await Admin.findOne({ email });

    if (admin && admin.isVerified) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000); //

    if (admin) {
      admin.otp = otp;
      admin.otpExpires = otpExpires;
      admin.password = await bcrypt.hash(password, 10);
      await admin.save();
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      admin = new Admin({ email, password: hashedPassword, otp, otpExpires });
      await admin.save();
    }

    // Send Real Email
    await transporter.sendMail({
      from: `"Nexus CRM" <${process.env.GMAIL_USER}>`,
      to: email, // The admin's signing up email
      subject: "Your CRM Verification OTP",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 500px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #58a6ff;">Nexus CRM</h2>
          <p>Hello,</p>
          <p>You requested to create an Admin account. Please use the verification code below to complete your registration:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px; border-radius: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    res.json({ success: true, message: "OTP sent to your email! Please check your inbox." });
  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email. Check Nodemailer config." });
  }
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  try {
    await connectDB();
    const { email, otp } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(400).json({ success: false, message: "User not found" });
    if (admin.isVerified) return res.status(400).json({ success: false, message: "Already verified" });
    if (admin.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (admin.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP Expired" });

    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token, message: "Verification successful" });
  } catch (error) {
    console.error("Verify Error:\", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Admin Login
app.post("/login", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!admin.isVerified) return res.status(401).json({ success: false, message: "Account not verified." });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign({ id: admin._id, email: admin.email }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({ success: true, token, message: "Login successful", email: admin.email });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= LEAD ROUTES ================= */

// Add Lead
app.post("/add-lead", async (req, res) => {
  try {
    await connectDB();
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json({ message: "Lead added", lead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all leads
app.get("/leads", async (req, res) => {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update lead
app.put("/update-lead/:id", async (req, res) => {
  try {
    await connectDB();
    const updatedLead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ message: "Lead updated", lead: updatedLead });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete lead
app.delete("/delete-lead/:id", async (req, res) => {
  try {
    await connectDB();
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Lead deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// For local development only — Vercel does NOT use app.listen()
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// CRITICAL for Vercel — export app as serverless function
module.exports = app;
