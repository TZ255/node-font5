const { ShemdoeAssistant } = require('./functions/kbase');

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

router.post('/n8n/email', async(req, res)=> {
    try {
        const {email, senderName, senderAddress, labels} = req.body
        if(!email || !senderAddress) return res.status(404).json({ok: false, message: 'No email message'});

        //call assistant
        const response = await ShemdoeAssistant(senderAddress, email)

        res.status(200).json({ok: true, message: response})
        console.log(req.body)
    } catch (error) {
        console.error(error)
        return res.status(400).json({error: error?.message})
    }
})

module.exports = router