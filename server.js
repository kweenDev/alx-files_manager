// server.js
/**
 * Entry point for the Express server.
 * Author: Refiloe Radebe
 * Date: 2025-01-24
 */

import express from 'express';
import routes from './routes/index';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON requests
app.use(express.json());

// Load routes
app.use(routes);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
