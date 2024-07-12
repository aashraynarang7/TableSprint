JavaScript
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Enable CORS for frontend requests
require('dotenv').config(); // Load environment variables

const port = process.env.PORT || 5000;
const app = express();

app.use(cors()); // Enable CORS for all routes
app.use(bodyParser.json());

// Connect to database (replace with your database connection logic)
const db = require('./db'); // Import database connection

// Import routers
const authRouter = require('./routes/auth');
const protectedRouter = require('./routes/protected'); // Protected routes (replace with actual routes)

// Mount routers
app.use('/api/auth', authRouter);  // Mount auth routes under /api/auth
app.use('/api/protected', protectedRouter); // Mount protected routes under /api/protected (replace with actual path)

// Error handling middleware (optional)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});