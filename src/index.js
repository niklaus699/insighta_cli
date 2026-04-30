#!/usr/bin/env node
import { Command } from 'commander';
import { loginAction } from './auth.js';
import { listProfilesAction } from './commands/profiles.js';
import { whoamiAction } from './auth.js';

const program = new Command();

program
    .name('insighta')
    .description('Insighta Labs+ CLI Tool')
    .version('1.0.0');

program.command('login').action(loginAction);

program.command('profiles:list')
    .option('-g, --gender <type>', 'Filter by gender')
    .action(listProfilesAction);

program.command('whoami')
    .description('Check the current logged in user')
    .action(whoamiAction);

program.parse();