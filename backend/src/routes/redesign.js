const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs').promises;

// Get redesigned HTML for an image
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const filePath = path.join(__dirname, '../../uploads/redesigned', `${id}.html`);
    
    // Explicitly allow framing for this specific route
    res.setHeader("Content-Security-Policy", "frame-ancestors *");
    res.setHeader("X-Frame-Options", "ALLOWALL");

    try {
      await fs.access(filePath);
    } catch (err) {
      return res.status(404).send('Redesigned HTML not found');
    }

    res.sendFile(filePath);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
