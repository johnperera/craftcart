import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticationError, UserInputError } from "apollo-server-express";
import User from "../../models/User.js";

export default {
  Query: {
    me: async (_, __, { user }) => {
      if (!user) {
        throw new AuthenticationError(
          "You must be logged in to perform this action."
        );
      }
      return User.findById(user.id).populate("products orders reviews");
    },
    user: (_, { id }) => User.findById(id).populate("products orders reviews"),
    users: async () => {
      return await User.find({}).populate("products orders reviews");
    },
  },

  Mutation: {
    register: async (_, { input }) => {
      const { email, password, ...rest } = input;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new UserInputError(
          "A user with this email address already exists.",
          {
            invalidArgs: ["email"],
          }
        );
      }

      const user = new User({
        ...rest,
        email,
        password, // Password will be hashed by the 'pre-save' hook in the model
      });

      await user.save();

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return { token, user };
    },

    login: async (_, { input }) => {
      const { email, password } = input;
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError(
          "Invalid credentials. Please check your email and password."
        );
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        throw new AuthenticationError(
          "Invalid credentials. Please check your email and password."
        );
      }

      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      return { token, user };
    },
  },
};
