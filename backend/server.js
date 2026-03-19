require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const Lead = require("./models/Lead");
const Admin = require("./models/Admin");

const app = express();

/* ================= CORS ================= */

const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:4173",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

/* ================= DATABASE ================= */

let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB Atlas Connected");
};

/* ================= EMAIL SETUP ================= */

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

/* ================= TEST ROUTE ================= */

app.get("/", (req, res) => {
  res.send("CRM Backend Working");
});

/* ================= AUTH ROUTES ================= */

// SIGNUP + SEND OTP
app.post("/signup", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    let admin = await Admin.findOne({ email });

    if (admin && admin.isVerified) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60000);

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

    await transporter.sendMail({
      from: `"Nexus CRM" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Your CRM Verification OTP",
      text: `Your OTP is: ${otp}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: "OTP sent to your email!" });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

// VERIFY OTP
app.post("/verify-otp", async (req, res) => {
  try {
    await connectDB();
    const { email, otp } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(400).json({ success: false, message: "User not found" });
    if (admin.isVerified) return res.status(400).json({ success: false, message: "Already verified" });
    if (admin.otp !== otp) return res.status(400).json({ success: false, message: "Invalid OTP" });
    if (admin.otpExpires < new Date()) return res.status(400).json({ success: false, message: "OTP expired" });

    admin.isVerified = true;
    admin.otp = undefined;
    admin.otpExpires = undefined;
    await admin.save();

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, message: "Verification successful" });

  } catch (error) {
    console.error("Verify Error:", error); // ✅ FIXED
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// LOGIN
app.post("/login", async (req, res) => {
  try {
    await connectDB();
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) return res.status(401).json({ success: false, message: "Invalid credentials" });
    if (!admin.isVerified) return res.status(401).json({ success: false, message: "Account not verified" });

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) return res.status(401).json({ success: false, message: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ success: true, token, email: admin.email });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

/* ================= LEAD ROUTES ================= */

app.post("/add-lead", async (req, res) => {
  try {
    await connectDB();
    const lead = new Lead(req.body);
    await lead.save();
    res.status(201).json(lead);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/leads", async (req, res) => {
  try {
    await connectDB();
    const leads = await Lead.find().sort({ createdAt: -1 });
    res.json(leads);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put("/update-lead/:id", async (req, res) => {
  try {
    await connectDB();
    const updated = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete("/delete-lead/:id", async (req, res) => {
  try {
    await connectDB();
    await Lead.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ================= SERVER ================= */

if (process.env.NODE_ENV !== "production") {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
