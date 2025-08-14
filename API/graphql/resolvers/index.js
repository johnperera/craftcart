import authResolvers from './auth.js';
import productResolvers from './products.js';
import categoryResolvers from './categories.js';
import orderResolvers from './orders.js';
import reviewResolvers from './reviews.js';
import cartResolvers from './cart.js'; // Import the new cart resolvers

export default {
  Query: {
    ...authResolvers.Query,
    ...productResolvers.Query,
    ...categoryResolvers.Query,
    ...orderResolvers.Query,
    ...reviewResolvers.Query,
    ...cartResolvers.Query, // Add cart queries
  },
  Mutation: {
    ...authResolvers.Mutation,
    ...productResolvers.Mutation,
    ...categoryResolvers.Mutation,
    ...orderResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...cartResolvers.Mutation, // Add cart mutations
  },
  // You might need to add resolvers for your new Cart types here if they have complex fields
  Cart: cartResolvers.Cart,
};