/**
 * dedicated worker entry point
 */
require('dotenv').config();
const { setupWorker } = require('../lib/queue/worker');

console.log('👷 Documotion Auto-Submit Worker starting...');
setupWorker();

process.on('SIGTERM', () => process.exit(0));