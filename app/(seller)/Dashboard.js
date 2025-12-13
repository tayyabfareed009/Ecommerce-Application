import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/(auth)/LoginScreen");
        return;
      }

      const res = await fetch("https://ecommerce-app-three-rho.vercel.app/orders", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.log("Error fetching orders:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchOrders();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(offsetY > 100);
  };

  const getStats = () => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (parseFloat(order.total_amount) || 0), 0);
    const pendingOrders = orders.filter(order => 
      order.status?.toLowerCase() === 'pending' || 
      order.status?.toLowerCase() === 'processing'
    ).length;
    const completedOrders = orders.filter(order => 
      order.status?.toLowerCase() === 'delivered'
    ).length;
    
    return { totalOrders, totalRevenue, pendingOrders, completedOrders };
  };

  const stats = getStats();

  const quickActions = [
    {
      title: "Products",
      subtitle: "Manage inventory",
      icon: "inventory",
      color: "#2563EB",
      route: "/(seller)/ManageProducts"
    },
    {
      title: "Add Product",
      subtitle: "Add new item",
      icon: "add-circle",
      color: "#059669",
      route: "/(seller)/AddProduct"
    },
    {
      title: "Orders",
      subtitle: "View all orders",
      icon: "history",
      color: "#8B5CF6",
      route: "/(seller)/ManageProducts"
    },
    {
      title: "Reviews",
      subtitle: "Customer feedback",
      icon: "rate-review",
      color: "#F59E0B",
      route: "/(seller)/SellerProfile"
    },
    {
      title: "Analytics",
      subtitle: "Store performance",
      icon: "analytics",
      color: "#DC2626",
      route: "/(seller)/SellerProfile"
    },
    {
      title: "Settings",
      subtitle: "Manage store",
      icon: "settings",
      color: "#64748B",
      route: "/(seller)/SellerProfile"
    },
  ];

  const orderStatusIcons = {
    'pending': 'pending',
    'processing': 'pending-actions',
    'shipped': 'local-shipping',
    'delivered': 'check-circle',
    'cancelled': 'cancel',
  };

  const getOrderIcon = (status) => {
    const statusLower = status?.toLowerCase() || 'pending';
    return orderStatusIcons[statusLower] || 'pending';
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Sticky Header (Appears on scroll) */}
      {showStickyHeader && (
        <View style={styles.stickyHeader}>
          <View style={styles.stickyHeaderContent}>
            <View style={styles.stickyHeaderLogo}>
              <MaterialIcons name="store" size={24} color="#FF9900" />
              <Text style={styles.stickyHeaderText}>Seller Dashboard</Text>
            </View>
            <TouchableOpacity style={styles.stickyNotificationBtn}>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>3</Text>
              </View>
              <MaterialIcons name="notifications" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={["#FF9900"]}
            tintColor="#FF9900"
          />
        }
      >
        {/* Enhanced Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            {/* Professional Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerBrand}>
                  <View style={styles.headerLogo}>
                    <MaterialIcons name="store" size={32} color="#FF9900" />
                    <View style={styles.appTitleContainer}>
                      <Text style={styles.appTitle}>Seller</Text>
                      <Text style={styles.appTitleAccent}>Dashboard</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitle}>Professional Business Center</Text>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerIconButton}>
                    <View style={styles.notificationBadge}>
                      <Text style={styles.notificationCount}>3</Text>
                    </View>
                    <MaterialIcons name="notifications" size={24} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.headerIconButton}>
                    <MaterialIcons name="settings" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Professional Welcome Section */}
              <View style={styles.welcomeSection}>
                <View style={styles.welcomeHeader}>
                  <Text style={styles.welcomeText}>Welcome back,</Text>
                  <Text style={styles.welcomeName}>John Seller</Text>
                </View>
                <Text style={styles.marketplaceText}>Track. Manage. Grow.</Text>
                <Text style={styles.subtitleText}>
                  Real-time insights for your e-commerce business
                </Text>
              </View>
            </View>

            {/* Fixed Stats Bar - Now displays properly */}
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(255, 153, 0, 0.15)' }]}>
                    <MaterialIcons name="shopping-bag" size={20} color="#FF9900" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>{stats.totalOrders}</Text>
                    <Text style={styles.statLabel}>Total Orders</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(5, 150, 105, 0.15)' }]}>
                    <MaterialIcons name="attach-money" size={20} color="#059669" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>${stats.totalRevenue.toFixed(0)}</Text>
                    <Text style={styles.statLabel}>Revenue</Text>
                  </View>
                </View>
              </View>

              <View style={styles.statDivider} />

              <View style={styles.statItem}>
                <View style={styles.statContent}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(37, 99, 235, 0.15)' }]}>
                    <MaterialIcons name="pending" size={20} color="#2563EB" />
                  </View>
                  <View style={styles.statTextContainer}>
                    <Text style={styles.statNumber}>{stats.pendingOrders}</Text>
                    <Text style={styles.statLabel}>Pending</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Quick Actions Section - 3x2 Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Manage your store efficiently</Text>
              </View>
            </View>
            
            <View style={styles.actionsGrid}>
              {quickActions.slice(0, 3).map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                    <MaterialIcons name={action.icon} size={24} color="white" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
            
            <View style={styles.actionsGrid}>
              {quickActions.slice(3, 6).map((action, index) => (
                <TouchableOpacity
                  key={index + 3}
                  style={styles.actionCard}
                  onPress={() => router.push(action.route)}
                  activeOpacity={0.9}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                    <MaterialIcons name={action.icon} size={24} color="white" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Recent Orders Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Recent Orders</Text>
                <Text style={styles.sectionSubtitle}>Latest customer orders</Text>
              </View>
              <TouchableOpacity 
                style={styles.viewAllButton}
                onPress={() => router.push("/(seller)/ManageProducts")}
              >
                <Text style={styles.viewAllText}>View All</Text>
                <MaterialIcons name="chevron-right" size={16} color="#2563EB" />
              </TouchableOpacity>
            </View>

            {orders.length === 0 ? (
              <View style={styles.emptyCard}>
                <View style={styles.emptyIcon}>
                  <MaterialIcons name="receipt-long" size={48} color="#E5E7EB" />
                </View>
                <Text style={styles.emptyTitle}>No Orders Yet</Text>
                <Text style={styles.emptyText}>
                  Start adding products to receive orders
                </Text>
                <TouchableOpacity 
                  style={styles.emptyButton}
                  onPress={() => router.push("/(seller)/AddProduct")}
                >
                  <MaterialIcons name="add" size={18} color="white" />
                  <Text style={styles.emptyButtonText}>Add Products</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.ordersList}>
                {orders.slice(0, 5).map((item, index) => (
                  <TouchableOpacity
                    key={item.order_id?.toString() || Math.random().toString()}
                    style={styles.orderCard}
                    onPress={() => router.push({ 
                      pathname: "/(seller)/OrderDetails",
                      params: { orderId: item.order_id }
                    })}
                    activeOpacity={0.9}
                  >
                    <View style={styles.orderHeader}>
                      <View style={styles.orderIconContainer}>
                        <MaterialIcons 
                          name={getOrderIcon(item.status)} 
                          size={24} 
                          color={getStatusColor(item.status).icon} 
                        />
                      </View>
                      <View style={styles.orderInfo}>
                        <View style={styles.orderInfoTop}>
                          <Text style={styles.customerName}>
                            {item.customer_name || "Customer"}
                          </Text>
                          <Text style={styles.orderAmount}>
                            ${parseFloat(item.total_amount || 0).toFixed(2)}
                          </Text>
                        </View>
                        <View style={styles.orderInfoBottom}>
                          <Text style={styles.orderId}>Order #{item.order_id}</Text>
                          <View style={styles.orderMeta}>
                            <MaterialIcons name="calendar-today" size={12} color="#6B7280" />
                            <Text style={styles.orderDate}>
                              {item.created_at ? new Date(item.created_at).toLocaleDateString() : "N/A"}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                    
                    <View style={styles.orderFooter}>
                      <View style={styles.orderDetails}>
                        <View style={styles.orderDetailItem}>
                          <MaterialIcons name="inventory" size={14} color="#6B7280" />
                          <Text style={styles.itemCount}>3 items</Text>
                        </View>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(item.status).bg }
                        ]}>
                          <View style={[
                            styles.statusDot,
                            { backgroundColor: getStatusColor(item.status).dot }
                          ]} />
                          <Text style={[
                            styles.statusText,
                            { color: getStatusColor(item.status).text }
                          ]}>
                            {item.status || "Pending"}
                          </Text>
                        </View>
                      </View>
                      
                      <View style={styles.orderActions}>
                        <TouchableOpacity style={styles.orderActionButton}>
                          <MaterialIcons name="visibility" size={16} color="#6B7280" />
                          <Text style={styles.orderActionText}>Details</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.orderActionButton, styles.processButton]}>
                          <MaterialIcons name="check-circle" size={16} color="#059669" />
                          <Text style={[styles.orderActionText, styles.processText]}>Process</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Stats Summary Card */}
          <View style={styles.statsCard}>
            <View style={styles.statsHeader}>
              <MaterialIcons name="insights" size={24} color="#FF9900" />
              <Text style={styles.statsTitle}>Store Summary</Text>
            </View>
            <View style={styles.statsGrid}>
              <View style={styles.summaryItem}>
                <MaterialIcons name="shopping-bag" size={20} color="#2563EB" />
                <View>
                  <Text style={styles.summaryValue}>{stats.totalOrders}</Text>
                  <Text style={styles.summaryLabel}>Total Orders</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons name="attach-money" size={20} color="#059669" />
                <View>
                  <Text style={styles.summaryValue}>${stats.totalRevenue.toFixed(0)}</Text>
                  <Text style={styles.summaryLabel}>Revenue</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons name="pending" size={20} color="#F59E0B" />
                <View>
                  <Text style={styles.summaryValue}>{stats.pendingOrders}</Text>
                  <Text style={styles.summaryLabel}>Pending</Text>
                </View>
              </View>
              <View style={styles.summaryItem}>
                <MaterialIcons name="check-circle" size={20} color="#8B5CF6" />
                <View>
                  <Text style={styles.summaryValue}>{stats.completedOrders}</Text>
                  <Text style={styles.summaryLabel}>Completed</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Professional Footer */}
          <View style={styles.footer}>
            <View style={styles.footerContent}>
              <MaterialIcons name="store" size={20} color="#9CA3AF" />
              <Text style={styles.footerText}>
                Seller Dashboard • Last updated: Today at 14:30
              </Text>
            </View>
            <Text style={styles.copyright}>© 2024 MarketConnect Seller Center</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Enhanced status color function with icon colors
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case "delivered": 
      return { bg: '#DCFCE7', text: '#166534', dot: '#16A34A', icon: '#059669' };
    case "shipped": 
      return { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6', icon: '#2563EB' };
    case "processing": 
      return { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B', icon: '#D97706' };
    case "cancelled": 
      return { bg: '#FEE2E2', text: '#991B1B', dot: '#DC2626', icon: '#DC2626' };
    default: 
      return { bg: '#F3F4F6', text: '#374151', dot: '#6B7280', icon: '#6B7280' };
  }
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  stickyHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    zIndex: 1000,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  stickyHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyHeaderLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stickyHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  stickyNotificationBtn: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    zIndex: 1,
  },
  notificationCount: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  heroSection: {
    height: height * 0.35,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingTop: 40,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  header: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  headerBrand: {
    flex: 1,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  appTitleContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
  },
  appTitleAccent: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF9900',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '500',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 8,
    position: 'relative',
  },
  welcomeSection: {
    marginBottom: 20,
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 20,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
    marginRight: 8,
  },
  welcomeName: {
    fontSize: 22,
    color: '#FF9900',
    fontWeight: '700',
  },
  marketplaceText: {
    fontSize: 28,
    color: 'white',
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 15,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  quickStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statTextContainer: {
    alignItems: 'flex-start',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '600',
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
    paddingTop: 32,
    minHeight: height * 0.7,
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  viewAllText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
    marginRight: 4,
  },
  // Quick Actions Grid - 3x2 Layout
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  actionCard: {
    width: '31%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  // Professional Orders Display
  ordersList: {
    gap: 16,
  },
  orderCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
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
    alignItems: 'center',
    marginBottom: 20,
  },
  orderIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  orderInfo: {
    flex: 1,
  },
  orderInfoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customerName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  orderAmount: {
    fontSize: 22,
    fontWeight: '800',
    color: '#059669',
  },
  orderInfoBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 14,
    color: '#6B7280',
  },
  orderMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
  },
  orderFooter: {
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingTop: 20,
  },
  orderDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  orderDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemCount: {
    fontSize: 14,
    color: '#6B7280',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  orderActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  orderActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  processButton: {
    backgroundColor: '#F0FDF4',
    borderColor: '#D1FAE5',
  },
  orderActionText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  processText: {
    color: '#059669',
  },
  // Stats Summary Card
  statsCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginLeft: 12,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
  },
  summaryItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 2,
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Empty State
  emptyCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 48,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#FF9900',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Footer
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 32,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginLeft: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});