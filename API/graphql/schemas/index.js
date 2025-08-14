import { gql } from 'apollo-server-express';
import authSchema from './auth.js';
import productSchema from './products.js';
import categorySchema from './categories.js';
import orderSchema from './orders.js';
import reviewSchema from './reviews.js';
// Make sure you have also created and are importing cart.js if you implemented the cart feature
import cartSchema from './cart.js'; 

const baseSchema = gql`
  scalar Date

  type Query {
    _: Boolean
  }

  type Mutation {
    _: Boolean
  }

  type Subscription {
    _: Boolean
  }

  enum Role {
    BUYER
    ARTISAN
    ADMIN
  }
`;

export default [
  baseSchema,
  authSchema,
  productSchema,
  categorySchema,
  orderSchema,
  reviewSchema,
  cartSchema,
];