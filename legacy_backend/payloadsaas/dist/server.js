/**
 * Payload CMS Server
 * Simple express server for Payload CMS
 */
import path from 'path';
import { fileURLToPath } from 'url';
import payload from 'payload';
import config from './payload.config.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const start = async () => {
    // Initialize Payload with config
    await payload.init({
        config,
        onInit: async () => {
            payload.logger.info(`Payload Admin URL: ${process.env.PAYLOAD_PUBLIC_SERVER_URL || 'http://localhost:3020'}/admin`);
        },
    });
    payload.logger.info('Payload initialized. Serve via Next.js / Payload Cloud project.');
};
start().catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=server.js.map