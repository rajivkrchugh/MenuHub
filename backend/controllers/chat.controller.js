const Conversation = require('../models/Conversation');
const { getMenuResponse } = require('../services/openai.service');
const logger = require('../config/logger');

/**
 * POST /api/chat
 * Send a message and receive an AI menu response.
 */
async function sendMessage(req, res, next) {
  try {
    const { message, conversationId } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';

    // Load or create conversation
    let conversation;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
      if (!conversation) {
        return res.status(404).json({ success: false, error: 'Conversation not found' });
      }
    }

    // Build history from existing conversation
    const history = conversation
      ? conversation.messages.map((m) => ({ role: m.role, content: m.content }))
      : [];

    // Call OpenAI
    const { content, restaurantName, location } = await getMenuResponse(message, history);

    // Persist to database
    if (!conversation) {
      conversation = new Conversation({
        userId,
        restaurantName,
        location,
        messages: [],
      });
    }

    // Update restaurant info if newly detected
    if (restaurantName && !conversation.restaurantName) {
      conversation.restaurantName = restaurantName;
    }
    if (location && !conversation.location) {
      conversation.location = location;
    }

    conversation.messages.push({ role: 'user', content: message });
    conversation.messages.push({ role: 'assistant', content });
    await conversation.save();

    return res.json({
      success: true,
      data: {
        conversationId: conversation._id,
        response: content,
        restaurantName: conversation.restaurantName,
        location: conversation.location,
      },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/history/:userId
 * Fetch all conversations for a user (newest first).
 */
async function getHistory(req, res, next) {
  try {
    const { userId } = req.params;
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(50, parseInt(req.query.limit, 10) || 20);

    const conversations = await Conversation.find({ userId })
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('restaurantName location messages createdAt updatedAt');

    const total = await Conversation.countDocuments({ userId });

    return res.json({
      success: true,
      data: { conversations, page, limit, total },
    });
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/chat/conversation/:id
 * Fetch a single conversation by its ID.
 */
async function getConversation(req, res, next) {
  try {
    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ success: false, error: 'Conversation not found' });
    }
    return res.json({ success: true, data: conversation });
  } catch (err) {
    next(err);
  }
}

module.exports = { sendMessage, getHistory, getConversation };
