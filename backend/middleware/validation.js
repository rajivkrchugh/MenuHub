const { body, param, validationResult } = require('express-validator');

// Strip HTML-like tags and excessive whitespace from user input
function sanitizeText(str) {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

const validateChatMessage = [
  body('message')
    .trim()
    .notEmpty().withMessage('Message is required')
    .isLength({ max: 500 }).withMessage('Message must be under 500 characters')
    .customSanitizer(sanitizeText),
  body('conversationId')
    .optional()
    .isMongoId().withMessage('Invalid conversation ID'),
];

const validateUserId = [
  param('userId')
    .trim()
    .notEmpty().withMessage('User ID is required')
    .isLength({ min: 1, max: 128 }).withMessage('Invalid user ID'),
];

const validateConversationId = [
  param('id')
    .isMongoId().withMessage('Invalid conversation ID'),
];

function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: errors.array().map((e) => e.msg).join('; '),
    });
  }
  next();
}

module.exports = {
  validateChatMessage,
  validateUserId,
  validateConversationId,
  handleValidationErrors,
};
