import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');

// ✅ Custom Alert
const showAlert = (title, message) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

const showConfirm = (title, message, onConfirm) => {
  if (Platform.OS === "web") {
    if (window.confirm(`${title}\n\n${message}`)) {
      onConfirm();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: onConfirm },
    ]);
  }
};

export default function OrderDetails() {
  const params = useLocalSearchParams();
  const orderId = params.orderId;
  
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const BASE_URL = "https://ecommerce-app-three-rho.vercel.app";

  const fetchOrderDetails = async () => {
    try {
      if (!orderId) {
        setError("Invalid order ID");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const token = await AsyncStorage.getItem("token");
      if (!token) {
        setError("Session expired. Please log in again.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${BASE_URL}/order/${orderId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await res.json();

      if (res.ok) {
        setOrder(data);
      } else {
        setError(data.message || "Failed to load order");
      }
    } catch (err) {
      console.error("Network or fetch error:", err);
      setError("Unable to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (newStatus) => {
    try {
      setUpdating(true);
      const token = await AsyncStorage.getItem("token");

      const res = await fetch(`${BASE_URL}/update-order/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();

      if (res.ok) {
        showAlert("Success", `Order marked as ${newStatus}`);
        fetchOrderDetails();
      } else {
        showAlert("Failed", data.message || "Could not update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      showAlert("Error", "Something went wrong");
    } finally {
      setUpdating(false);
    }
  };

  const deleteOrder = async () => {
    if (!orderId) {
      showAlert("Error", "Invalid order ID");
      return;
    }

    showConfirm("Delete Order", "This action cannot be undone.", async () => {
      try {
        const token = await AsyncStorage.getItem("token");

        const res = await fetch(`${BASE_URL}/delete-order/${orderId}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await res.json();

        if (res.ok) {
          showAlert("Deleted", "Order removed successfully");
          router.back();
        } else {
          showAlert("Error", data.message || "Failed to delete order");
        }
      } catch (err) {
        console.error("Error deleting order:", err);
        showAlert("Error", "Failed to delete order");
      }
    });
  };

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails();
    }
  }, [orderId]);

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return { bg: '#DCFCE7', text: '#166534', icon: 'check-circle' };
      case "shipped": return { bg: '#DBEAFE', text: '#1E40AF', icon: 'local-shipping' };
      case "processing": return { bg: '#FEF3C7', text: '#92400E', icon: 'pending' };
      case "pending": return { bg: '#F3F4F6', text: '#374151', icon: 'schedule' };
      default: return { bg: '#F3F4F6', text: '#374151', icon: 'help-outline' };
    }
  };

  const statusOptions = [
    { status: "Pending", color: "#6B7280", icon: "schedule" },
    { status: "Processing", color: "#F59E0B", icon: "pending" },
    { status: "Shipped", color: "#2563EB", icon: "local-shipping" },
    { status: "Delivered", color: "#059669", icon: "check-circle" },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Loading State
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <MaterialIcons name="receipt-long" size={64} color="#FF9900" />
          <Text style={styles.loadingTitle}>Loading Order Details</Text>
          <ActivityIndicator size="large" color="#FF9900" style={{ marginTop: 20 }} />
        </View>
      </SafeAreaView>
    );
  }

  // Error State
  if (error || !order) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialIcons name="error-outline" size={64} color="#DC2626" />
          <Text style={styles.errorTitle}>Unable to Load Order</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.errorButtons}>
            <TouchableOpacity style={styles.retryButton} onPress={fetchOrderDetails}>
              <MaterialIcons name="refresh" size={20} color="white" />
              <Text style={styles.retryText}>Retry</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <MaterialIcons name="arrow-back" size={20} color="#374151" />
              <Text style={styles.backText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusColor(order.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Order Details</Text>
            <Text style={styles.headerSubtitle}>Order #{order._id?.substring(0, 8)}...</Text>
          </View>
          
          <TouchableOpacity style={styles.shareButton}>
            <MaterialIcons name="share" size={22} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Order Summary Card */}
        <View style={styles.orderSummaryCard}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderId}>Order #{order._id?.substring(0, 12)}</Text>
              <Text style={styles.orderDate}>{formatDate(order.created_at)}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <MaterialIcons name={statusInfo.icon} size={16} color={statusInfo.text} />
              <Text style={[styles.statusText, { color: statusInfo.text }]}>
                {order.status || "Pending"}
              </Text>
            </View>
          </View>
          
          <View style={styles.orderStats}>
            <View style={styles.statItem}>
              <MaterialIcons name="attach-money" size={20} color="#059669" />
              <Text style={styles.statValue}>${parseFloat(order.total_amount || 0).toFixed(2)}</Text>
              <Text style={styles.statLabel}>Total</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="shopping-bag" size={20} color="#2563EB" />
              <Text style={styles.statValue}>{order.items?.length || 0}</Text>
              <Text style={styles.statLabel}>Items</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <MaterialIcons name="person" size={20} color="#8B5CF6" />
              <Text style={styles.statValue}>
                {order.customer_name?.split(' ')[0] || "Customer"}
              </Text>
              <Text style={styles.statLabel}>Customer</Text>
            </View>
          </View>
        </View>

        {/* Customer Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Customer Information</Text>
          
          <View style={styles.customerInfo}>
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Name:</Text>
              <Text style={styles.infoValue}>{order.customer_name || "N/A"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="email" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Email:</Text>
              <Text style={styles.infoValue}>{order.email || "No email"}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="phone" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Phone:</Text>
              <Text style={styles.infoValue}>{order.phone || "No phone"}</Text>
            </View>
            <View style={[styles.infoRow, styles.addressRow]}>
              <MaterialIcons name="location-on" size={18} color="#6B7280" />
              <Text style={styles.infoLabel}>Address:</Text>
              <Text style={styles.infoValue} numberOfLines={2}>
                {order.address || "Not provided"}
              </Text>
            </View>
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Items</Text>
            <Text style={styles.itemsCount}>{order.items?.length || 0} items</Text>
          </View>
          
          <View style={styles.itemsList}>
            {order.items?.map((item, index) => (
              <View key={index} style={styles.itemCard}>
                <Image 
                  source={{ uri: item.product_image || 'https://via.placeholder.com/100' }} 
                  style={styles.itemImage}
                />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.product_name || "Unnamed Product"}
                  </Text>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemPrice}>${item.price || "0.00"}</Text>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity || 1}</Text>
                  </View>
                  <View style={styles.itemSubtotal}>
                    <Text style={styles.subtotalLabel}>Subtotal:</Text>
                    <Text style={styles.subtotalValue}>
                      ${(parseFloat(item.price || 0) * (item.quantity || 1)).toFixed(2)}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>
                ${parseFloat(order.total_amount || 0).toFixed(2)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Tax</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            <View style={styles.summaryDivider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total Amount</Text>
              <Text style={styles.totalValue}>
                ${parseFloat(order.total_amount || 0).toFixed(2)}
              </Text>
            </View>
          </View>
        </View>

        {/* Update Status */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Update Order Status</Text>
          
          <View style={styles.statusGrid}>
            {statusOptions.map((option) => (
              <TouchableOpacity
                key={option.status}
                style={[
                  styles.statusOption,
                  { borderColor: option.color },
                  order.status === option.status && { backgroundColor: option.color + '20' }
                ]}
                onPress={() => updateOrderStatus(option.status)}
                disabled={updating || order.status === option.status}
              >
                <MaterialIcons 
                  name={option.icon} 
                  size={24} 
                  color={order.status === option.status ? option.color : '#6B7280'} 
                />
                <Text style={[
                  styles.statusOptionText,
                  { color: order.status === option.status ? option.color : '#374151' }
                ]}>
                  {option.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={styles.printButton}
            onPress={() => showAlert("Print", "Print functionality coming soon")}
          >
            <MaterialIcons name="print" size={20} color="#2563EB" />
            <Text style={styles.printText}>Print Invoice</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={deleteOrder}
          >
            <MaterialIcons name="delete" size={20} color="#DC2626" />
            <Text style={styles.deleteText}>Delete Order</Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Order ID: {order._id} • Last updated: {formatDate(order.updated_at || order.created_at)}
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 MarketConnect Seller Center
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    backgroundColor: '#F3F4F6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  shareButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  orderSummaryCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  orderInfo: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  itemsCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  customerInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  addressRow: {
    alignItems: 'flex-start',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    minWidth: 60,
  },
  infoValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
    flex: 1,
  },
  itemsList: {
    gap: 12,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  itemImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
    lineHeight: 20,
  },
  itemDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemPrice: {
    fontSize: 16,
    color: '#FF9900',
    fontWeight: '700',
  },
  itemQuantity: {
    fontSize: 14,
    color: '#6B7280',
  },
  itemSubtotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subtotalLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
  subtotalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  summaryCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 15,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 15,
    color: '#1F2937',
    fontWeight: '600',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalRow: {
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '700',
  },
  totalValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statusOption: {
    width: '48%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 8,
  },
  statusOptionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  printButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 8,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  printText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2563EB',
  },
  deleteText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#DC2626',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  loadingTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 32,
  },
  errorTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#DC2626',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  errorButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#FF9900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  retryText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  backText: {
    color: '#374151',
    fontSize: 15,
    fontWeight: '600',
  },
});