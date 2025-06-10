// routes/exercicioRoutes.js
const express = require('express');
const router = express.Router();
const exercicioController = require('../controllers/exercicioController');

router.post('/', exercicioController.createExercicio);
router.get('/', exercicioController.getExercicios);
router.get('/:id', exercicioController.getExercicioById);
router.put('/:id', exercicioController.updateExercicio);
router.delete('/:id', exercicioController.deleteExercicio);

module.exports = router;
