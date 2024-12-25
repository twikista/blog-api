const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, require: true, trim: true },
    description: { type: String, trim: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    body: { type: String, require: true, trim: true },
    tags: [{ type: String, trim: true }],
    state: {
      type: String,
      required: true,
      trim: true,
      default: 'draft',
      enum: ['draft', 'published'],
    },
    read_count: { type: Number, default: 0 },
    reading_time: { type: Number, default: 0 },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Blog', blogSchema)
