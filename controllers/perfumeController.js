const puppeteer = require('puppeteer');
const axios = require('axios');
const Perfume = require('../models/perfumeModel');
const { pageScraper, linkSearch } = require('./pageScraper');

require('dotenv').config();

const openaiApiKey = process.env.OPENAI_API_KEY;

exports.getPerfumes = async (req, res) => {
  try {
    const perfumes = await Perfume.find();
    res.json(perfumes);
  } catch {
    console.error('Perfume not found');
    res.status(404).json({ message: 'Perfume not found', error: error.message });
  }
};

exports.createPerfume = async (req, res) => {
  const {
    name, brand, fragranceNotes, volume, price,
  } = req.body;
  const newPerfume = new Perfume({
    name, brand, fragranceNotes, volume, price,
  });
  await newPerfume.save();
  res.status(201).json(newPerfume);
};

exports.updatePerfume = async (req, res) => {
  const updatedPerfume = await Perfume.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updatedPerfume);
};

exports.deletePerfume = async (req, res) => {
  await Perfume.findByIdAndDelete(req.params.id);
  res.json({ message: 'Perfume deleted' });
};

exports.deletePerfumeByName = async (req, res) => {
  const { name } = req.body;
  try {
    const result = await Perfume.deleteMany({ name });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'No perfumes found with that name' });
    }

    res.json({ message: 'Perfume(s) deleted successfully', deletedCount: result.deletedCount });
  } catch (error) {
    console.error('Error deleting perfumes:', error);
    res.status(500).json({ message: 'Failed to delete perfumes', error: error.message });
  }
};

exports.scrapePerfumes = async (req, res) => {
  const { url } = req.body;

  const newPerfume = await pageScraper(url);
  await newPerfume.save();

  res.status(201).json({
    message: 'Perfume scraped and added successfully',
    perfume: newPerfume,
  });
};

exports.scrapeSearch = async (req, res) => {
  const { searchString } = req.body;
  try {
  const link = await linkSearch(searchString);
  console.log('link passed', link);
  const newPerfume = await pageScraper(link);
  await newPerfume.save();

  res.status(201).json({
    message: 'Perfume scraped and added successfully',
    perfume: newPerfume,
  });
  } catch (error) {
    console.error('Error finding perfumes by notes:', error);
    res.status(500).json({ message: 'Failed to scrape', error: error.message });
  }
};

exports.findByNotes = async (req, res) => {
  const { notes } = req.body;

  try {
    const perfumes = await Perfume.find({
      fragranceNotes: { $in: notes },
    });

    if (perfumes.length === 0) {
      return res.status(404).json({ message: 'No match' });
    }

    res.status(201).json(perfumes.map((perfume) => `${perfume.name} by ${perfume.brand}`));
  } catch (error) {
    console.error('Error finding perfumes by notes:', error);
    res.status(500).json({ message: 'Failed to find perfumes by notes', error: error.message });
  }
};

exports.compareNotes = async (req, res) => {
  const { perfume1, perfume2 } = req.body;
  try {
    const notes1 = perfume1.fragranceNotes;
    const notes2 = perfume2.fragranceNotes;
    const sameNotes = (arr1, arr2) => arr1.filter((note) => arr2.includes(note));

    res.status(201).json(sameNotes(notes1, notes2));
  } catch (error) {
    console.error('Error comparing perfumes by notes:', error);
    res.status(500).json({ message: 'Failed to compare perfumes by notes', error: error.message });
  }
};

exports.getPerfumeAdvice = async (req, res) => {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const prompt = `
    You are a perfume expert. Based on the user's preferences, provide a perfume recommendation.
    
    User query: "${query}"
    
    Your advice: 
    `;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 100,
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json',
        },
      },
    );

    const advice = response.data.choices[0].message.content.trim();
    res.status(200).json({ advice });
  } catch (error) {
    console.error('Error fetching advice from GPT:', error.message);
    res.status(500).json({ message: 'Failed to fetch advice', error: error.message });
  }
};

// ideas:

// ai scent finder

// ai add description

// find prices on vinted
