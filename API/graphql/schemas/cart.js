import { gql } from 'apollo-server-express';

export default gql`
  type CartItem {
    product: Product!
    quantity: Int!
  }

  type Cart {
    id: ID!
    user: User!
    items: [CartItem!]!
    totalItems: Int!
    subtotal: Float!
  }

  extend type Query {
    myCart: Cart
  }

  extend type Mutation {
    addToCart(productId: ID!, quantity: Int = 1): Cart!
    removeFromCart(productId: ID!): Cart!
    updateCartItem(productId: ID!, quantity: Int!): Cart!
    clearCart: Boolean!
  }
`;