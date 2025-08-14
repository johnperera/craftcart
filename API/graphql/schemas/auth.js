import { gql } from 'apollo-server-express';

export default gql`
  type AuthPayload {
    token: String!
    user: User!
  }

  type User {
    id: ID!
    name: String!
    email: String!
    role: Role!
    profileImage: String
    createdAt: Date!
    products: [Product!]
    orders: [Order!]
    reviews: [Review!]
  }

  input RegisterInput {
    name: String!
    email: String!
    password: String!
    role: Role = BUYER
    profileImage: String
  }

  input LoginInput {
    email: String!
    password: String!
  }

  extend type Query {
    me: User
    user(id: ID!): User
    users: [User!]!
  }

  extend type Mutation {
    register(input: RegisterInput!): AuthPayload!
    login(input: LoginInput!): AuthPayload!
    updateUser(id: ID!, input: UpdateUserInput!): User!
    deleteUser(id: ID!): Boolean!
  }

  input UpdateUserInput {
    name: String
    email: String
    profileImage: String
  }
`;