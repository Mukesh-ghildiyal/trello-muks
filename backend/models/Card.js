const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Card title is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  list: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
    required: true,
  },
  board: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Board',
    required: true,
  },
  dueDate: {
    type: Date,
  },
  position: {
    type: Number,
    default: 0,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Card', cardSchema);

