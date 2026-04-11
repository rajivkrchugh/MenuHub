const express = require('express');
const router = express.Router();
const {
  sendMessage,
  getHistory,
  getConversation,
} = require('../controllers/chat.controller');
const {
  validateChatMessage,
  validateUserId,
  validateConversationId,
  handleValidationErrors,
} = require('../middleware/validation');
const { chatLimiter } = require('../middleware/rateLimiter');

router.post('/', chatLimiter, validateChatMessage, handleValidationErrors, sendMessage);
router.get('/history/:userId', validateUserId, handleValidationErrors, getHistory);
router.get('/conversation/:id', validateConversationId, handleValidationErrors, getConversation);

module.exports = router;
