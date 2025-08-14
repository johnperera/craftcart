import Category from "../../models/Category.js";
import {
  AuthenticationError,
  ForbiddenError,
  UserInputError,
} from "apollo-server-express";

export default {
  Query: {
    categories: async () => await Category.find().populate("products"),
    category: async (_, { id }) =>
      await Category.findById(id).populate("products"),
  },
  Mutation: {
    createCategory: (_, { input }, { user }) => {
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to perform this action."
        );
      if (user.role !== "ADMIN")
        throw new ForbiddenError(
          "You are not authorized to create a category."
        );
      const category = new Category(input);
      return category.save();
    },

    updateCategory: async (_, { id, input }, { user }) => {
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to perform this action."
        );
      if (user.role !== "ADMIN")
        throw new ForbiddenError(
          "You are not authorized to update a category."
        );

      const category = await Category.findById(id);
      if (!category) {
        throw new UserInputError(`Category with ID '${id}' not found.`);
      }

      // Update the fields
      if (input.name !== undefined) category.name = input.name;
      if (input.description !== undefined)
        category.description = input.description;

      await category.save();
      return category;
    },

    deleteCategory: async (_, { id }, { user }) => {
      if (!user)
        throw new AuthenticationError(
          "You must be logged in to perform this action."
        );
      if (user.role !== "ADMIN")
        throw new ForbiddenError(
          "You are not authorized to delete a category."
        );

      const category = await Category.findById(id);
      if (!category) {
        throw new UserInputError(`Category with ID '${id}' not found.`);
      }

      await category.deleteOne();
      return true;
    },
  },
};
