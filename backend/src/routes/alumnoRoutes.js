const express = require('express');
const router = express.Router();
const alumnoController = require('../controllers/alumnoController');

// GET /api/alumnos
router.get('/', alumnoController.getAllAlumnos);

// GET /api/alumnos/search?q=term
router.get('/search', alumnoController.searchAlumnos);

// GET /api/alumnos/:id
router.get('/:id', alumnoController.getAlumnoById);

// POST /api/alumnos
router.post('/', alumnoController.createAlumno);

// PUT /api/alumnos/:id
router.put('/:id', alumnoController.updateAlumno);

// DELETE /api/alumnos/:id
router.delete('/:id', alumnoController.deleteAlumno);

module.exports = router;


