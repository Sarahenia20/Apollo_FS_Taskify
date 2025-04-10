var express = require('express');
const axios = require("axios");
const jwt = require('jsonwebtoken');
const UserModel = require('../../models/users');
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

 



//const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
//var bodyParser = require('body-parser');


const CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;

const getAcessToken = async (req, res) => {
    const { code } = req.query;

    try {
        const response = await axios.post('https://github.com/login/oauth/access_token', null, {
            params: {
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
            },
            headers: {
                'Accept': 'application/json',
            },
        });

        const { access_token } = response.data;
        res.json({ access_token });
    } catch (error) {
        console.error('Error getting access token:', error);
        res.status(500).send('Server Error');
    }
};

// Function to fetch user data from GitHub and return a JWT token
const getUsertData = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            return res.status(401).json({ error: "Authorization header missing" });
        }

        const token = authHeader.split(' ')[1];
        console.log("Token received:", token);

        const response = await axios.get('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        console.log(response.data)

        let userEmail = response.data.email;
        if (!userEmail) {
            const emailsResponse = await axios.get('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const primaryEmail = emailsResponse.data.find(email => email.primary && email.verified);
            userEmail = primaryEmail ? primaryEmail.email : null;
        }

        if (!userEmail) {
            return res.status(400).json({ error: "Email not available from GitHub" });
        }

        let user = await UserModel.findOne({ email: userEmail });
        if (!user) {
            user = new UserModel({
                fullName: response.data.name,
                email: userEmail,
                picture:response.data.avatar_url,
                roles: 'DESIGNER',
            });
            await user.save();
        }
        const usertok = await UserModel.findOne({ email: userEmail });

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
        console.error('Error fetching user data from GitHub:', error);
        res.status(500).json({ error: 'Server Error' });
    }
};

module.exports = { getAcessToken , getUsertData } ; 