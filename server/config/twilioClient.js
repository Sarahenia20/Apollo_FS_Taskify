const twilio = require('twilio');

const accountSid = "ACad743f9ec26c7f2ded88dd5063430306";
const authToken = "42c76512e78e8adda78dca0d02510836";

console.log("Twilio client initialisé avec compte:", accountSid.substring(0, 5) + '...');

const client = new twilio(accountSid, authToken);

module.exports = client;