import { gql } from 'apollo-server-express';

export default gql`
  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    quantity: Int!
    images: [String!]!
    category: Category!
    artisan: User!
    reviews: [Review!]
    createdAt: Date!
    updatedAt: Date!
  }

  input ProductInput {
    name: String!
    description: String!
    price: Float!
    quantity: Int!
    categoryId: ID!
    images: [String!]
  }

  input ProductUpdateInput {
    name: String
    description: String
    price: Float
    quantity: Int
    categoryId: ID
    images: [String!]
  }

  input ProductFilter {
    categoryId: ID
    artisanId: ID
    minPrice: Float
    maxPrice: Float
    searchQuery: String
  }

  extend type Query {
    products(filter: ProductFilter): [Product!]!
    product(id: ID!): Product
    featuredProducts(limit: Int = 5): [Product!]!
  }

  extend type Mutation {
    createProduct(input: ProductInput!): Product!
    updateProduct(id: ID!, input: ProductUpdateInput!): Product!
    deleteProduct(id: ID!): Boolean!
  }
`;