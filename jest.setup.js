const mongoose = require('mongoose');

beforeAll(async () => {
  const url = 'mongodb://localhost:27017/myapp_test';
  await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
  await mongoose.connection.close();
});
