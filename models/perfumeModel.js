const mongoose = require('mongoose');

const perfumeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  brand: { type: String, required: true },
  fragranceNotes: { type: Array },
  volume: { type: Number },
  price: { type: Number },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Perfume', perfumeSchema);
