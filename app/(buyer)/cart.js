import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width } = Dimensions.get("window");

export default function CartScreen() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingItem, setUpdatingItem] = useState(null);

  const baseUrl = "https://ecommerce-app-three-rho.vercel.app";

  const calculateTotal = useCallback((items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, []);

  const calculateItemTotal = (item) => {
    const price = Number(item.price) || 0;
    const quantity = Number(item.quantity) || 1;
    return price * quantity;
  };

  const fetchCart = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert(
          "🔒 Login Required",
          "Please sign in to view your cart",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Sign In", 
              style: "default",
              onPress: () => router.push("/(auth)/LoginScreen")
            },
          ]
        );
        return;
      }

      const res = await fetch(`${baseUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load cart");

      const data = await res.json();
      
      // Mock data for demo - replace with actual API response
      const mockCart = data || [
        {
          id: "1",
          name: "Premium Wireless Headphones",
          price: 129.99,
          quantity: 2,
          image_url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070",
          category: "Electronics",
          discount: 15,
        },
        {
          id: "2",
          name: "Casual T-Shirt",
          price: 24.99,
          quantity: 1,
          image_url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=2080",
          category: "Fashion",
          discount: 10,
        },
      ];
      
      setCart(mockCart);
      setTotal(calculateTotal(mockCart));
    } catch (err) {
      Alert.alert("❌ Error", "Cannot load cart. Check your connection.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchCart();
    }, [])
  );

  const updateQuantity = async (itemId, newQty) => {
    if (newQty < 1) {
      removeItem(itemId);
      return;
    }

    try {
      setUpdatingItem(itemId);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${baseUrl}/cart/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ itemId, quantity: newQty }),
      });

      if (res.ok) {
        // Update local state
        const updatedCart = cart.map(item =>
          item.id === itemId ? { ...item, quantity: newQty } : item
        );
        setCart(updatedCart);
        setTotal(calculateTotal(updatedCart));
        Alert.alert("✅ Updated", "Quantity updated successfully");
      } else {
        Alert.alert("❌ Error", "Failed to update quantity");
        fetchCart(); // Refresh
      }
    } catch (err) {
      Alert.alert("❌ Network Error", "Check your connection");
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = (itemId) => {
    Alert.alert(
      "🗑️ Remove Item",
      "Are you sure you want to remove this item from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              const res = await fetch(`${baseUrl}/cart/item`, {
                method: "DELETE",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ itemId }),
              });

              if (res.ok) {
                const newCart = cart.filter(i => i.id !== itemId);
                setCart(newCart);
                setTotal(calculateTotal(newCart));
                Alert.alert("✅ Removed", "Item removed from cart");
              } else {
                Alert.alert("❌ Error", "Could not remove item");
              }
            } catch (err) {
              Alert.alert("❌ Error", "Network error");
            }
          },
        },
      ]
    );
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    
    Alert.alert(
      "🧹 Clear Cart",
      "Are you sure you want to remove all items from your cart?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem("token");
              if (!token) return;
              
              // Call clear cart API if available
              const res = await fetch(`${baseUrl}/cart/clear`, {
                method: "DELETE",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              });

              if (res.ok || !res.ok) { // Clear locally regardless
                setCart([]);
                setTotal(0);
                Alert.alert("✅ Cleared", "Your cart is now empty");
              }
            } catch (err) {
              // Still clear locally
              setCart([]);
              setTotal(0);
              Alert.alert("✅ Cleared", "Your cart is now empty");
            }
          },
        },
      ]
    );
  };

  const placeOrder = async () => {
    // 1. Empty cart guard
    if (!cart || cart.length === 0) {
      Alert.alert('🛒 Empty Cart', 'Please add items before placing an order.');
      return;
    }

    // 2. Confirm dialog
    Alert.alert(
      '🚀 Confirm Order',
      `Total: $${total.toFixed(2)}\n\nProceed with this order?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          style: 'default',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert('🔒 Authentication Error', 'Please login again.');
                return;
              }

              // Format items exactly as backend expects
              const itemsToSend = cart.map(item => ({
                product_id: item.product_id || item.id,
                name: item.name || item.product_name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity || 1, 10),
                image_url: item.image_url || item.image || 'https://via.placeholder.com/150',
              }));

              const response = await fetch(`${baseUrl}/place-order`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                  total_amount: total,
                  items: itemsToSend,
                }),
              });

              const result = await response.json();

              if (result.success || response.ok) {
                Alert.alert(
                  '🎉 Order Placed Successfully!',
                  `Your order has been confirmed. ${result.orderId ? `Order ID: ${result.orderId}` : ''}`,
                  [
                    { 
                      text: 'Continue Shopping', 
                      style: 'default',
                      onPress: () => router.push("/(buyer)/HomeScreen")
                    },
                    { 
                      text: 'View Orders', 
                      style: 'default',
                     
                    },
                  ]
                );

                // Clear local cart state after successful order
                setCart([]);
                setTotal(0);
              } else {
                Alert.alert('❌ Order Failed', result.message || 'Something went wrong.');
              }
            } catch (error) {
              Alert.alert('❌ Network Error', 'Please check your internet connection and try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="shopping-cart" size={64} color="#FF9900" />
        <Text style={styles.loadingTitle}>Loading Your Cart...</Text>
        <ActivityIndicator size="large" color="#FF9900" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        
        <View style={styles.headerActions}>
          {cart.length > 0 && (
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearCart}
            >
              <MaterialIcons name="delete-sweep" size={22} color="#DC2626" />
              <Text style={styles.clearText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={() => {
              setRefreshing(true);
              fetchCart(true);
            }}
            colors={["#FF9900"]}
            tintColor="#FF9900"
          />
        }
      >
        {cart.length === 0 ? (
          <View style={styles.emptyCart}>
            <MaterialIcons name="remove-shopping-cart" size={100} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptyText}>
              Add some amazing products to get started!
            </Text>
            <TouchableOpacity 
              style={styles.shopButton}
              onPress={() => router.push("/(buyer)/HomeScreen")}
            >
              <LinearGradient
                colors={['#FF9900', '#FFAD33']}
                style={styles.shopButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="storefront" size={20} color="white" />
                <Text style={styles.shopButtonText}>Start Shopping</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Cart Items */}
            <View style={styles.itemsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  Your Items ({cart.length})
                </Text>
                <Text style={styles.editText}>Edit</Text>
              </View>
              
              {cart.map((item) => {
                const itemTotal = calculateItemTotal(item);
                const discount = item.discount || 0;
                const originalTotal = (item.price * item.quantity) || 0;
                
                return (
                  <View key={item.id} style={styles.cartItem}>
                    {/* Product Image */}
                    <TouchableOpacity 
                      style={styles.imageContainer}
                      onPress={() => router.push({
                        pathname: "/(buyer)/product-details",
                        params: { product: JSON.stringify(item) },
                      })}
                    >
                      <Image
                        source={{ uri: item.image_url || "https://via.placeholder.com/300" }}
                        style={styles.productImage}
                        resizeMode="cover"
                      />
                      {discount > 0 && (
                        <View style={styles.discountBadge}>
                          <Text style={styles.discountText}>-{discount}%</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    {/* Product Details */}
                    <View style={styles.itemDetails}>
                      <View style={styles.itemHeader}>
                        <TouchableOpacity 
                          style={styles.itemNameContainer}
                          onPress={() => router.push({
                            pathname: "/(buyer)/product-details",
                            params: { product: JSON.stringify(item) },
                          })}
                        >
                          <Text style={styles.itemName} numberOfLines={2}>
                            {item.name || "Product Name"}
                          </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.removeButton}
                          onPress={() => removeItem(item.id)}
                        >
                          <MaterialIcons name="close" size={20} color="#9CA3AF" />
                        </TouchableOpacity>
                      </View>
                      
                      <Text style={styles.itemCategory}>
                        {item.category || "Category"}
                      </Text>
                      
                      {/* Price Row */}
                      <View style={styles.priceRow}>
                        <Text style={styles.currentPrice}>
                          ${itemTotal.toFixed(2)}
                        </Text>
                        {discount > 0 && (
                          <Text style={styles.originalPrice}>
                            ${originalTotal.toFixed(2)}
                          </Text>
                        )}
                      </View>
                      
                      {/* Quantity Controls */}
                      <View style={styles.quantityControls}>
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={updatingItem === item.id}
                        >
                          <Text style={styles.qtyButtonText}>−</Text>
                        </TouchableOpacity>
                        
                        <View style={styles.quantityDisplay}>
                          {updatingItem === item.id ? (
                            <ActivityIndicator size="small" color="#FF9900" />
                          ) : (
                            <Text style={styles.quantityText}>{item.quantity || 1}</Text>
                          )}
                        </View>
                        
                        <TouchableOpacity
                          style={styles.qtyButton}
                          onPress={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={updatingItem === item.id}
                        >
                          <Text style={styles.qtyButtonText}>+</Text>
                        </TouchableOpacity>
                        
                        <Text style={styles.perItemText}>
                          ${(item.price || 0).toFixed(2)} each
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Order Summary */}
            <View style={styles.summaryCard}>
              <Text style={styles.summaryTitle}>Order Summary</Text>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>
                  Subtotal ({cart.reduce((sum, item) => sum + (item.quantity || 1), 0)} items)
                </Text>
                <Text style={styles.summaryValue}>${total.toFixed(2)}</Text>
              </View>
              
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Shipping</Text>
                <Text style={styles.summaryValue}>
                  {total > 50 ? "FREE" : "$3.99"}
                </Text>
              </View>
              
              <View style={styles.divider} />
              
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>
                  ${(total + (total > 50 ? 0 : 3.99)).toFixed(2)}
                </Text>
              </View>
              
              <Text style={styles.taxText}>Including all applicable taxes</Text>
            </View>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.featureItem}>
                <MaterialIcons name="security" size={28} color="#059669" />
                <Text style={styles.featureTitle}>Secure Payment</Text>
                <Text style={styles.featureDesc}>100% protected</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="autorenew" size={28} color="#7C3AED" />
                <Text style={styles.featureTitle}>Easy Returns</Text>
                <Text style={styles.featureDesc}>30-day policy</Text>
              </View>
              
              <View style={styles.featureItem}>
                <MaterialIcons name="support-agent" size={28} color="#2563EB" />
                <Text style={styles.featureTitle}>24/7 Support</Text>
                <Text style={styles.featureDesc}>Always here to help</Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Fixed Checkout Button (Only when cart has items) */}
      {cart.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.continueShoppingButton}
            onPress={() => router.push("/(buyer)/HomeScreen")}
          >
            <MaterialIcons name="arrow-back" size={20} color="#6B7280" />
            <Text style={styles.continueShoppingText}>Continue Shopping</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.checkoutButton}
            onPress={placeOrder}
          >
            <LinearGradient
              colors={['#FF9900', '#FFAD33']}
              style={styles.checkoutGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={styles.checkoutText}>PlaceOrder</Text>
              <Text style={styles.checkoutPrice}>
                ${(total + (total > 50 ? 0 : 3.99)).toFixed(2)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    gap: 4,
  },
  clearText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  // Empty Cart
  emptyCart: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 24,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  shopButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  shopButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 16,
    gap: 12,
  },
  shopButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Items Section
  itemsSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  editText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Cart Item
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  imageContainer: {
    position: 'relative',
    width: 100,
    height: 120,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    marginRight: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  itemDetails: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  itemNameContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 22,
  },
  removeButton: {
    padding: 4,
  },
  itemCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  currentPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FF9900',
    marginRight: 8,
  },
  originalPrice: {
    fontSize: 14,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qtyButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  qtyButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#374151',
    marginTop: -2,
  },
  quantityDisplay: {
    minWidth: 40,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  perItemText: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
    textAlign: 'right',
  },
  // Order Summary
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF9900',
  },
  taxText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 12,
  },
  // Features Section
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 2,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  continueShoppingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    marginRight: 12,
    gap: 8,
  },
  continueShoppingText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '600',
  },
  checkoutButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  checkoutGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  checkoutText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  checkoutPrice: {
    color: 'white',
    fontSize: 18,
    fontWeight: '800',
  },
});