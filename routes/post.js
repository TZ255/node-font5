const router = require('express').Router()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/API/whatsapp', async (req, res) => {
    const { From, To, Body, WaId, SmsSid, MessageType, ProfileName, NumMedia, SmsMessageSid } = req.body
    
    // Send immediate response to Twilio
    res.status(200).send('OK');
    
    // Process the message
    const clientNum = From.replace('whatsapp:', '')
    const myNum = To.replace('whatsapp:', '')
    
    try {
        const message = await client.messages.create({
            body: `Vipi ${ProfileName},\n\nNamba yako ya WhatsApp ni ${clientNum} na umetuma ${MessageType}.\n\nUjumbe uliotumwa: "${Body}"\n\nAsante kwa kuwasiliana nasi!`,
            to: clientNum,
            from: myNum,
        });
        console.log(`Message sent successfully: ${message.sid}`, message);
    } catch (error) {
        console.error('Failed to send WhatsApp reply:', error.message);
        // Could log to monitoring service, database, etc. here
    }
})

module.exports = router