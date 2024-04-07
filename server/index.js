const express = require('express');
const cors = require("cors");
//require('dotenv').config();
const app = express();
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:3001',"http://10.0.2.2:3000", '*']
}));
const port = 3000;

//const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
//twilio setup
const accountSID = 'AC00fa1891bd264775b197a6a959e836cb';
const authToken = '6c2574b04414b035ec6569058ef49d68';
const client = require('twilio')(accountSID, authToken);
app.use(express.json());

function generateRandomCode() {
    const min = 100000;
    const max = 999999;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Define a route that sends a response to the client
app.post('/generate', async (req, res) => {
    try {
        const { phoneNumber } = req.body;
        console.log(phoneNumber);
        const otp = generateRandomCode();
        await client.messages
            .create({
                body: 'Your OTP is ' + otp,
                from: '+15643330163',
                to: phoneNumber
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
