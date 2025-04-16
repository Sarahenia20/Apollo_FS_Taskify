const twilio = require('twilio');

const client = new twilio(
  "ACad743f9ec26c7f2ded88dd5063430306",
  "42c76512e78e8adda78dca0d02510836"
);

client.messages
  .create({
    body: "Test depuis Node.js",
    from: "+12513104951",
    to: "+21699385385",
  })
  .then((message) => console.log("✅ Message SID:", message.sid))
  .catch((error) => console.error("❌ Erreur Twilio:", error));