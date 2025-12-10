import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Platform // ADDED: For platform detection
} from "react-native";
import { MaterialIcons } from '@expo/vector-icons';
import { router } from "expo-router";

export default function SellerProfile() {
  const [seller, setSeller] = useState({
    name: "",
    email: "",
    address: "",
    phone: "",
    storeName: "",
    totalProducts: 0,
    rating: 0,
  });
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const loadSeller = async () => {
      try {
        // Debug: Check what's in AsyncStorage
        await checkStorage();
        
        const name = await AsyncStorage.getItem("name");
        const email = await AsyncStorage.getItem("email");
        const address = await AsyncStorage.getItem("address");
        const phone = await AsyncStorage.getItem("phone");
        const storeName = await AsyncStorage.getItem("storeName") || "My Store";
        const totalProducts = await AsyncStorage.getItem("totalProducts") || "0";
        const rating = await AsyncStorage.getItem("rating") || "4.8";

        console.log("Loaded seller data:", { name, email, address, phone });

        setSeller({
          name: name || "Seller Name",
          email: email || "seller@example.com",
          address: address || "Not provided",
          phone: phone || "Not provided",
          storeName,
          totalProducts: parseInt(totalProducts),
          rating: parseFloat(rating).toFixed(1),
        });
      } catch (error) {
        console.error("Error loading seller:", error);
      }
    };
    loadSeller();
  }, []);

  // ADDED: Platform-specific alert function
  const showAlert = (title, message) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}\n\n${message}`);
    } else {
      // For native, you would use Alert.alert
      // Alert.alert(title, message);
      window.alert(`${title}\n\n${message}`); // Fallback for web
    }
  };

  // ADDED: Platform-specific confirm function
  const showConfirm = (title, message) => {
    if (Platform.OS === 'web') {
      return window.confirm(`${title}\n\n${message}`);
    } else {
      // For native, you would use Alert.alert with buttons
      return new Promise((resolve) => {
        showAlert(title, message + "\n\nPress OK to continue.");
        // For web, we'll simulate a confirm with alert
        // In a real app, you'd need a custom modal for native
        resolve(true); // Always return true for web
      });
    }
  };

  const checkStorage = async () => {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      console.log("🔍 All keys in storage:", allKeys);
      
      const multiGet = await AsyncStorage.multiGet(allKeys);
      console.log("📦 All storage items:", multiGet);
    } catch (error) {
      console.error("❌ Error checking storage:", error);
    }
  };

  const handleLogout = async () => {
    const confirmed = showConfirm("Logout", "Are you sure you want to log out?");
    
    if (confirmed) {
      await performLogout();
    }
  };

  const performLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      console.log("🔄 Checking storage before logout...");
      await checkStorage();
      
      // Clear all AsyncStorage items
      await AsyncStorage.clear();
      
      console.log("✅ AsyncStorage cleared successfully");
      
      // Debug: Check storage after clearing
      console.log("🔄 Checking storage after clearing...");
      const keysAfterClear = await AsyncStorage.getAllKeys();
      console.log("📭 Keys after clear:", keysAfterClear);
      
      // Navigate to login screen
      console.log("🔄 Navigating to LoginScreen...");
      router.replace("/(auth)/LoginScreen");
      
    } catch (error) {
      console.error("❌ Error during logout:", error);
      showAlert("Error", "Failed to logout. Please try again.");
    } finally {
      setIsLoggingOut(false);
    }
  };

  const handleEditProfile = () => {
    showAlert("Coming Soon", "Edit profile feature will be available soon!");
  };

  const debugStorage = () => {
    checkStorage();
  };

  return (
    <View style={styles.container}>
      {/* Premium Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Seller Profile</Text>
        <TouchableOpacity 
          style={[styles.logoutBtn, isLoggingOut && styles.logoutBtnDisabled]} 
          onPress={handleLogout}
          disabled={isLoggingOut}
        >
          {isLoggingOut ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <MaterialIcons name="logout" size={26} color="#FFFFFF" />
          )}
        </TouchableOpacity>
        
        {/* ADDED: Debug button */}
        <TouchableOpacity 
          style={[styles.debugBtn]} 
          onPress={debugStorage}
        >
          <MaterialIcons name="bug-report" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Avatar with edit pencil icon */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {seller.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          {/* ADDED: Edit pencil icon on avatar */}
          <TouchableOpacity 
            style={styles.editAvatarBtn}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Name & Role */}
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{seller.name}</Text>
          {/* ADDED: Edit pencil icon next to name */}
          <TouchableOpacity 
            style={styles.editNameBtn}
            onPress={handleEditProfile}
          >
            <MaterialIcons name="edit" size={18} color="#0D9488" />
          </TouchableOpacity>
        </View>
        <Text style={styles.role}>Professional Seller</Text>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.totalProducts}</Text>
            <Text style={styles.statLabel}>Products</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{seller.rating}</Text>
            <Text style={styles.statLabel}>Rating</Text>
          </View>
        </View>

        {/* Info List with edit icons */}
        <View style={styles.infoContainer}>
          <InfoRow 
            icon="store" 
            label="Store Name" 
            value={seller.storeName} 
            onEdit={handleEditProfile}
          />
          <InfoRow 
            icon="email" 
            label="Email" 
            value={seller.email} 
            onEdit={handleEditProfile}
          />
          <InfoRow 
            icon="phone" 
            label="Phone" 
            value={seller.phone} 
            onEdit={handleEditProfile}
          />
          <InfoRow 
            icon="location-on" 
            label="Address" 
            value={seller.address} 
            onEdit={handleEditProfile}
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <MaterialIcons name="edit" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.editButton, styles.dashboardButton]}
            onPress={() => router.push("/(seller)/Dashboard")}
          >
            <MaterialIcons name="dashboard" size={20} color="#FFFFFF" />
            <Text style={styles.editButtonText}>Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// Updated InfoRow component with edit pencil
const InfoRow = ({ icon, label, value, onEdit }) => (
  <View style={styles.infoRow}>
    <View style={styles.infoLeft}>
      <MaterialIcons name={icon} size={22} color="#0D9488" />
      <Text style={styles.infoLabel}>{label}</Text>
    </View>
    <View style={styles.infoRight}>
      <Text style={styles.infoValue} numberOfLines={2}>{value}</Text>
      {/* ADDED: Edit pencil icon */}
      <TouchableOpacity style={styles.infoEditBtn} onPress={onEdit}>
        <MaterialIcons name="edit" size={16} color="#64748B" />
      </TouchableOpacity>
    </View>
  </View>
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
    fontSize: 32,
    fontWeight: "800",
    color: "#FFFFFF",
    letterSpacing: -0.5,
  },
  logoutBtn: {
    position: "absolute",
    right: 32,
    top: 64,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
  },
  debugBtn: {
    position: "absolute",
    left: 32,
    top: 64,
    padding: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
  },
  logoutBtnDisabled: {
    opacity: 0.7,
  },

  profileCard: {
    marginHorizontal: 32,
    marginTop: -50,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingVertical: 32,
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

  // Updated avatar with edit button
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#ECFDF5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 6,
    borderColor: "#FFFFFF",
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#0D9488",
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatarText: {
    fontSize: 56,
    fontWeight: "800",
    color: "#0D9488",
  },

  // Updated name with edit button
  nameContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  name: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1E293B",
  },
  editNameBtn: {
    marginLeft: 10,
    padding: 4,
    backgroundColor: "#F0FDF4",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  role: {
    fontSize: 17,
    color: "#64748B",
    fontWeight: "600",
    marginBottom: 24,
  },

  statsRow: {
    flexDirection: "row",
    backgroundColor: "#F0FDF4",
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderRadius: 20,
    marginBottom: 28,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 26,
    fontWeight: "800",
    color: "#0D9488",
  },
  statLabel: {
    fontSize: 14,
    color: "#64748B",
    marginTop: 4,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: "100%",
    backgroundColor: "#BBF7D0",
  },

  // Updated info container
  infoContainer: {
    width: "100%",
    backgroundColor: "#F8FAFC",
    borderRadius: 20,
    padding: 20,
    marginBottom: 32,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
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
    marginLeft: 12,
  },
  // Updated info right side
  infoRight: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end",
  },
  infoValue: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "600",
    textAlign: "right",
    flex: 1,
    marginRight: 8,
  },
  infoEditBtn: {
    padding: 4,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },

  buttonContainer: {
    flexDirection: "row",
    gap: 16,
    width: "100%",
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0D9488",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: "#0D9488",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    gap: 8,
  },
  dashboardButton: {
    backgroundColor: "#6D28D9",
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});