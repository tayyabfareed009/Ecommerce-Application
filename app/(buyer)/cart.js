import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    FlatList,
    Image,
    RefreshControl,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router } from "expo-router";

export default function CartScreen() {
  const [cart, setCart] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const baseUrl = "https://ecommerce-app-three-rho.vercel.app";

  const calculateTotal = useCallback((items) => {
    if (!Array.isArray(items)) return 0;
    return items.reduce(
      (acc, item) => acc + (Number(item.price) || 0) * (Number(item.quantity) || 1),
      0
    );
  }, []);

  const fetchCart = async (isRefresh = false) => {
    try {
      if (!isRefresh) setLoading(true);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Session Expired", "Please login again", [
          { text: "OK", onPress: () => router.replace("/signup") } // UPDATED
        ]);
        return;
      }

      const res = await fetch(`${baseUrl}/cart`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to load cart");

      const data = await res.json();
      setCart(data || []);
      setTotal(calculateTotal(data || []));
    } catch (err) {
      Alert.alert("Error", "Cannot load cart. Check your connection.");
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
      } else {
        Alert.alert("Error", "Failed to update quantity");
        fetchCart(); // Refresh
      }
    } catch (err) {
      Alert.alert("Network Error", "Check your connection");
    }
  };

  const removeItem = (itemId) => {
    Alert.alert(
      "Remove Item",
      "Are you sure you want to remove this item?",
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
              } else {
                Alert.alert("Error", "Could not remove item");
              }
            } catch (err) {
              Alert.alert("Error", "Network error");
            }
          },
        },
      ]
    );
  };

  const placeOrder = async () => {
    // 1. Empty cart guard
    if (!cart || cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items before placing an order.');
      return;
    }

    // 2. Confirm dialog
    Alert.alert(
      'Confirm Order',
      `Total: ₹${total.toFixed(2)}\n\nDo you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Place Order',
          onPress: async () => {
            try {
              const token = await AsyncStorage.getItem('token');
              if (!token) {
                Alert.alert('Authentication Error', 'Please login again.');
                return;
              }

              // Format items exactly as backend expects
              const itemsToSend = cart.map(item => ({
                product_id: item.product_id || item._id,
                name: item.name || item.product_name,
                price: parseFloat(item.price),
                quantity: parseInt(item.quantity || item.qty || 1, 10),
                image_url: item.image_url || item.image || 'https://via.placeholder.com/150',
              }));

              console.log('Placing order →', { total_amount: total, items: itemsToSend });

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
              console.log('Order API response:', result);

              if (result.success) {
                Alert.alert(
                  'Order Placed Successfully!',
                  `Order ID: ${result.orderId}`,
                  [
                    { text: 'Continue Shopping', onPress: () => router.push("/(buyer)/index") }, // UPDATED
                    { text: 'View Orders', onPress: () => router.push("/(buyer)/profile") }, // UPDATED
                  ]
                );

                // Clear local cart state
                setCart([]);
                setTotal(0);
              } else {
                Alert.alert('Order Failed', result.message || 'Something went wrong.');
              }
            } catch (error) {
              console.error('Place order error:', error);
              Alert.alert('Network Error', 'Please check your internet connection and try again.');
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#0D9488" />
        <Text style={styles.loadingText}>Loading your cart...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Cart</Text>
        <Text style={styles.subtitle}>
          {cart.length} item{cart.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="cart-outline" size={80} color="#CBD5E1" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Looks like you haven't added anything yet
          </Text>
          <TouchableOpacity 
            style={styles.shopBtn} 
            onPress={() => router.push("/(buyer)/HomeScreen")} // UPDATED
          >
            <Text style={styles.shopText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.id)}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => {
                  setRefreshing(true);
                  fetchCart(true);
                }}
                colors={["#0D9488"]}
              />
            }
            contentContainerStyle={{ paddingBottom: 180 }}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image
                  source={{
                    uri: item.image_url || "https://via.placeholder.com/100",
                  }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.name || "No name"}
                  </Text>
                  <Text style={styles.itemPrice}>
                    ₹{Number(item.price || 0).toFixed(2)}
                  </Text>

                  <View style={styles.quantityRow}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity - 1)}
                    >
                      <Text style={styles.qtyBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.qtyText}>{item.quantity || 1}</Text>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.quantity + 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.subtotal}>
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeItem(item.id)}
                >
                  <Ionicons name="trash-outline" size={24} color="#DC2626" />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.checkoutBar}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalAmount}>₹{total.toFixed(2)}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutBtn} onPress={placeOrder}>
              <Text style={styles.checkoutText}>Place Order</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    paddingTop: 60,
    paddingHorizontal: 32,
    paddingBottom: 28,
    backgroundColor: "#0D9488",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
  },
  title: { fontSize: 34, fontWeight: "800", color: "#fff", textAlign: "center" },
  subtitle: { fontSize: 18, color: "#E0F2F1", textAlign: "center", marginTop: 8 },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { marginTop: 16, fontSize: 17, color: "#64748B" },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: { fontSize: 24, fontWeight: "800", color: "#1E293B", marginTop: 20 },
  emptyText: { fontSize: 16, color: "#64748B", textAlign: "center", marginTop: 12 },
  shopBtn: {
    backgroundColor: "#0D9488",
    paddingHorizontal: 36,
    paddingVertical: 18,
    borderRadius: 20,
    marginTop: 32,
  },
  shopText: { color: "#fff", fontSize: 18, fontWeight: "700" },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 18,
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 16,
    elevation: 10,
  },
  itemImage: { width: 90, height: 90, borderRadius: 16, backgroundColor: "#F8FAFC" },
  itemInfo: { flex: 1, marginLeft: 16, justifyContent: "space-between" },
  itemName: { fontSize: 17, fontWeight: "700", color: "#1E293B" },
  itemPrice: { fontSize: 18, fontWeight: "800", color: "#0D9488" },
  quantityRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  qtyBtn: {
    width: 40,
    height: 40,
    backgroundColor: "#0D9488",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyBtnText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  qtyText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginHorizontal: 16,
    minWidth: 30,
    textAlign: "center",
  },
  subtotal: { fontSize: 16, fontWeight: "700", color: "#DC2626" },
  removeBtn: { justifyContent: "center", paddingLeft: 12 },
  checkoutBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    padding: 24,
    paddingBottom: 34,
    borderTopWidth: 1.5,
    borderTopColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 20,
  },
  totalRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  totalLabel: { fontSize: 22, fontWeight: "700", color: "#1E293B" },
  totalAmount: { fontSize: 28, fontWeight: "800", color: "#0D9488" },
  checkoutBtn: {
    backgroundColor: "#0D9488",
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: "center",
  },
  checkoutText: { color: "#fff", fontSize: 20, fontWeight: "800" },
});