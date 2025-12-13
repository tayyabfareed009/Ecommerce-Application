import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const API_URL = "https://ecommerce-app-three-rho.vercel.app";
const { width, height } = Dimensions.get('window');

export default function Signup() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
    role: "customer",
  });

  const handleSignup = async () => {
    if (!user.name || !user.email || !user.password) {
      Alert.alert("Error", "Please fill name, email, and password");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Success", data.message || "Account created successfully!");
        router.replace("/(auth)/LoginScreen");
      } else {
        Alert.alert("Signup Failed", data.message || "Please try again");
      }
    } catch (err) {
      console.log("Signup error:", err);
      Alert.alert("Network Error", "Check your connection or server");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Background Image - Same as WelcomeScreen */}
      <Image
        source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070' }}
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section - Same as WelcomeScreen */}
        <View style={styles.header}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)']}
            style={styles.headerGradient}
          >
            <View style={styles.headerContent}>
              <View style={styles.appLogo}>
                <MaterialIcons name="shopping-cart" size={32} color="#FF9900" />
                <View style={styles.appTitleContainer}>
                  <Text style={styles.appTitle}>Market</Text>
                  <Text style={styles.appTitleAccent}>Connect</Text>
                </View>
              </View>
              
              <Text style={styles.headerTagline}>
                Create Your Account
              </Text>
              <Text style={styles.headerSubtitle}>
                Join thousands of happy customers
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content Card - Same style as WelcomeScreen */}
        <View style={styles.contentCard}>
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {/* Name Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="person" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Full Name"
                placeholderTextColor="#9CA3AF"
                value={user.name}
                onChangeText={(text) => setUser({ ...user, name: text })}
                style={styles.input}
                autoCapitalize="words"
              />
            </View>

            {/* Email Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#9CA3AF"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={user.email}
                onChangeText={(text) => setUser({ ...user, email: text })}
                style={styles.input}
              />
            </View>

            {/* Password Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#9CA3AF"
                secureTextEntry
                value={user.password}
                onChangeText={(text) => setUser({ ...user, password: text })}
                style={styles.input}
              />
            </View>

            {/* Phone Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="phone" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Phone Number"
                placeholderTextColor="#9CA3AF"
                keyboardType="phone-pad"
                value={user.phone}
                onChangeText={(text) => setUser({ ...user, phone: text })}
                style={styles.input}
              />
            </View>

            {/* Address Input */}
            <View style={styles.inputContainer}>
              <MaterialIcons name="location-on" size={20} color="#6B7280" style={styles.inputIcon} />
              <TextInput
                placeholder="Delivery Address"
                placeholderTextColor="#9CA3AF"
                value={user.address}
                onChangeText={(text) => setUser({ ...user, address: text })}
                style={styles.input}
                multiline
                numberOfLines={2}
              />
            </View>

            {/* Role Selection - Updated to match WelcomeScreen style */}
            <Text style={styles.roleTitle}>Select Account Type</Text>
            <View style={styles.roleGrid}>
              <TouchableOpacity
                style={[
                  styles.roleCard,
                  user.role === "customer" && styles.roleCardSelected
                ]}
                onPress={() => setUser({ ...user, role: "customer" })}
              >
                <View style={[
                  styles.roleIconContainer,
                  { backgroundColor: user.role === "customer" ? '#2563EB' : '#DBEAFE' }
                ]}>
                  <MaterialIcons 
                    name="person" 
                    size={24} 
                    color={user.role === "customer" ? 'white' : '#2563EB'} 
                  />
                </View>
                <Text style={[
                  styles.roleCardTitle,
                  user.role === "customer" && styles.roleCardTitleSelected
                ]}>
                  Customer
                </Text>
                <Text style={styles.roleCardDescription}>
                  Shop for products
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.roleCard,
                  user.role === "shopkeeper" && styles.roleCardSelected
                ]}
                onPress={() => setUser({ ...user, role: "shopkeeper" })}
              >
                <View style={[
                  styles.roleIconContainer,
                  { backgroundColor: user.role === "shopkeeper" ? '#8B5CF6' : '#EDE9FE' }
                ]}>
                  <MaterialIcons 
                    name="storefront" 
                    size={24} 
                    color={user.role === "shopkeeper" ? 'white' : '#8B5CF6'} 
                  />
                </View>
                <Text style={[
                  styles.roleCardTitle,
                  user.role === "shopkeeper" && styles.roleCardTitleSelected
                ]}>
                  Shopkeeper
                </Text>
                <Text style={styles.roleCardDescription}>
                  Sell your products
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Button - Amazon Orange Style */}
            <TouchableOpacity 
              style={styles.signupButton}
              onPress={handleSignup}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF9900', '#FFAD33']}
                style={styles.signupButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="person-add" size={22} color="white" />
                <Text style={styles.signupButtonText}>Create Account</Text>
              </LinearGradient>
            </TouchableOpacity>

            {/* Already have account link */}
            <TouchableOpacity 
              style={styles.loginLinkContainer}
              onPress={() => router.push("/(auth)/LoginScreen")}
            >
              <Text style={styles.loginLinkText}>
                Already have an account?{' '}
                <Text style={styles.loginLinkAccent}>Sign In</Text>
              </Text>
            </TouchableOpacity>

            {/* Benefits Section - Same as WelcomeScreen */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Why Join MarketConnect?</Text>
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="security" size={20} color="#059669" />
                  <Text style={styles.benefitText}>Secure Account</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="local-shipping" size={20} color="#2563EB" />
                  <Text style={styles.benefitText}>Fast Delivery</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="price-check" size={20} color="#7C3AED" />
                  <Text style={styles.benefitText}>Best Prices</Text>
                </View>
              </View>
            </View>

            {/* Footer - Same as WelcomeScreen */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By creating an account, you agree to MarketConnect's{' '}
                <Text style={styles.footerLink}>Conditions of Use</Text> and{' '}
                <Text style={styles.footerLink}>Privacy Notice</Text>.
              </Text>
            </View>
          </View>
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
  backgroundImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    height: height * 0.28,
  },
  headerGradient: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  headerContent: {
    alignItems: 'center',
  },
  appLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  appTitleContainer: {
    flexDirection: 'row',
    marginLeft: 12,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
  },
  appTitleAccent: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FF9900',
  },
  headerTagline: {
    fontSize: 24,
    color: 'white',
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginTop: 8,
    fontWeight: '500',
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    minHeight: height * 0.7,
  },
  formSection: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    fontSize: 16,
    color: '#1F2937',
    minHeight: 50,
  },
  roleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 8,
    marginBottom: 16,
  },
  roleGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  roleCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  roleCardSelected: {
    borderColor: '#FF9900',
    backgroundColor: '#FFF7ED',
  },
  roleIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  roleCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: 4,
    textAlign: 'center',
  },
  roleCardTitleSelected: {
    color: '#1F2937',
  },
  roleCardDescription: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  signupButton: {
    borderRadius: 12,
    marginTop: 8,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  signupButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  signupButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  loginLinkContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  loginLinkText: {
    fontSize: 16,
    color: '#6B7280',
  },
  loginLinkAccent: {
    color: '#FF9900',
    fontWeight: '600',
  },
  benefitsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
  },
  benefitsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
    textAlign: 'center',
  },
  benefitsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  benefitText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
  },
  footerLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
});