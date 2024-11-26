const express = require('express');
const connectDB = require('./config/db');
const perfumeRoutes = require('./routes/perfumeRoutes');

const app = express();

app.use(express.json());

connectDB();

app.use('/api/perfumes', perfumeRoutes);

const PORT = process.env.PORT || 5000;

const startServer = (port) => app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

startServer(PORT);

module.exports = { app, startServer };
