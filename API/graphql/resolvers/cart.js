// API/graphql/resolvers/cart.js

import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Cart from '../../models/Cart.js';
import Product from '../../models/Product.js';

const populateCart = (cart) => cart.populate({
    path: 'items.product',
    populate: { path: 'artisan category' }
});

export default {
  Query: {
    myCart: async (_, __, { user }) => {
      if (!user) throw new AuthenticationError('You must be logged in.');
      
      const cart = await Cart.findOne({ user: user.id });
      if (!cart) {
          // If a user has no cart, return a new, empty one.
          return new Cart({ user: user.id, items: [] });
      }

      return populateCart(cart);
    }
  },

  Mutation: {
    addToCart: async (_, { productId, quantity }, { user }) => {
        if (!user) throw new AuthenticationError('You must be logged in.');
        if (quantity < 1) throw new UserInputError('Quantity must be at least 1.');

        const product = await Product.findById(productId);
        if (!product) throw new UserInputError('Product not found.');
        if (product.quantity < quantity) throw new UserInputError(`Not enough stock. Only ${product.quantity} available.`);

        let cart = await Cart.findOne({ user: user.id });
        if (!cart) {
            cart = new Cart({ user: user.id, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: productId, quantity });
        }

        await cart.save();
        return populateCart(cart);
    },
    
    removeFromCart: async (_, { productId }, { user }) => {
        if (!user) throw new AuthenticationError('You must be logged in.');

        const cart = await Cart.findOne({ user: user.id });
        if (!cart) throw new UserInputError("You don't have a cart yet.");

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();
        return populateCart(cart);
    },

    updateCartItem: async (_, { productId, quantity }, { user }) => {
        if (!user) throw new AuthenticationError('You must be logged in.');
        
        const cart = await Cart.findOne({ user: user.id });
        if (!cart) throw new UserInputError("You don't have a cart yet.");
        
        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (quantity < 1) {
            // If quantity is less than 1, remove the item
            if(itemIndex > -1) cart.items.splice(itemIndex, 1);
        } else {
             if (itemIndex === -1) throw new UserInputError('Product not found in cart.');
             cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        return populateCart(cart);
    },

    clearCart: async (_, __, { user }) => {
        if (!user) throw new AuthenticationError('You must be logged in.');

        await Cart.findOneAndUpdate({ user: user.id }, { items: [] });

        return true;
    }
  },
  
  // ADD THIS SECTION
  Cart: {
      subtotal: (cart) => {
          // Check if items are populated and calculate subtotal
          if (!cart.items || cart.items.length === 0) {
              return 0;
          }
          return cart.items.reduce((total, item) => {
              const price = item.product && item.product.price ? item.product.price : 0;
              return total + (item.quantity * price);
          }, 0);
      },
      totalItems: (cart) => {
          if (!cart.items) return 0;
          return cart.items.reduce((total, item) => total + item.quantity, 0);
      }
  }
};