const { gql } = require('apollo-server-express');

module.exports = gql`
  type Sale {
    id: ID!
    product: Product!
    artisan: User!
    discountPercentage: Float!
    discountAmount: Float!
    originalPrice: Float!
    salePrice: Float!
    startDate: Date!
    endDate: Date!
    isActive: Boolean!
    isCurrentlyActive: Boolean!
    description: String
    maxQuantity: Int
    soldQuantity: Int!
    createdAt: Date!
    updatedAt: Date!
  }

  input CreateSaleInput {
    productId: ID!
    discountPercentage: Float!
    startDate: Date!
    endDate: Date!
    description: String
    maxQuantity: Int
  }

  input UpdateSaleInput {
    discountPercentage: Float
    startDate: Date
    endDate: Date
    description: String
    maxQuantity: Int
    isActive: Boolean
  }

  input SaleFilter {
    productId: ID
    artisanId: ID
    isActive: Boolean
    isCurrentlyActive: Boolean
    startDate: Date
    endDate: Date
    minDiscountPercentage: Float
    maxDiscountPercentage: Float
  }

  extend type Query {
    sales(filter: SaleFilter): [Sale!]!
    sale(id: ID!): Sale
    activeSales: [Sale!]!
    productSales(productId: ID!): [Sale!]!
    artisanSales(artisanId: ID!): [Sale!]!
  }

  extend type Mutation {
    createSale(input: CreateSaleInput!): Sale!
    updateSale(id: ID!, input: UpdateSaleInput!): Sale!
    deleteSale(id: ID!): Boolean!
    activateSale(id: ID!): Sale!
    deactivateSale(id: ID!): Sale!
  }
`; 