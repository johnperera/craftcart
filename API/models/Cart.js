// API/models/Cart.js

import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  }
}, {
  _id: false // Do not generate a separate _id for subdocuments
});


const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // A user can only have one cart
  },
  items: [cartItemSchema],
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating total items
cartSchema.virtual('totalItems').get(function() {
  return this.items.reduce((total, item) => total + item.quantity, 0);
});

// Virtual for calculating subtotal
cartSchema.virtual('subtotal').get(function() {
    if (!this.populated('items.product')) {
        // If products aren't populated, we can't calculate subtotal.
        // This is a safeguard, you should always populate before calculating.
        return 0;
    }
    return this.items.reduce((total, item) => {
        const price = item.product ? item.product.price : 0;
        return total + (item.quantity * price);
    }, 0);
});

const Cart = mongoose.model('Cart', cartSchema);
export default Cart;