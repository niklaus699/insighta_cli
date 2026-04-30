import fs from 'fs';
import path from 'path';
import http from 'http';
import axios from 'axios';
import open from 'open';

const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.insighta', 'credentials.json');
const BASE_URL = process.env.INSIGHTA_API_URL || 'http://localhost:8000';

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
        const code = url.searchParams.get('code');
        
        if (code) {
            try {
                // Sentinel-style auth logic
                const resp = await axios.post(`${BASE_URL}/auth/github/callback`, { code });
                saveTokens(resp.data);
                res.end('Login successful! You can close this tab.');
                console.log('\n✅ Logged in successfully.');
                server.close();
                process.exit(0);
            } catch (e) {
                res.end('Auth failed.');
                console.error('Error during token exchange:', e.message);
                process.exit(1);
            }
        }
    }).listen(8001);

    console.log('Opening browser for GitHub Authentication...');
    await open(`${BASE_URL}/auth/github`);
};