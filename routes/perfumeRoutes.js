const express = require('express');

const router = express.Router();

const {
  getPerfumes,
  createPerfume,
  updatePerfume,
  deletePerfume,
} = require('../controllers/perfumeController');

router.get('/', getPerfumes);
router.post('/', createPerfume);
router.put('/:id', updatePerfume);
router.delete('/:id', deletePerfume);

module.exports = router;
