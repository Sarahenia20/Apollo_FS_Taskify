
const axios = require('axios');
const jwt = require('jsonwebtoken');
const UserModel = require('../../models/users');
//require('dotenv').config();
const dotenv = require('dotenv');
const fs = require('fs');

// Load .env (default environment)
if (fs.existsSync('.env')) {
    dotenv.config({ path: '.env' });
}

// Load .env.development (additional variables)
if (fs.existsSync('.env.development')) {
    dotenv.config({ path: '.env.development' });
}

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

const getAccessTokenGoogle = async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://oauth2.googleapis.com/token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                redirect_uri: REDIRECT_URI,
                grant_type: 'authorization_code',
            },
        });

        const { access_token } = response.data;
        res.json({ access_token });

       
    } catch (error) {
        console.error('Error getting Google access token:', error);
        res.status(500).send('Server Error');
    }
};
const getUserDataGoogle = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    console.log("Received Token:", token); // Debugging

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        const response = await axios.get('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const userData = response.data;
        console.log("User Data from Google:", userData); // Debugging

        let user = await UserModel.findOne({ email: userData.email });

        if (!user) {
            user = new UserModel({
                fullName: userData.name,
                email: userData.email,
                picture: userData.picture,
                roles: 'ENGINEER',
            });
            await user.save();
        }

        const usertok = await UserModel.findOne({ email: userData.email });
        
                const jwtToken = jwt.sign(
                    {
                        id: usertok._id,
                        fullName: usertok.fullName,
                        email: usertok.email,
                        picture:usertok.picture,
                        roles: usertok.roles,
                    },
                    process.env.PRIVATE_KEY,
                    { expiresIn: "1h" }
                );

                res.status(200).json({
                    message: "Success",
                    token: jwtToken,
                    user: usertok
                });;
    } catch (error) {
        console.error('Error fetching Google user data:', error.response?.data || error);
        res.status(500).send('Server Error');
    }
};

module.exports = { getAccessTokenGoogle, getUserDataGoogle };