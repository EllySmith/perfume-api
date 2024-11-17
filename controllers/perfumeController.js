const Perfume = require('../models/perfumeModel');

exports.getPerfumes = async (req, res) => {
  const perfumes = await Perfume.find();
  res.json(perfumes);
};

exports.createPerfume = async (req, res) => {
  const { name, brand, fragranceNotes, volume, price } = req.body;
  const newPerfume = new Perfume({ name, brand, fragranceNotes, volume, price });
  await newPerfume.save();
  res.status(201).json(newPerfume);
};

exports.updatePerfume = async (req, res) => {
  const updatedPerfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPerfume);
};

exports.deletePerfume = async (req, res) => {
  await Perfume.findByIdAndDelete(req.params.id);
  res.json({ message: 'Perfume deleted successfully' });
};
