const router = require('express').Router()
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

router.post('/API/whatsapp', async (req, res) => {
    const { From, To, Body, MessageType, ProfileName } = req.body

    console.log(req.body)
   
    // Send immediate response to Twilio
    res.status(200).send('OK');
   
    try {
        const message = await client.messages.create({
            body: `Vipi ${ProfileName},\n\nNamba yako ya WhatsApp ni ${From.replace('whatsapp:', '')} na umetuma ${MessageType}.\n\nUjumbe uliotumwa: "${Body}"\n\nAsante kwa kuwasiliana nasi!`,
            to: From, // whatsapp:+255711935460 (user who sent the message)
            from: 'whatsapp:+255757259678'
        });
        console.log(`Message sent successfully: ${message.sid}`);
        console.log(message)
    } catch (error) {
        console.error('Failed to send WhatsApp reply:', error.message);
    }
})

module.exports = router