import { gql } from 'apollo-server-express';

export default gql`
  type Review {
    id: ID!
    product: Product!
    user: User!
    rating: Int!
    comment: String
    createdAt: Date!
  }

  input ReviewInput {
    productId: ID!
    rating: Int!
    comment: String
  }

  extend type Query {
    productReviews(productId: ID!): [Review!]!
    userReviews(userId: ID!): [Review!]!
  }

  extend type Mutation {
    createReview(input: ReviewInput!): Review!
    updateReview(id: ID!, comment: String): Review!
    deleteReview(id: ID!): Boolean!
  }
`;