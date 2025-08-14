import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  images: [String],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reviews: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }]
}, {
  timestamps: true
});

// Add text index for search
productSchema.index({
  name: 'text',
  description: 'text'
});

const Product = mongoose.model('Product', productSchema);

// Change 'module.exports =' to 'export default'
export default Product;