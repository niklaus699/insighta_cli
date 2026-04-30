import axios from 'axios';
import { getTokens } from './auth.js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.INSIGHTA_API_URL || 'https://web-production-8e847.up.railway.app';

export const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use(config => {
    const tokens = getTokens();
    if (tokens) {
        config.headers['Authorization'] = `Bearer ${tokens.access_token}`;
        config.headers['X-API-Version'] = '1';
    }
    return config;
});