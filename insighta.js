#!/usr/bin/env node
import { Command } from 'commander';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import http from 'http';
import open from 'open';
import { Table } from 'console-table-printer';
import ora from 'ora';
import { fileURLToPath } from 'url';

const program = new Command();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONFIG_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.insighta', 'credentials.json');
const BASE_URL = 'http://localhost:8000';

// --- Helpers ---
const saveTokens = (tokens) => {
    if (!fs.existsSync(path.dirname(CONFIG_PATH))) fs.mkdirSync(path.dirname(CONFIG_PATH));
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(tokens));
};

const getTokens = () => {
    if (!fs.existsSync(CONFIG_PATH)) return null;
    return JSON.parse(fs.readFileSync(CONFIG_PATH));
};

const api = axios.create({ baseURL: BASE_URL });
api.interceptors.request.use(config => {
    const tokens = getTokens();
    if (tokens) {
        config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
        config.headers['X-API-Version'] = '1';
    }
    return config;
});

// --- Commands ---
program
    .name('insighta')
    .description('Insighta Labs+ CLI Tool')
    .version('1.0.0');

program.command('login')
    .action(async () => {
        const server = http.createServer(async (req, res) => {
            const url = new URL(req.url, `http://${req.headers.host}`);
            const code = url.searchParams.get('code');
            
            if (code) {
                try {
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
        }).listen(8001); // Matches GitHub Callback URL

        console.log('Opening browser for GitHub Authentication...');
        await open(`${BASE_URL}/auth/github`);
    });

program.command('profiles:list')
    .option('-g, --gender <type>', 'Filter by gender')
    .action(async (options) => {
        const spinner = ora('Fetching profiles...').start();
        try {
            const response = await api.get('/api/profiles', { params: options });
            spinner.stop();
            const pTable = new Table();
            response.data.data.forEach(p => pTable.addRow({ ID: p.id, Name: p.name, Country: p.country_id, Age: p.age }));
            pTable.printTable();
        } catch (e) {
            spinner.fail('Error fetching profiles. Ensure you are logged in.');
        }
    });

program.parse();