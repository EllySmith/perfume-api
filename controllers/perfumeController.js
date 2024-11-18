const puppeteer = require('puppeteer');
const Perfume = require('../models/perfumeModel');

exports.getPerfumes = async (req, res) => {
  const perfumes = await Perfume.find();
  res.json(perfumes);
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

exports.scrapePerfumes = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ message: 'URL is required' });
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
    await page.goto(url, { waitUntil: 'networkidle2' });
    await page.waitForSelector('h1[itemprop="name"]', { timeout: 5000 });

    const name = await page.$eval('h1[itemprop="name"]', (el) => el.innerText.trim());
    console.log('name', name);
    if (!name) {
      throw new Error('Failed to scrape perfume name.');
    }

    const brand = await page.$eval('p[itemprop="brand"] span[itemprop="name"]', (el) => el.innerText.trim());
    console.log('brand', brand);
    const description = await page.$eval('div[itemprop="description"] p', (el) => el.innerText.trim());
    const cleanName = name
      .replace(new RegExp(brand, 'gi'), '')
      .replace(/\bfor (women( and men)?|men)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    console.log('cleanname', cleanName);

    const notes = [];

    const topNotesRegex = /Top notes are (.*?);/i;
    const middleNotesRegex = /middle note is (.*?);/i;
    const baseNotesRegex = /base notes are (.*?);/i;

    const topMatch = description.match(topNotesRegex);
    const middleMatch = description.match(middleNotesRegex);
    const baseMatch = description.match(baseNotesRegex);

    const splitNotes = (noteString) => noteString
      .split(/,|and/)
      .map((note) => note.trim().toLowerCase())
      .filter((note) => note.length > 2);

    if (topMatch) {
      notes.push(...splitNotes(topMatch[1]));
    }
    if (middleMatch) {
      notes.push(...splitNotes(middleMatch[1]));
    }
    if (baseMatch) {
      notes.push(...splitNotes(baseMatch[1]));
    }

    console.log('Fragrance Notes:', notes);

    await browser.close();

    const newPerfume = new Perfume({
      name: cleanName,
      brand,
      fragranceNotes: notes,
    });

    await newPerfume.save();

    res.status(201).json({
      message: 'Perfume scraped and added successfully',
      perfume: newPerfume,
    });
  } catch (error) {
    console.error('Error scraping perfumes:', error);
    res.status(500).json({ message: 'Failed to scrape perfumes', error: error.message });
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

    console.log(notes1);
    console.log(notes2);

    const sameNotes = (arr1, arr2) => arr1.filter((note) => arr2.includes(note));

    res.status(201).json(sameNotes(notes1, notes2));
  } catch (error) {
    console.error('Error comparing perfumes by notes:', error);
    res.status(500).json({ message: 'Failed to compare perfumes by notes', error: error.message });
  }
};

// ideas:

// ai scent finder

// ai add description
