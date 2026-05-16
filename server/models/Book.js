const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

const bookSchema = new mongoose.Schema(
  {
    googleBooksId: { type: String, default: '' },
    title: { type: String, required: true, trim: true },
    author: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    coverImage: { type: String, default: '' },
    genre: [{ type: String }],
    publishedYear: { type: Number },
    isbn: { type: String, default: '' },
    pageCount: { type: Number },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    reviews: [reviewSchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    averageRating: { type: Number, default: 0 },
    totalRatings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

bookSchema.methods.calcAverageRating = function () {
  if (this.reviews.length === 0) {
    this.averageRating = 0;
    this.totalRatings = 0;
  } else {
    const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
    this.averageRating = Math.round((sum / this.reviews.length) * 10) / 10;
    this.totalRatings = this.reviews.length;
  }
};

module.exports = mongoose.model('Book', bookSchema);
