import { api } from '../api.js';
import { Table } from 'console-table-printer';
import ora from 'ora';

export const listProfilesAction = async (options) => {
    const spinner = ora('Fetching profiles...').start();
    try {
        const response = await api.get('/api/profiles', { params: options });
        spinner.stop();
        
        const pTable = new Table();
        // Ensuring compatibility with the backend JSON structure
        const profiles = response.data.data || response.data;
        
        profiles.forEach(p => {
            pTable.addRow({ 
                ID: p.id, 
                Name: p.name, 
                Country: p.country_id, 
                Age: p.age 
            });
        });
        
        pTable.printTable();
    } catch (e) {
        spinner.fail('Error fetching profiles. Ensure your backend is running and you are logged in.');
        if (process.env.DEBUG) console.error(e);
    }
};