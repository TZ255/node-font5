const router = require('express').Router()

router.post('/API/whatsapp', async (req, res) => {
    console.log('Received WhatsApp message:', req.body)
    try {
        // Here you can process the incoming WhatsApp message
        // For example, you might want to save it to a database or send a response
        res.status(200).send('WhatsApp message received successfully')
    } catch (error) {
        console.error('Error processing WhatsApp message:', error)
        res.status(500).send('Internal Server Error')
    }
})

module.exports = router