const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  artisan: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
    validate: {
      validator: function(v) {
        return v >= 0 && v <= 100;
      },
      message: 'Discount percentage must be between 0 and 100'
    }
  },
  discountAmount: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(v) {
        return v >= 0;
      },
      message: 'Discount amount must be positive'
    }
  },
  originalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  salePrice: {
    type: Number,
    required: true,
    min: 0
  },
  startDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > this.startDate;
      },
      message: 'End date must be after start date'
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  maxQuantity: {
    type: Number,
    min: 1,
    default: null
  },
  soldQuantity: {
    type: Number,
    default: 0,
    min: 0
  }
}, {
  timestamps: true
});

// Index for efficient queries
saleSchema.index({ product: 1, isActive: 1, endDate: 1 });
saleSchema.index({ artisan: 1, isActive: 1 });
saleSchema.index({ startDate: 1, endDate: 1 });

// Virtual for checking if sale is currently active
saleSchema.virtual('isCurrentlyActive').get(function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate &&
         (this.maxQuantity === null || this.soldQuantity < this.maxQuantity);
});

// Method to calculate discounted price
saleSchema.methods.calculateDiscountedPrice = function(originalPrice) {
  const discountAmount = (originalPrice * this.discountPercentage) / 100;
  return Math.max(0, originalPrice - discountAmount);
};

// Method to check if sale can still be applied
saleSchema.methods.canApplySale = function() {
  return this.isCurrentlyActive;
};

// Pre-save middleware to calculate sale price and discount amount
saleSchema.pre('save', function(next) {
  if (this.isModified('discountPercentage') || this.isModified('originalPrice')) {
    this.discountAmount = (this.originalPrice * this.discountPercentage) / 100;
    this.salePrice = Math.max(0, this.originalPrice - this.discountAmount);
  }
  next();
});

// Ensure virtual fields are serialized
saleSchema.set('toJSON', { virtuals: true });
saleSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Sale', saleSchema); 