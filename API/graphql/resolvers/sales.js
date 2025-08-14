const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const { Sale, Product, User } = require('../../models');

module.exports = {
  Query: {
    sales: async (_, { filter = {} }) => {
      const query = {};
      
      if (filter.productId) {
        query.product = filter.productId;
      }
      
      if (filter.artisanId) {
        query.artisan = filter.artisanId;
      }
      
      if (filter.isActive !== undefined) {
        query.isActive = filter.isActive;
      }
      
      if (filter.startDate) {
        query.startDate = { $gte: new Date(filter.startDate) };
      }
      
      if (filter.endDate) {
        query.endDate = { $lte: new Date(filter.endDate) };
      }
      
      if (filter.minDiscountPercentage || filter.maxDiscountPercentage) {
        query.discountPercentage = {};
        if (filter.minDiscountPercentage) query.discountPercentage.$gte = filter.minDiscountPercentage;
        if (filter.maxDiscountPercentage) query.discountPercentage.$lte = filter.maxDiscountPercentage;
      }
      
      return Sale.find(query)
        .populate('product artisan')
        .sort({ createdAt: -1 });
    },

    sale: (_, { id }) => Sale.findById(id)
      .populate('product artisan'),

    activeSales: async () => {
      const now = new Date();
      return Sale.find({
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
      }).populate('product artisan');
    },

    productSales: async (_, { productId }) => {
      return Sale.find({ product: productId })
        .populate('artisan')
        .sort({ createdAt: -1 });
    },

    artisanSales: async (_, { artisanId }) => {
      return Sale.find({ artisan: artisanId })
        .populate('product')
        .sort({ createdAt: -1 });
    }
  },

  Mutation: {
    createSale: async (_, { input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      if (user.role !== 'ARTISAN') {
        throw new ForbiddenError('Only artisans can create sales');
      }

      // Validate dates
      const startDate = new Date(input.startDate);
      const endDate = new Date(input.endDate);
      
      if (startDate >= endDate) {
        throw new UserInputError('End date must be after start date');
      }

      if (startDate < new Date()) {
        throw new UserInputError('Start date cannot be in the past');
      }

      // Validate discount percentage
      if (input.discountPercentage < 0 || input.discountPercentage > 100) {
        throw new UserInputError('Discount percentage must be between 0 and 100');
      }

      // Check if product exists and belongs to the artisan
      const product = await Product.findById(input.productId);
      if (!product) {
        throw new UserInputError('Product not found');
      }

      if (product.artisan.toString() !== user.id) {
        throw new ForbiddenError('You can only create sales for your own products');
      }

      // Check if there's already an active sale for this product
      const existingSale = await Sale.findOne({
        product: input.productId,
        isActive: true,
        $or: [
          { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
        ]
      });

      if (existingSale) {
        throw new UserInputError('This product already has an active sale during the specified period');
      }

      // Create the sale
      const sale = new Sale({
        ...input,
        artisan: user.id,
        originalPrice: product.price,
        discountAmount: (product.price * input.discountPercentage) / 100,
        salePrice: product.price - ((product.price * input.discountPercentage) / 100)
      });

      await sale.save();

      // Update the product with sale information
      await Product.findByIdAndUpdate(input.productId, {
        currentSale: sale._id,
        salePrice: sale.salePrice,
        discountPercentage: sale.discountPercentage,
        isOnSale: true
      });

      return sale.populate('product artisan');
    },

    updateSale: async (_, { id, input }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const sale = await Sale.findById(id);
      if (!sale) {
        throw new UserInputError('Sale not found');
      }

      if (user.role !== 'ADMIN' && sale.artisan.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to update this sale');
      }

      // Validate dates if being updated
      if (input.startDate && input.endDate) {
        const startDate = new Date(input.startDate);
        const endDate = new Date(input.endDate);
        
        if (startDate >= endDate) {
          throw new UserInputError('End date must be after start date');
        }
      }

      // Validate discount percentage if being updated
      if (input.discountPercentage !== undefined) {
        if (input.discountPercentage < 0 || input.discountPercentage > 100) {
          throw new UserInputError('Discount percentage must be between 0 and 100');
        }
      }

      const updatedSale = await Sale.findByIdAndUpdate(
        id,
        { ...input, updatedAt: new Date() },
        { new: true }
      ).populate('product artisan');

      // Update product sale information if discount percentage changed
      if (input.discountPercentage !== undefined) {
        const product = await Product.findById(sale.product);
        if (product) {
          const newDiscountAmount = (product.price * input.discountPercentage) / 100;
          const newSalePrice = product.price - newDiscountAmount;
          
          await Product.findByIdAndUpdate(sale.product, {
            salePrice: newSalePrice,
            discountPercentage: input.discountPercentage
          });
        }
      }

      return updatedSale;
    },

    deleteSale: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const sale = await Sale.findById(id);
      if (!sale) {
        throw new UserInputError('Sale not found');
      }

      if (user.role !== 'ADMIN' && sale.artisan.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to delete this sale');
      }

      // Remove sale information from product
      await Product.findByIdAndUpdate(sale.product, {
        $unset: { currentSale: 1, salePrice: 1, discountPercentage: 1 },
        isOnSale: false
      });

      await Sale.findByIdAndDelete(id);
      return true;
    },

    activateSale: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const sale = await Sale.findById(id);
      if (!sale) {
        throw new UserInputError('Sale not found');
      }

      if (user.role !== 'ADMIN' && sale.artisan.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to activate this sale');
      }

      sale.isActive = true;
      await sale.save();

      // Update product sale information
      await Product.findByIdAndUpdate(sale.product, {
        currentSale: sale._id,
        salePrice: sale.salePrice,
        discountPercentage: sale.discountPercentage,
        isOnSale: true
      });

      return Sale.findById(id).populate('product artisan');
    },

    deactivateSale: async (_, { id }, { user }) => {
      if (!user) throw new AuthenticationError('Not authenticated');
      
      const sale = await Sale.findById(id);
      if (!sale) {
        throw new UserInputError('Sale not found');
      }

      if (user.role !== 'ADMIN' && sale.artisan.toString() !== user.id) {
        throw new ForbiddenError('Not authorized to deactivate this sale');
      }

      sale.isActive = false;
      await sale.save();

      // Remove sale information from product
      await Product.findByIdAndUpdate(sale.product, {
        $unset: { currentSale: 1, salePrice: 1, discountPercentage: 1 },
        isOnSale: false
      });

      return Sale.findById(id).populate('product artisan');
    }
  },

  Sale: {
    product: (sale) => {
      if (sale.product && typeof sale.product === 'object') {
        return sale.product;
      }
      return Sale.findById(sale._id).populate('product').then(s => s.product);
    },
    artisan: (sale) => {
      if (sale.artisan && typeof sale.artisan === 'object') {
        return sale.artisan;
      }
      return Sale.findById(sale._id).populate('artisan').then(s => s.artisan);
    }
  }
}; 