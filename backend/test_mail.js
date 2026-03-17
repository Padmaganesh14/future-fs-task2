require("dotenv").config();
const nodemailer = require("nodemailer");

async function testMail() {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS
    }
  });

  try {
    console.log("Attempting to send test email...");
    console.log("User:", process.env.GMAIL_USER);
    console.log("Pass (masked):", process.env.GMAIL_PASS ? "****" + process.env.GMAIL_PASS.slice(-4) : "MISSING");
    
    const info = await transporter.sendMail({
      from: `"Test CRM" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "Test Email",
      text: "If you see this, Nodemailer is working!"
    });
    
    console.log("Message sent: %s", info.messageId);
    console.log("Success!");
  } catch (error) {
    console.error("Error occurred:", error);
  }
}

testMail();
