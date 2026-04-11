const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const ADS_DIR = path.join(__dirname, '..', 'public', 'ads');
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * GET /api/ads
 * Returns the list of image filenames in the ads folder.
 * Adding/removing images from backend/public/ads/ automatically updates the list.
 */
router.get('/', (_req, res) => {
  try {
    if (!fs.existsSync(ADS_DIR)) {
      return res.json({ success: true, data: [] });
    }

    const files = fs.readdirSync(ADS_DIR)
      .filter((f) => ALLOWED_EXT.includes(path.extname(f).toLowerCase()))
      .map((f) => ({
        filename: f,
        url: `/api/ads/images/${encodeURIComponent(f)}`,
      }));

    return res.json({ success: true, data: files });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Failed to load ads' });
  }
});

module.exports = router;
