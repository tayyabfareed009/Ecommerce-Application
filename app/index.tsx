import { View, Text, TouchableOpacity, StyleSheet, Image, Dimensions, SafeAreaView, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroContainer}>
          <Image
            source={{ uri: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070' }}
            style={styles.heroImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.95)']}
            style={styles.gradientOverlay}
          />
          
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Ionicons name="cart" size={40} color="#4A6FFF" />
            </View>
            <Text style={styles.brandName}>MarketConnect</Text>
            <Text style={styles.tagline}>Seamless Commerce Experience</Text>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.contentContainer}>
          <View style={styles.welcomeCard}>
            <Text style={styles.welcomeTitle}>Welcome to Your</Text>
            <Text style={styles.welcomeSubtitle}>Shopping & Selling Hub</Text>
            <Text style={styles.description}>
              Discover amazing products or start selling your own. Join our community of buyers and sellers.
            </Text>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Ionicons name="people" size={24} color="#4A6FFF" />
              <Text style={styles.statNumber}>50K+</Text>
              <Text style={styles.statLabel}>Active Users</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="storefront" size={24} color="#4A6FFF" />
              <Text style={styles.statNumber}>5K+</Text>
              <Text style={styles.statLabel}>Verified Sellers</Text>
            </View>
            <View style={styles.statCard}>
              <Ionicons name="shield-checkmark" size={24} color="#4A6FFF" />
              <Text style={styles.statNumber}>100%</Text>
              <Text style={styles.statLabel}>Secure</Text>
            </View>
          </View>

          {/* CTA Section */}
          <View style={styles.ctaContainer}>
            <Text style={styles.sectionTitle}>Get Started</Text>
            
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => router.push('/(auth)/LoginScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#4A6FFF', '#6B8CFF']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Ionicons name="log-in" size={22} color="white" />
                <Text style={styles.primaryButtonText}>Login to Your Account</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => router.push('/(auth)/SignupScreen')}
              activeOpacity={0.9}
            >
              <View style={styles.secondaryButtonContent}>
                <Ionicons name="person-add" size={22} color="#4A6FFF" />
                <Text style={styles.secondaryButtonText}>Create New Account</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or continue as</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Role Selection */}
            <View style={styles.roleContainer}>
              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => router.push('/(buyer)/HomeScreen')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#667EEA', '#764BA2']}
                  style={styles.roleGradient}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="bag-handle" size={28} color="white" />
                  </View>
                  <Text style={styles.roleTitle}>Buyer</Text>
                  <Text style={styles.roleDescription}>
                    Browse products & make purchases
                  </Text>
                  <View style={styles.roleCta}>
                    <Text style={styles.roleCtaText}>Continue as Buyer</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.roleCard}
                onPress={() => router.push('/(seller)/Dashboard')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#F093FB', '#F5576C']}
                  style={styles.roleGradient}
                >
                  <View style={styles.roleIconContainer}>
                    <Ionicons name="storefront" size={28} color="white" />
                  </View>
                  <Text style={styles.roleTitle}>Seller</Text>
                  <Text style={styles.roleDescription}>
                    List products & manage store
                  </Text>
                  <View style={styles.roleCta}>
                    <Text style={styles.roleCtaText}>Continue as Seller</Text>
                    <Ionicons name="arrow-forward" size={16} color="white" />
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Terms */}
            <Text style={styles.termsText}>
              By continuing, you agree to our{' '}
              <Text style={styles.linkText}>Terms of Service</Text> and{' '}
              <Text style={styles.linkText}>Privacy Policy</Text>
            </Text>
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
  scrollContainer: {
    flexGrow: 1,
  },
  heroContainer: {
    height: height * 0.25,
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  logoContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -40 }],
    alignItems: 'center',
    width: 150,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A1A1A',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    fontWeight: '500',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
  },
  welcomeCard: {
    backgroundColor: '#F8FAFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '300',
    color: '#333',
    marginBottom: 4,
  },
  welcomeSubtitle: {
    fontSize: 32,
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F8FAFF',
    padding: 16,
    borderRadius: 16,
    marginHorizontal: 6,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  ctaContainer: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 20,
  },
  primaryButton: {
    borderRadius: 16,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#4A6FFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#E8EFFE',
    borderRadius: 16,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  secondaryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  secondaryButtonText: {
    color: '#4A6FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E8EFFE',
  },
  dividerText: {
    color: '#999',
    fontSize: 14,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  roleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  roleCard: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
    marginHorizontal: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  roleGradient: {
    padding: 20,
    alignItems: 'center',
  },
  roleIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  roleTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  roleDescription: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 16,
  },
  roleCta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  roleCtaText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginRight: 4,
  },
  termsText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  linkText: {
    color: '#4A6FFF',
    fontWeight: '600',
  },
});