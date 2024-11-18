const puppeteer = require('puppeteer');
const Perfume = require('../models/perfumeModel');

const pageScraper = async (url) => {
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
  console.log('desc', description);
  const cleanName = name
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/\bfor (women( and men)?|men)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  console.log('cleanname', cleanName);

  const notes = [];
  const topNotesRegex = /Top notes are (.*?);/i;
  const middleNotesRegex = /middle notes? are (.*?);/i;
  const baseNotesRegex = /base notes\s+are\s+(.*?)(;|\.)/i;

  const topMatch = description.match(topNotesRegex);
  const middleMatch = description.match(middleNotesRegex);
  const baseMatch = description.match(baseNotesRegex);
  console.log('top', topMatch, 'middle', middleMatch, 'base', baseMatch);

  const splitNotes = (noteString) => noteString.split(/\s+and\s+|,\s*/i)
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

  await browser.close();

  const newPerfume = new Perfume({
    name: cleanName,
    brand,
    fragranceNotes: notes,
  });

  return newPerfume;
};

const profileScraper = async (profileAdress) => {
  const browser = await puppeteer.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  const url = profileAdress;

  try {
    console.log(`Navigating to ${url}...`);

    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    console.log(`On the page ${url}...`);

    const perfumes = await page.evaluate(() => {
      const perfumeElements = document.querySelectorAll('.shelf-element a');
      const perfumeLinks = [];

      perfumeElements.forEach((el) => {
     const link = el.getAttribute('href');
        console.log('linnk', link);
        return link ? `https://www.fragrantica.com${link}` : null;
      });
      
      return perfumeLinks;
    });

    console.log('Scraped Perfumes:', perfumes);

    return perfumes;
  } catch (error) {
    console.error('Error scraping profile:', error);
    return [];
  } finally {
    await browser.close();
  }
};

module.exports = { pageScraper, profileScraper };
