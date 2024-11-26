const puppeteer = require('puppeteer');
const Perfume = require('../models/perfumeModel');

const linkSearch = async (perfume) => {
  const searchAttribute = (input) => {
    let lowerCaseString = input.toLowerCase();
    let formattedString = lowerCaseString.replace(/ /g, '%20');
    return formattedString;
  }
  const searchUrl = searchAttribute(perfume);
  const url = `https://www.fragrantica.com/search/?query=${searchUrl}`;
  console.log('url', url);
  const browser = await puppeteer.launch({
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  
  page.setDefaultTimeout(60000);

  await page.goto(`https://www.fragrantica.com/search/?query=${searchUrl}`, {
    waitUntil: 'domcontentloaded',
  });
  const html = await page.evaluate(() => {
    return document.body.innerHTML;
  });
  console.log(html);
  await page.waitForSelector('div.card-section a');

  try {
    const firstProductLink = await page.$eval('div.card-section a', (anchor) => {
      return anchor.href;
    });

    console.log("First product link:", firstProductLink);
    return firstProductLink;
  } catch (error) {
    console.error('Error scraping the page:', error);
  }

  await browser.close();
}

const pageScraper = async (url) => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36');
  await page.goto(url, { waitUntil: 'networkidle2' });
  await page.waitForSelector('h1[itemprop="name"]', { timeout: 5000 });

  const name = await page.$eval('h1[itemprop="name"]', (el) => el.innerText.trim());
  if (!name) {
    throw new Error('Failed to scrape perfume name.');
  }

  const brand = await page.$eval('p[itemprop="brand"] span[itemprop="name"]', (el) => el.innerText.trim());
  const description = await page.$eval('div[itemprop="description"] p', (el) => el.innerText.trim());
  const cleanName = name
    .replace(new RegExp(brand, 'gi'), '')
    .replace(/\bfor (women( and men)?|men)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  const notes = [];
  const topNotesRegex = /Top notes are (.*?);/i;
  const middleNotesRegex = /middle notes? are (.*?);/i;
  const baseNotesRegex = /base notes\s+are\s+(.*?)(;|\.)/i;

  const topMatch = description.match(topNotesRegex);
  const middleMatch = description.match(middleNotesRegex);
  const baseMatch = description.match(baseNotesRegex);

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

module.exports = { pageScraper, linkSearch };
