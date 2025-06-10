// routes/treinoRoutes.js
const express = require('express');
const router = express.Router();
const treinoController = require('../controllers/treinoController');

router.post('/', treinoController.createTreino);
router.get('/', treinoController.getTreinos);
router.get('/:id', treinoController.getTreinoById);
router.put('/:id', treinoController.updateTreino);
router.delete('/:id', treinoController.deleteTreino);

module.exports = router;
