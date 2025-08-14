// Change 'require' to 'import'
import { AuthenticationError, UserInputError } from 'apollo-server-express';
import Review from '../../models/Review.js';
import Product from '../../models/Product.js'; // Needed to update product's review array

// Change 'module.exports =' to 'export default'
export default {
  Query: {
    productReviews: (_, { productId }) =>
      Review.find({ product: productId }).populate('user'),
    userReviews: (_, { userId }) =>
      Review.find({ user: userId }).populate('product')
  },

  Mutation: {
    createReview: async (_, { input }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to leave a review.');
      }

      const { productId, rating, comment } = input;

      // Check if the user has already reviewed this product
      const existingReview = await Review.findOne({ product: productId, user: user.id });
      if (existingReview) {
        throw new UserInputError('You have already submitted a review for this product.');
      }

      const review = new Review({
        product: productId,
        user: user.id,
        rating,
        comment,
      });

      await review.save();
      
      // Add the review to the corresponding product's reviews array
      await Product.findByIdAndUpdate(productId, { $push: { reviews: review._id } });

      return review.populate('user product');
    },

    updateReview: async (_, { id, comment }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to update a review.');
      }

      const review = await Review.findOneAndUpdate(
        // Ensure the user updating the review is the one who created it
        { _id: id, user: user.id },
        { comment },
        { new: true }
      ).populate('user product');

      if (!review) {
        throw new UserInputError('Review not found or you are not authorized to update it.');
      }
      return review;
    },

    deleteReview: async (_, { id }, { user }) => {
      if (!user) {
        throw new AuthenticationError('You must be logged in to delete a review.');
      }

      const review = await Review.findOneAndDelete({
        _id: id,
        // Allow an ADMIN or the original user to delete the review
        $or: [{ user: user.id }, { role: 'ADMIN' }]
      });

      if (!review) {
        throw new UserInputError('Review not found or you are not authorized to delete it.');
      }
      
      // Remove the review from the product's reviews array
      await Product.findByIdAndUpdate(review.product, { $pull: { reviews: review._id } });

      return true;
    }
  }
};