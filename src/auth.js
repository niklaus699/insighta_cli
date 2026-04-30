import fs from 'fs';
import path from 'path';
import http from 'http';
import axios from 'axios';
import open from 'open';
import dotenv from 'dotenv';
import ora from 'ora';
dotenv.config();

const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.insighta', 'credentials.json');
const BASE_URL = process.env.INSIGHTA_API_URL || 'https://web-production-8e847.up.railway.app';

export const saveTokens = (tokens) => {
    if (!fs.existsSync(path.dirname(CONFIG_PATH))) {
        fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
    }
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(tokens));
};

export const getTokens = () => {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_PATH));
};

export const loginAction = async () => {
    const server = http.createServer(async (req, res) => {
        const url = new URL(req.url, `http://${req.headers.host}`);
        
        // Grab the tokens the backend sent us
        const access_token = url.searchParams.get('access_token');
        const refresh_token = url.searchParams.get('refresh_token');
        
        if (access_token && refresh_token) {
            try {
                // Save them exactly as they are
                saveTokens({ access_token, refresh_token });
                
                res.end('Login successful! You can close this tab.');
                console.log('\n✅ Logged in successfully.');
                
                // Cleanup and exit
                server.close();
                process.exit(0);
            } catch (e) {
                res.end('Failed to save credentials.');
                console.error('Error saving tokens:', e.message);
                process.exit(1);
            }
        }
    }).listen(8001);

    console.log('Opening browser for GitHub Authentication...');
    // Request login with source=cli so the backend knows to send tokens back
    await open(`${BASE_URL}/auth/github?source=cli`);
};

export const whoamiAction = async () => {
    const tokens = getTokens();
    if (!tokens) {
        console.error('❌ Not logged in.');
        return;
    }

    const spinner = ora('Verifying session...').start();
    try {
        const response = await axios.get(`${BASE_URL}/api/me`, {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        
        spinner.stop();
        console.log(`\n👤 Logged in as: ${response.data.user_dict.username}`);
        console.log(`🔑 Role: ${response.data.user_dict.role}`);
        console.log(`📧 Email: ${response.data.user_dict.email}`);
    } catch (e) {
        spinner.fail('Session expired or invalid. Please login again.');
    }
};