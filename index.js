#!/usr/bin/env node

import { fetchOnThisDayData } from './api.js';

process.on('SIGNINT', () => {
    console.log('\nGoodbye!');
    process.exit(0);
});

fetchOnThisDayData();