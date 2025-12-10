import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons'; // CHANGED: Use @expo/vector-icons
import { router } from "expo-router"; // ADDED: Expo Router import

export default function ProfileScreen() { // REMOVED: navigation prop
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
            router.replace("/(auth)/LoginScreen"); // CHANGED: router instead of navigation
          },
        },
      ]
    );
  };

  const handleEditProfile = () => {
    // ADDED: Since EditProfile screen doesn't exist yet, redirect to home
    Alert.alert("Coming Soon", "Edit profile feature will be available soon!");
    // router.push("/EditProfile"); // Uncomment when you create EditProfile screen
  };

  const handleViewOrders = () => {
    Alert.alert("Coming Soon", "Order history feature will be available soon!");
    // router.push("/Orders"); // Uncomment when you create Orders screen
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Profile</Text>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <MaterialIcons name="logout" size={26} color="#FFFFFF" /> {/* CHANGED */}
        </TouchableOpacity>
      </View>

      {/* Floating Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar with Edit Button */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={18} color="#FFFFFF" /> {/* CHANGED */}
          </TouchableOpacity>
        </View>

        {/* Name & Role */}
        <Text style={styles.name}>{user.name}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user.role}</Text>
        </View>

        {/* Info List */}
        <View style={styles.infoContainer}>
          <InfoRow icon="email" label="Email" value={user.email} />
          <InfoRow icon="phone" label="Phone" value={user.phone} />
          <InfoRow icon="location-on" label="Address" value={user.address} />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color="#0D9488" /> {/* CHANGED */}
            <Text style={styles.actionButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={[styles.actionButton, styles.orderButton]} onPress={handleViewOrders}>
            <MaterialIcons name="receipt" size={20} color="#6D28D9" /> {/* CHANGED */}
            <Text style={[styles.actionButtonText, styles.orderButtonText]}>View Orders</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Additional Options */}
      <View style={styles.optionsContainer}>
        <OptionItem icon="settings" title="Settings" onPress={() => Alert.alert("Coming Soon", "Settings feature coming soon!")} />
        <OptionItem icon="help-outline" title="Help & Support" onPress={() => Alert.alert("Help", "Contact support@ecommerce.com")} />
        <OptionItem icon="privacy-tip" title="Privacy Policy" onPress={() => Alert.alert("Privacy", "Your data is safe with us!")} />
        <OptionItem icon="star" title="Rate App" onPress={() => Alert.alert("Rate Us", "Thank you for your feedback!")} />
      </View>
    </View>
  );
}

// Reusable Info Row
const InfoRow = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <MaterialIcons name={icon} size={22} color="#0D9488" /> {/* CHANGED */}
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
  </View>
);

// Reusable Option Item
const OptionItem = ({ icon, title, onPress }) => (
  <TouchableOpacity style={styles.optionItem} onPress={onPress}>
    <View style={styles.optionLeft}>
      <MaterialIcons name={icon} size={24} color="#475569" /> {/* CHANGED */}
      <Text style={styles.optionTitle}>{title}</Text>
    </View>
    <MaterialIcons name="chevron-right" size={24} color="#94A3B8" /> {/* CHANGED */}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
    paddingBottom: 32,
    backgroundColor: "#0D9488",
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    position: "relative",
  },
  headerTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  logoutBtn: {
    position: "absolute",
    right: 32,
    top: 64,
    padding: 10,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
  },

  profileCard: {
    marginHorizontal: 24,
    marginTop: -60,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 36,
    paddingHorizontal: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 20,
    borderWidth: 1.5,
    borderColor: "#F1F5F9",
  },

  avatarContainer: {
    position: "relative",
    marginBottom: 24,
  },
  avatar: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 8,
    borderColor: "#FFFFFF",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 16,
  },
  avatarText: {
    fontSize: 60,
    fontWeight: "800",
    color: "#0D9488",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 8,
    right: 0,
    backgroundColor: "#0D9488",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },

  name: {
    fontSize: 30,
    fontWeight: "800",
    color: "#1E293B",
    marginBottom: 8,
    textAlign: "center",
  },
  roleBadge: {
    backgroundColor: "#F0FDF4",
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 32,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
  },
  roleText: {
    color: "#16A34A",
    fontSize: 15,
    fontWeight: "700",
  },

  infoContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  infoLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  infoLabel: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
    marginLeft: 14,
  },
  infoValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
  },

  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F0FDF4",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 14,
    marginHorizontal: 6,
    borderWidth: 1.5,
    borderColor: "#BBF7D0",
  },
  orderButton: {
    backgroundColor: "#F5F3FF",
    borderColor: "#DDD6FE",
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0D9488",
    marginLeft: 8,
  },
  orderButtonText: {
    color: "#6D28D9",
  },

  optionsContainer: {
    marginTop: 20,
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  optionItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 16,
  },
});