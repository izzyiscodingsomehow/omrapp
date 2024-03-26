const express = require('express');
require('dotenv').config();
const app = express();
const port = 3000;
app.use(express.json());
const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

function generateRandomCode() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Define a route that sends a response to the client
app.get('/', async (req, res) => {
    try {
        const otp = generateRandomCode();
        await client.messages
            .create({
                body: 'Your OTP is ' + otp,
                from: '+15643330163',
                to: '+923284963416'
            })
            .then(message =>
                res.status(200).json({ message, otp })
            ).catch(error => {
                console.log(error);
                res.status(500).json({ message: 'Internal server error' });

            })
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
