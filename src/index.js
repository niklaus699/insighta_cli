#!/usr/bin/env node
import { Command } from 'commander';
import { loginAction } from './commands/login.js';
import { listProfilesAction } from './commands/profiles.js';

const program = new Command();

program
    .name('insighta')
    .description('Insighta Labs+ CLI Tool')
    .version('1.0.0');

program.command('login').action(loginAction);

program.command('profiles:list')
    .option('-g, --gender <type>', 'Filter by gender')
    .action(listProfilesAction);

program.parse();