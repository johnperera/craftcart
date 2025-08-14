import { gql } from 'apollo-server-express';

// Change 'const orderTypeDefs = gql`' and 'module.exports =' to a single 'export default'
export default gql`
  type Order {
    id: ID!
    buyer: User!
    items: [OrderItem]!
    total: Float!
    status: OrderStatus!
    createdAt: String
    updatedAt: String
  }

  type OrderItem {
    product: Product!
    quantity: Int!
    priceAtPurchase: Float!
  }

  enum OrderStatus {
    PENDING
    PROCESSING
    SHIPPED
    DELIVERED
    CANCELLED
  }

  input OrderItemInput {
    product: ID!
    quantity: Int!
  }

  extend type Query {
    orders: [Order]
    order(id: ID!): Order
    myOrders: [Order]
  }

  extend type Mutation {
    createOrder(items: [OrderItemInput]!): Order
    updateOrderStatus(id: ID!, status: OrderStatus!): Order
  }
`;