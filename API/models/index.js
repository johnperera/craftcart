// Models index file to ensure proper loading order
// This prevents circular dependency issues and ensures all models are registered

// Load models in dependency order
require('./User');
require('./Category');
require('./Product');
require('./Review');
require('./Order');
require('./Sale');

console.log('✅ All models loaded successfully');

module.exports = {
  User: require('./User'),
  Category: require('./Category'),
  Product: require('./Product'),
  Review: require('./Review'),
  Order: require('./Order'),
  Sale: require('./Sale')
}; 