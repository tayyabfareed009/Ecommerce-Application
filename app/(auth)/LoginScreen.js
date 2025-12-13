import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
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

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    console.log("Login button pressed!");

    if (!email || !password) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Sending login request to:", `${API_URL}/login`);

      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("Login response:", data);

      if (!response.ok) {
        Alert.alert("Error", data.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      const { token, id, role, name, address, email: userEmail } = data;
      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("id", id);
      await AsyncStorage.setItem("role", role);
      await AsyncStorage.setItem("name", name);
      await AsyncStorage.setItem("address", address);
      await AsyncStorage.setItem("email", userEmail);

      Alert.alert("Welcome", `Logged in as ${role}`);

      if (role === "customer") {
        router.replace("/(buyer)/HomeScreen");
      } else if (role === "shopkeeper") {
        router.replace("/(seller)/Dashboard");
      } else {
        Alert.alert("Error", "Unknown role. Please contact support.");
      }

    } catch (err) {
      console.log("Login error:", err);
      Alert.alert("Error", "Unable to connect to server");
    } finally {
      setIsLoading(false);
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
                Welcome Back!
              </Text>
              <Text style={styles.headerSubtitle}>
                Sign in to continue your shopping journey
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content Card - Same style as WelcomeScreen */}
        <View style={styles.contentCard}>
          <View style={styles.formSection}>
            {/* Login Form */}
            <View style={styles.loginCard}>
              <Text style={styles.loginTitle}>Sign in to your account</Text>
              
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="email" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Email address"
                  placeholderTextColor="#9CA3AF"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <MaterialIcons name="lock" size={20} color="#6B7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Password"
                  placeholderTextColor="#9CA3AF"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>

              {/* Forgot Password */}
              <TouchableOpacity style={styles.forgotPasswordContainer}>
                <Text style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>

              {/* Login Button - Amazon Orange Style */}
              <TouchableOpacity 
                style={styles.loginButton}
                onPress={handleLogin}
                activeOpacity={0.9}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={['#FF9900', '#FFAD33']}
                  style={styles.loginButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Text style={styles.loginButtonText}>Signing in...</Text>
                  ) : (
                    <>
                      <MaterialIcons name="login" size={22} color="white" />
                      <Text style={styles.loginButtonText}>Sign In</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.dividerContainer}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>New to MarketConnect?</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Create Account Button */}
              <TouchableOpacity 
                style={styles.createAccountButton}
                onPress={() => router.push("/(auth)/SignupScreen")}
                activeOpacity={0.9}
              >
                <View style={styles.createAccountContent}>
                  <MaterialIcons name="person-add" size={22} color="#374151" />
                  <Text style={styles.createAccountText}>Create your MarketConnect account</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Benefits Section - Same as WelcomeScreen */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Benefits of signing in</Text>
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="history" size={20} color="#059669" />
                  <Text style={styles.benefitText}>Order History</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="favorite" size={20} color="#DC2626" />
                  <Text style={styles.benefitText}>Saved Items</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="local-offer" size={20} color="#7C3AED" />
                  <Text style={styles.benefitText}>Exclusive Deals</Text>
                </View>
              </View>
            </View>

            {/* Quick Access - Same as WelcomeScreen */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>Or continue as guest</Text>
              
              <TouchableOpacity 
                style={styles.guestCard}
                onPress={() => router.push("/(buyer)/HomeScreen")}
                activeOpacity={0.9}
              >
                <View style={styles.guestCardContent}>
                  <View style={styles.guestCardIcon}>
                    <MaterialIcons name="storefront" size={24} color="#2563EB" />
                  </View>
                  <View style={styles.guestCardText}>
                    <Text style={styles.guestCardTitle}>Continue Shopping</Text>
                    <Text style={styles.guestCardSubtitle}>
                      Browse products without signing in
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Footer - Same as WelcomeScreen */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By signing in, you agree to MarketConnect's{' '}
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
  loginCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 24,
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
  forgotPasswordContainer: {
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
  loginButton: {
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  loginButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  loginButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#6B7280',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 12,
    backgroundColor: 'white',
    paddingHorizontal: 8,
  },
  createAccountButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  createAccountContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  createAccountText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    marginLeft: 12,
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
  quickAccessSection: {
    marginBottom: 24,
  },
  quickAccessTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  guestCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    overflow: 'hidden',
  },
  guestCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  guestCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  guestCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  guestCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
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