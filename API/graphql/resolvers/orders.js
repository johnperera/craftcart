import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import Order from '../../models/Order.js';
import Product from '../../models/Product.js';
import User from '../../models/User.js'; // Needed for adding order to user

// Change the old 'const orderResolvers =' to 'export default'
export default {
  Query: {
    // Get all orders (admin only)
    orders: async (_, __, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to perform this action.');
      }
      return await Order.find({}).populate('buyer').populate('items.product');
    },

    // Get a single order by ID
    order: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view this order.');
      }
      const order = await Order.findById(id).populate('buyer').populate('items.product');

      if (!order) {
        throw new UserInputError(`Order with ID '${id}' not found.`);
      }

      // Check if the user is the buyer or an admin
      if (user.id.toString() !== order.buyer.id.toString() && user.role !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to view this order.');
      }
      return order;
    },

    // Get all orders for the logged-in user
    myOrders: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to view your orders.');
      }
      return await Order.find({ buyer: user.id }).populate('items.product');
    }
  },

  Mutation: {
    // Create a new order from cart items
    createOrder: async (_, { items }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to place an order.');
      }
      if (!items || items.length === 0) {
        throw new UserInputError('Cannot create an order with no items.');
      }

      let total = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.product);
        if (!product) {
          throw new UserInputError(`Product with ID ${item.product} not found.`);
        }
        if (product.quantity < item.quantity) {
          throw new UserInputError(`Not enough stock for ${product.name}. Only ${product.quantity} available.`);
        }

        // Decrease product quantity in the database
        product.quantity -= item.quantity;
        await product.save();

        orderItems.push({
          product: product.id,
          quantity: item.quantity,
          priceAtPurchase: product.price
        });

        total += product.price * item.quantity;
      }

      const newOrder = new Order({
        buyer: user.id,
        items: orderItems,
        total,
        status: 'PENDING'
      });

      await newOrder.save();

      // Optionally add this order to the User's orders array
      await User.findByIdAndUpdate(user.id, { $push: { orders: newOrder._id } });

      // Populate fields before returning
      return newOrder.populate('buyer items.product');
    },

    // Update order status (admin only)
    updateOrderStatus: async (_, { id, status }, { user }) => {
      if (!user || user.role !== 'ADMIN') {
        throw new ForbiddenError('You are not authorized to perform this action.');
      }
      const order = await Order.findByIdAndUpdate(id, { status }, { new: true })
        .populate('buyer')
        .populate('items.product');
        
      if (!order) {
        throw new UserInputError(`Order with ID '${id}' not found.`);
      }
      return order;
    }
  }
};