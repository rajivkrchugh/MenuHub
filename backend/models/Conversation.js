const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: true,
    maxlength: 20000,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    restaurantName: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient history queries
conversationSchema.index({ userId: 1, createdAt: -1 });
conversationSchema.index({ userId: 1, restaurantName: 1 });

module.exports = mongoose.model('Conversation', conversationSchema);
