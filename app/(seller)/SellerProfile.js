import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
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
  View
} from "react-native";

const { width, height } = Dimensions.get('window');

export default function SellerProfile() {
  const [seller, setSeller] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    storeName: "",
    totalProducts: 0,
    rating: 0,
    totalRevenue: 0,
    totalOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  useEffect(() => {
    loadSeller();
  }, []);

  const loadSeller = async () => {
    try {
      setLoading(true);
      const name = await AsyncStorage.getItem("name");
      const email = await AsyncStorage.getItem("email");
      const address = await AsyncStorage.getItem("address");
      const phone = await AsyncStorage.getItem("phone");
      const storeName = await AsyncStorage.getItem("storeName") || "My Store";
      const totalProducts = await AsyncStorage.getItem("totalProducts") || "0";
      const rating = await AsyncStorage.getItem("rating") || "4.8";

      setSeller({
        name: name || "John Seller",
        email: email || "seller@example.com",
        address: address || "123 Business Street, NY",
        phone: phone || "+1 (555) 123-4567",
        storeName,
        totalProducts: parseInt(totalProducts),
        rating: parseFloat(rating).toFixed(1),
        totalRevenue: 15240,
        totalOrders: 89,
      });
    } catch (error) {
      console.error("Error loading seller:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadSeller();
    setTimeout(() => setRefreshing(false), 1000);
  };

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(offsetY > 100);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
      router.replace("/(auth)/LoginScreen");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const profileStats = [
    { label: "Products", value: seller.totalProducts, icon: "inventory", color: "#2563EB" },
    { label: "Rating", value: seller.rating, icon: "star", color: "#F59E0B" },
    { label: "Revenue", value: `$${seller.totalRevenue.toLocaleString()}`, icon: "attach-money", color: "#059669" },
    { label: "Orders", value: seller.totalOrders, icon: "shopping-bag", color: "#8B5CF6" },
  ];

  const profileActions = [
    {
      title: "Edit Profile",
      subtitle: "Update personal info",
      icon: "edit",
      color: "#2563EB",
      action: () => router.push("/(seller)/EditProfile")
    },
    {
      title: "Store Settings",
      subtitle: "Manage store details",
      icon: "store",
      color: "#059669",
      action: () => router.push("/(seller)/StoreSettings")
    },
    {
      title: "Security",
      subtitle: "Password & 2FA",
      icon: "security",
      color: "#DC2626",
      action: () => router.push("/(seller)/Security")
    },
    {
      title: "Notifications",
      subtitle: "Alert preferences",
      icon: "notifications",
      color: "#F59E0B",
      action: () => router.push("/(seller)/Notifications")
    },
    {
      title: "Payment Methods",
      subtitle: "Bank & cards",
      icon: "payments",
      color: "#8B5CF6",
      action: () => router.push("/(seller)/Payments")
    },
    {
      title: "Help & Support",
      subtitle: "Get assistance",
      icon: "help-center",
      color: "#64748B",
      action: () => router.push("/(seller)/Support")
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Background Image */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />
      
      {/* Sticky Header */}
      {showStickyHeader && (
        <View style={styles.stickyHeader}>
          <View style={styles.stickyHeaderContent}>
            <View style={styles.stickyHeaderLogo}>
              <MaterialIcons name="person" size={24} color="#FF9900" />
              <Text style={styles.stickyHeaderText}>Profile</Text>
            </View>
            <TouchableOpacity style={styles.stickyNotificationBtn}>
              <View style={styles.notificationBadge}>
                <Text style={styles.notificationCount}>2</Text>
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
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroOverlay}>
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTop}>
                <View style={styles.headerBrand}>
                  <View style={styles.headerLogo}>
                    <MaterialIcons name="person" size={32} color="#FF9900" />
                    <View style={styles.appTitleContainer}>
                      <Text style={styles.appTitle}>Seller</Text>
                      <Text style={styles.appTitleAccent}>Profile</Text>
                    </View>
                  </View>
                  <Text style={styles.headerSubtitle}>Manage your account & store</Text>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerIconButton}>
                    <MaterialIcons name="settings" size={24} color="white" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Profile Summary */}
              <View style={styles.profileSummary}>
                <View style={styles.avatarContainer}>
                  <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                      {seller.name.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.editAvatarBtn}>
                    <MaterialIcons name="edit" size={16} color="white" />
                  </TouchableOpacity>
                </View>

                <View style={styles.profileInfo}>
                  <Text style={styles.sellerName}>{seller.name}</Text>
                  <Text style={styles.sellerStore}>{seller.storeName}</Text>
                  <View style={styles.ratingContainer}>
                    <MaterialIcons name="star" size={16} color="#F59E0B" />
                    <Text style={styles.ratingText}>{seller.rating} • Professional Seller</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentCard}>
          {/* Stats Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Performance Stats</Text>
                <Text style={styles.sectionSubtitle}>Your store overview</Text>
              </View>
            </View>
            
            <View style={styles.statsGrid}>
              {profileStats.map((stat, index) => (
                <View key={index} style={styles.statCard}>
                  <View style={[styles.statIconContainer, { backgroundColor: `${stat.color}15` }]}>
                    <MaterialIcons name={stat.icon} size={24} color={stat.color} />
                  </View>
                  <Text style={styles.statValue}>{stat.value}</Text>
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Account Information</Text>
                <Text style={styles.sectionSubtitle}>Personal & business details</Text>
              </View>
              <TouchableOpacity 
                style={styles.editInfoButton}
                onPress={() => router.push("/(seller)/EditProfile")}
              >
                <MaterialIcons name="edit" size={18} color="#2563EB" />
                <Text style={styles.editInfoText}>Edit All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.infoCard}>
              <InfoRow 
                icon="email" 
                label="Email Address" 
                value={seller.email}
                onPress={() => router.push("/(seller)/EditProfile")}
              />
              <InfoRow 
                icon="phone" 
                label="Phone Number" 
                value={seller.phone}
                onPress={() => router.push("/(seller)/EditProfile")}
              />
              <InfoRow 
                icon="location-on" 
                label="Business Address" 
                value={seller.address}
                onPress={() => router.push("/(seller)/EditProfile")}
              />
              <InfoRow 
                icon="store" 
                label="Store Name" 
                value={seller.storeName}
                onPress={() => router.push("/(seller)/StoreSettings")}
              />
              <InfoRow 
                icon="calendar-today" 
                label="Member Since" 
                value="January 2024"
                onPress={() => {}}
              />
              <InfoRow 
                icon="verified" 
                label="Account Status" 
                value="Verified ✓"
                valueColor="#059669"
                onPress={() => {}}
              />
            </View>
          </View>

          {/* Quick Actions Grid */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <Text style={styles.sectionSubtitle}>Manage your account</Text>
              </View>
            </View>
            
            <View style={styles.actionsGrid}>
              {profileActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.actionCard}
                  onPress={action.action}
                  activeOpacity={0.9}
                >
                  <View style={[styles.actionIconContainer, { backgroundColor: action.color }]}>
                    <MaterialIcons name={action.icon} size={22} color="white" />
                  </View>
                  <Text style={styles.actionTitle}>{action.title}</Text>
                  <Text style={styles.actionSubtitle}>{action.subtitle}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Account Security */}
          <View style={styles.securityCard}>
            <View style={styles.securityHeader}>
              <MaterialIcons name="security" size={24} color="#DC2626" />
              <View style={styles.securityInfo}>
                <Text style={styles.securityTitle}>Account Security</Text>
                <Text style={styles.securitySubtitle}>Protect your account</Text>
              </View>
            </View>
            
            <View style={styles.securityItems}>
              <TouchableOpacity style={styles.securityItem}>
                <View style={styles.securityItemLeft}>
                  <MaterialIcons name="lock" size={20} color="#374151" />
                  <Text style={styles.securityItemText}>Change Password</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.securityItem}>
                <View style={styles.securityItemLeft}>
                  <MaterialIcons name="phone-android" size={20} color="#374151" />
                  <Text style={styles.securityItemText}>Two-Factor Authentication</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.securityItem}>
                <View style={styles.securityItemLeft}>
                  <MaterialIcons name="devices" size={20} color="#374151" />
                  <Text style={styles.securityItemText}>Active Devices</Text>
                </View>
                <Text style={styles.securityItemStatus}>2 devices</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Logout Button */}
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={handleLogout}
          >
            <MaterialIcons name="logout" size={20} color="#DC2626" />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>Seller Profile • Last updated: Today</Text>
            <Text style={styles.copyright}>© 2024 MarketConnect Seller Center</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// InfoRow Component
const InfoRow = ({ icon, label, value, valueColor = "#1F2937", onPress }) => (
  <TouchableOpacity style={styles.infoRow} onPress={onPress}>
    <View style={styles.infoLeft}>
      <MaterialIcons name={icon} size={20} color="#6B7280" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <View style={styles.infoRight}>
      <Text style={[styles.infoValue, { color: valueColor }]} numberOfLines={2}>
        {value}
      </Text>
      <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
    </View>
  </TouchableOpacity>
);

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
    height: height * 0.4,
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
  },
  profileSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 20,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#FF9900',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#FF9900',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  sellerName: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 4,
  },
  sellerStore: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 6,
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
  editInfoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  editInfoText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Info Card
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  infoLabel: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 12,
  },
  infoRight: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '500',
    textAlign: 'right',
    marginRight: 12,
    maxWidth: '70%',
  },
  // Actions Grid
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  // Security Card
  securityCard: {
    marginHorizontal: 24,
    marginBottom: 32,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  securityInfo: {
    marginLeft: 12,
  },
  securityTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  securitySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  securityItems: {
    gap: 12,
  },
  securityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  securityItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  securityItemText: {
    fontSize: 15,
    color: '#374151',
    fontWeight: '500',
  },
  securityItemStatus: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  // Logout Button
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutText: {
    color: '#DC2626',
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
  footerText: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  copyright: {
    fontSize: 12,
    color: '#9CA3AF',
  },
});