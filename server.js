const express = require('express');
const connectDB = require('./config/db');
const perfumeRoutes = require('./routes/perfumeRoutes');

const app = express();

app.use(express.json());

connectDB();

app.use('/api/perfumes', perfumeRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
