const express = require('express');

const router = express.Router();

const {
  getPerfumes,
  createPerfume,
  updatePerfume,
  deletePerfume,
  scrapePerfumes,
  findByNotes,
} = require('../controllers/perfumeController');

router.get('/', getPerfumes);
router.post('/', createPerfume);
router.put('/:id', updatePerfume);
router.delete('/:id', deletePerfume);
router.post('/scrape', scrapePerfumes);
router.post('/findByNotes', findByNotes);

module.exports = router;
