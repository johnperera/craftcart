import { AuthenticationError, ForbiddenError, UserInputError } from 'apollo-server-express';
import Product from '../../models/Product.js';
import Category from '../../models/Category.js';
import { productInputSchema } from '../../utils/validators.js';
import { logAdminAction } from '../../utils/adminLogger.js';

export default {
  Query: {
    products: async (_, { filter = {} }) => {
      const query = {};
      
      if (filter.categoryId) {
        query.category = filter.categoryId;
      }
      
      if (filter.artisanId) {
        query.artisan = filter.artisanId;
      }
      
      if (filter.minPrice || filter.maxPrice) {
        query.price = {};
        if (filter.minPrice) query.price.$gte = filter.minPrice;
        if (filter.maxPrice) query.price.$lte = filter.maxPrice;
      }
      
      if (filter.searchQuery) {
        query.$text = { $search: filter.searchQuery };
      }
      
      return Product.find(query)
        .populate('category artisan reviews');
    },

    product: async (_, { id }) => {
        const product = await Product.findById(id).populate('category artisan reviews');
        if (!product) {
            throw new UserInputError(`No product found with ID: ${id}`);
        }
        return product;
    },

    featuredProducts: (_, { limit = 5 }) => Product.find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate('category artisan'),
  },

  Mutation: {
    createProduct: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to create a product.');
      }
      if (user.role !== 'ARTISAN') {
        throw new ForbiddenError('Only artisans are allowed to create products.');
      }

      // 1. Validate input against the schema
      try {
        await productInputSchema.validate(input, { abortEarly: false });
      } catch (err) {
        throw new UserInputError('Failed to create product due to validation errors.', {
          validationErrors: err.errors,
        });
      }

      // 2. Check if the category exists
      const category = await Category.findById(input.categoryId);
      if (!category) {
        throw new UserInputError(`The category with ID '${input.categoryId}' does not exist.`);
      }

      // 3. Create and save the new product
      const product = new Product({
        ...input,
        artisan: user.id,
        category: input.categoryId,
      });

      await product.save();
      // Use populate to return the full category and artisan details
      return product.populate('category artisan');
    },

    updateProduct: async (_, { id, input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a product.');
      }
      
      const product = await Product.findById(id);
      if (!product) {
        throw new UserInputError(`Product with ID '${id}' not found.`);
      }

      // Check if user is the product's artisan or an admin
      if (user.role !== 'ADMIN' && product.artisan.toString() !== user.id) {
        throw new ForbiddenError('You are not authorized to update this product.');
      }

      // If categoryId is being updated, verify it exists
      if (input.categoryId) {
        const category = await Category.findById(input.categoryId);
        if (!category) {
          throw new UserInputError(`The category with ID '${input.categoryId}' does not exist.`);
        }
        // Rename to match the model field
        input.category = input.categoryId;
        delete input.categoryId;
      }

      const updatedProduct = await Product.findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true } // Return the updated document
      ).populate('category artisan');

      // 4. Log the action if performed by an admin
      if (user.role === 'ADMIN') {
        await logAdminAction(user.id, `Updated product: ${updatedProduct.name} (ID: ${id})`);
      }

      return updatedProduct;
    },

    deleteProduct: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a product.');
      }
      
      const product = await Product.findById(id);
      if (!product) {
        throw new UserInputError(`Product with ID '${id}' not found.`);
      }

      // Check if user is the product's artisan or an admin
      if (user.role !== 'ADMIN' && product.artisan.toString() !== user.id) {
        throw new ForbiddenError('You are not authorized to delete this product.');
      }

      await Product.findByIdAndDelete(id);
      
      // 5. Log the action if performed by an admin
      if (user.role === 'ADMIN') {
        await logAdminAction(user.id, `Deleted product: ${product.name} (ID: ${id})`);
      }

      return true;
    }
  },

  // This resolver populates the 'reviews' field for a Product
  Product: {
    reviews: async (product) => {
      // If reviews are already populated, return them, otherwise fetch them.
      if (product.reviews && product.reviews.length > 0 && product.reviews[0].comment) {
          return product.reviews;
      }
      const populatedProduct = await product.populate('reviews');
      return populatedProduct.reviews;
    }
  }
};