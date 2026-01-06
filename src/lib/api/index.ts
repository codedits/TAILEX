// ==========================================
// TAILEX API - Centralized Exports
// ==========================================

// Products
export {
  createProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  getProduct,
  createVariant,
  updateVariant,
  deleteVariant,
} from './products'

// Orders
export {
  createOrder,
  updateOrderStatus,
  getOrders,
  getOrder,
  getCustomerOrders,
  cancelOrder,
} from './orders'

// Collections
export {
  createCollection,
  updateCollection,
  deleteCollection,
  getCollections,
  getCollection,
} from './collections'

// Reviews
export {
  createReview,
  getProductReviews,
  updateReviewStatus,
  respondToReview,
  deleteReview,
  getAllReviews,
  markReviewHelpful,
} from './reviews'

// Customers & Cart
export {
  getCustomer,
  createCustomer,
  updateCustomer,
  addAddress,
  deleteAddress,
  getOrCreateCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from './customers'
