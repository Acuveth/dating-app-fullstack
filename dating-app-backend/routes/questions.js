const express = require('express');
const { iceBreakers, wouldYouRatherQuestions, twoTruthsOneLieExamples } = require('../utils/predefinedQuestions');

const router = express.Router();

// Get all predefined questions
router.get('/all', (req, res) => {
  try {
    res.json({
      iceBreakers,
      wouldYouRatherQuestions,
      twoTruthsOneLieExamples
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ice breaker questions only
router.get('/icebreakers', (req, res) => {
  try {
    res.json({ iceBreakers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get would you rather questions only
router.get('/wouldyourather', (req, res) => {
  try {
    res.json({ wouldYouRatherQuestions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get two truths one lie examples only
router.get('/twotruths', (req, res) => {
  try {
    res.json({ twoTruthsOneLieExamples });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;