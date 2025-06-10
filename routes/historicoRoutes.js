// routes/historicoRoutes.js
const express = require('express');
const router = express.Router();
const historicoController = require('../controllers/historicoController');

router.post('/', historicoController.createHistorico);
router.get('/', historicoController.getHistoricos); // Já existe e deve lidar com query paramsrouter.get('/', historicoController.getHistoricos);
router.get('/:id', historicoController.getHistoricoById);
router.put('/:id', historicoController.updateHistorico);
router.delete('/:id', historicoController.deleteHistorico);

module.exports = router;
