import express from 'express';
import apiRoutes from '../src/server/routes';

const app = express();
app.use(express.json());

console.log('[Vercel API] Handler initialized');

// API routes are already prefixed with /api in the server,
// but Vercel api/index.ts handles /api already.
// However, the routes in router are like /otp/send.
// If I use app.use('/api', apiRoutes), it will be /api/api/otp/send on Vercel
// (since Vercel maps api/index.ts to /api).
// So I should just mount it at /.

app.use('/', apiRoutes);

export default app;
