const express = require("express");
const axios = require("axios");

const app = express();
app.use(express.json());

// Configuration
const PORT = 3000;
const OPENWA_API_URL = "http://localhost:2785/api";
const API_KEY = "dev-admin-key-12345";
const SESSION_ID = "b90a41b8-2b1e-43ca-bbca-d310d57a0265"; // Your session ID

app.post("/", async (req, res) => {
  console.log("CleverTap webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  try {
    // Process CleverTap payload and send WhatsApp message
    await processCleverTapEvent(req.body);
    
    return res.status(200).json({
      success: true,
      message: "Webhook received and processed"
    });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return res.status(500).json({
      success: false,
      message: "Error processing webhook"
    });
  }
});

// Process CleverTap event and send WhatsApp message
async function processCleverTapEvent(data) {
  // Extract phone number and message from CleverTap payload
  // Adjust this based on CleverTap's actual payload structure
  const phoneNumber = data.phone || data.mobile || data.user_phone;
  const message = data.message || data.content || data.text;

  if (!phoneNumber || !message) {
    console.log("Missing phone number or message in payload");
    return;
  }

  // Send WhatsApp message via OpenWA
  const chatId = phoneNumber.includes("@") ? phoneNumber : `${phoneNumber}@s.whatsapp.net`;
  
  await axios.post(
    `${OPENWA_API_URL}/sessions/${SESSION_ID}/messages/send-text`,
    {
      chatId: chatId,
      text: message
    },
    {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json"
      }
    }
  );

  console.log(`WhatsApp message sent to ${phoneNumber}`);
}

app.listen(PORT, () => {
  console.log(`Webhook server running on port ${PORT}`);
  console.log(`OpenWA API: ${OPENWA_API_URL}`);
  console.log(`Session ID: ${SESSION_ID}`);
});
