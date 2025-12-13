import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProfileScreen() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    role: "Customer",
  });

  useEffect(() => {
    const loadUser = async () => {
      const name = await AsyncStorage.getItem("name") || "Guest User";
      const email = await AsyncStorage.getItem("email") || "Not available";
      const address = await AsyncStorage.getItem("address") || "Not provided";
      const phone = await AsyncStorage.getItem("phone") || "Not provided";
      const role = (await AsyncStorage.getItem("role")) || "Customer";

      setUser({ name, email, address, phone, role });
    };
    loadUser();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.clear();
            router.replace("/(auth)/LoginScreen");
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    Alert.alert("Coming Soon", "Edit profile feature will be available soon!");
  };

  const handleViewOrders = () => {
    Alert.alert("Coming Soon", "Order history feature will be available soon!");
  };

  const profileOptions = [
    { icon: "shopping-bag", title: "My Orders", subtitle: "Track & view orders", onPress: handleViewOrders },
    { icon: "favorite", title: "Wishlist", subtitle: "Saved items", onPress: () => Alert.alert("Wishlist", "Your saved items") },
    { icon: "local-offer", title: "My Offers", subtitle: "Special deals for you", onPress: () => Alert.alert("Offers", "Your special offers") },
    { icon: "history", title: "Recently Viewed", subtitle: "Browsing history", onPress: () => Alert.alert("History", "Recently viewed items") },
    { icon: "settings", title: "Settings", subtitle: "App preferences", onPress: () => Alert.alert("Settings", "Coming soon!") },
    { icon: "help-outline", title: "Help & Support", subtitle: "Get assistance", onPress: () => Alert.alert("Help", "Contact support@marketconnect.com") },
    { icon: "security", title: "Privacy Policy", subtitle: "Your data is safe", onPress: () => Alert.alert("Privacy", "Your data is protected") },
    { icon: "star", title: "Rate App", subtitle: "Share your feedback", onPress: () => Alert.alert("Rate Us", "Thank you!") },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Gradient Background */}
      <LinearGradient
        colors={['#FF9900', '#FFAD33']}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <MaterialIcons name="person" size={28} color="white" />
            <Text style={styles.headerTitle}>My Account</Text>
          </View>
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
            <MaterialIcons name="logout" size={22} color="white" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Profile Card - Amazon Style */}
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {user.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditProfile}>
                <MaterialIcons name="edit" size={16} color="white" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.profileInfo}>
              <Text style={styles.userName}>{user.name}</Text>
              <View style={styles.roleBadge}>
                <MaterialIcons name="verified" size={14} color="#059669" />
                <Text style={styles.roleText}>{user.role}</Text>
              </View>
            </View>
          </View>

          {/* User Info */}
          <View style={styles.infoSection}>
            <InfoItem icon="email" label="Email" value={user.email} />
            <InfoItem icon="phone" label="Phone" value={user.phone} />
            <InfoItem icon="location-on" label="Address" value={user.address} />
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
              <MaterialIcons name="edit" size={20} color="#2563EB" />
              <Text style={styles.actionButtonText}>Edit Profile</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.actionButton, styles.orderButton]} onPress={handleViewOrders}>
              <MaterialIcons name="receipt" size={20} color="#8B5CF6" />
              <Text style={[styles.actionButtonText, styles.orderButtonText]}>My Orders</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Amazon-style Account Section */}
        <View style={styles.accountSection}>
          <Text style={styles.sectionTitle}>Your Account</Text>
          
          <View style={styles.optionsGrid}>
            {profileOptions.map((item, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.optionCard}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={styles.optionIconContainer}>
                  <MaterialIcons name={item.icon} size={24} color="#374151" />
                </View>
                <View style={styles.optionTextContainer}>
                  <Text style={styles.optionTitle}>{item.title}</Text>
                  <Text style={styles.optionSubtitle}>{item.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Stats Section */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Activity</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialIcons name="shopping-cart" size={24} color="#FF9900" />
              <Text style={styles.statNumber}>12</Text>
              <Text style={styles.statLabel}>Orders</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="favorite" size={24} color="#DC2626" />
              <Text style={styles.statNumber}>8</Text>
              <Text style={styles.statLabel}>Wishlist</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="star" size={24} color="#F59E0B" />
              <Text style={styles.statNumber}>4.8</Text>
              <Text style={styles.statLabel}>Rating</Text>
            </View>
            <View style={styles.statCard}>
              <MaterialIcons name="local-offer" size={24} color="#059669" />
              <Text style={styles.statNumber}>5</Text>
              <Text style={styles.statLabel}>Offers</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MarketConnect Account • Since 2024
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 MarketConnect. All rights reserved.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Info Item Component
const InfoItem = ({ icon, label, value }) => (
  <View style={styles.infoItem}>
    <View style={styles.infoIconContainer}>
      <MaterialIcons name={icon} size={18} color="#6B7280" />
    </View>
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue} numberOfLines={1}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
  },
  header: {
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "white",
    marginLeft: 10,
  },
  logoutBtn: {
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 10,
  },
  scrollView: {
    flex: 1,
  },
  profileCard: {
    backgroundColor: "white",
    margin: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  avatarContainer: {
    position: "relative",
    marginRight: 16,
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FF9900",
  },
  avatarText: {
    fontSize: 28,
    fontWeight: "700",
    color: "#92400E",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#FF9900",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 4,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  roleText: {
    color: "#059669",
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  infoSection: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoIconContainer: {
    width: 32,
  },
  infoContent: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 8,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EFF6FF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  orderButton: {
    backgroundColor: "#F5F3FF",
    borderColor: "#EDE9FE",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2563EB",
    marginLeft: 6,
  },
  orderButtonText: {
    color: "#8B5CF6",
  },
  accountSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 16,
  },
  optionsGrid: {
    gap: 12,
  },
  optionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  optionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 2,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#6B7280",
  },
  statsSection: {
    backgroundColor: "white",
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#F9FAFB",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  footer: {
    padding: 16,
    paddingBottom: 32,
    alignItems: "center",
  },
  footerText: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 11,
    color: "#9CA3AF",
  },
});