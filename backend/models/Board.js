const mongoose = require('mongoose');

const boardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Board name is required'],
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  color: {
    type: String,
    default: 'from-blue-500 to-indigo-600',
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Board', boardSchema);

