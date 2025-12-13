import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Dimensions, Image, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(offsetY > 100);
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
            <MaterialIcons name="shopping-cart" size={24} color="#FF9900" />
            <Text style={styles.stickyHeaderText}>MarketConnect</Text>
          </View>
        </View>
      )}

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Main Hero Section */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.3)', 'transparent']}
            style={styles.heroOverlay}
          >
            {/* Main App Header */}
            <View style={styles.mainHeader}>
              <View style={styles.appLogo}>
                <MaterialIcons name="shopping-cart" size={36} color="#FF9900" />
                <View style={styles.appTitleContainer}>
                  <Text style={styles.appTitle}>Market</Text>
                  <Text style={styles.appTitleAccent}>Connect</Text>
                </View>
              </View>
              
              <Text style={styles.heroTagline}>
                Your Favorite Marketplace for Everything
              </Text>
            </View>

            {/* Hero Stats */}
            <View style={styles.heroStats}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>50K+</Text>
                <Text style={styles.statLabel}>Happy Customers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5K+</Text>
                <Text style={styles.statLabel}>Sellers</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <MaterialIcons name="verified" size={20} color="#34D399" />
                <Text style={styles.statLabel}>Verified</Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content Cards */}
        <View style={styles.contentSection}>
          {/* Welcome Card - Amazon Style */}
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeHeader}>
              <Text style={styles.welcomeTitle}>Welcome!</Text>
              <MaterialIcons name="waving-hand" size={24} color="#FF9900" />
            </View>
            <Text style={styles.welcomeSubtitle}>
              Find everything you need at amazing prices
            </Text>
            <View style={styles.featuresRow}>
              <View style={styles.feature}>
                <MaterialIcons name="local-shipping" size={20} color="#2563EB" />
                <Text style={styles.featureText}>Free Delivery</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="security" size={20} color="#2563EB" />
                <Text style={styles.featureText}>Secure Payment</Text>
              </View>
              <View style={styles.feature}>
                <MaterialIcons name="refresh" size={20} color="#2563EB" />
                <Text style={styles.featureText}>Easy Returns</Text>
              </View>
            </View>
          </View>

          {/* Action Section - Amazon Style */}
          <View style={styles.actionSection}>
            <Text style={styles.sectionTitle}>Sign in for better experience</Text>
            
            {/* Sign In Button - Amazon Orange */}
            <TouchableOpacity 
              style={styles.amazonButton}
              onPress={() => router.push('/(auth)/LoginScreen')}
              activeOpacity={0.9}
            >
              <LinearGradient
                colors={['#FF9900', '#FFAD33']}
                style={styles.amazonButtonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="login" size={22} color="white" />
                <Text style={styles.amazonButtonText}>Sign in to your account</Text>
                <MaterialIcons name="arrow-forward" size={22} color="white" />
              </LinearGradient>
            </TouchableOpacity>

            {/* Create Account Button */}
            <TouchableOpacity 
              style={styles.createAccountButton}
              onPress={() => router.push('/(auth)/SignupScreen')}
              activeOpacity={0.9}
            >
              <View style={styles.createAccountContent}>
                <MaterialIcons name="person-add" size={22} color="#374151" />
                <Text style={styles.createAccountText}>Create your MarketConnect account</Text>
              </View>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>Or shop as guest</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Quick Access Cards - Flipkart/Amazon Style */}
            <View style={styles.quickAccessSection}>
              <Text style={styles.quickAccessTitle}>Quick Access</Text>
              
              <TouchableOpacity 
                style={styles.shopCard}
                onPress={() => router.push('/(buyer)/HomeScreen')}
                activeOpacity={0.9}
              >
                <View style={styles.shopCardContent}>
                  <View style={styles.shopCardIcon}>
                    <MaterialIcons name="storefront" size={28} color="#2563EB" />
                  </View>
                  <View style={styles.shopCardText}>
                    <Text style={styles.shopCardTitle}>Shop as Guest</Text>
                    <Text style={styles.shopCardSubtitle}>
                      Browse millions of products without signing in
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
                <View style={styles.shopCardFooter}>
                  <Text style={styles.shopCardFooterText}>Start Shopping →</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.sellerCard}
                onPress={() => router.push('/(seller)/Dashboard')}
                activeOpacity={0.9}
              >
                <View style={styles.sellerCardContent}>
                  <View style={styles.sellerCardIcon}>
                    <MaterialIcons name="business" size={28} color="#8B5CF6" />
                  </View>
                  <View style={styles.sellerCardText}>
                    <Text style={styles.sellerCardTitle}>Become a Seller</Text>
                    <Text style={styles.sellerCardSubtitle}>
                      Start selling to millions of customers
                    </Text>
                  </View>
                  <MaterialIcons name="chevron-right" size={24} color="#9CA3AF" />
                </View>
                <View style={styles.sellerCardFooter}>
                  <Text style={styles.sellerCardFooterText}>Start Selling →</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Benefits Section */}
            <View style={styles.benefitsSection}>
              <Text style={styles.benefitsTitle}>Why Shop With Us</Text>
              <View style={styles.benefitsGrid}>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="price-check" size={24} color="#059669" />
                  <Text style={styles.benefitText}>Best Price</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="delivery-dining" size={24} color="#2563EB" />
                  <Text style={styles.benefitText}>Fast Delivery</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="support-agent" size={24} color="#7C3AED" />
                  <Text style={styles.benefitText}>24/7 Support</Text>
                </View>
                <View style={styles.benefitItem}>
                  <MaterialIcons name="autorenew" size={24} color="#DC2626" />
                  <Text style={styles.benefitText}>Easy Returns</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By continuing, you agree to MarketConnect's{' '}
              <Text style={styles.footerLink}>Conditions of Use</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Notice</Text>.
            </Text>
            
            <View style={styles.footerLinks}>
              <TouchableOpacity style={styles.footerLinkButton}>
                <Text style={styles.footerLinkButtonText}>Help</Text>
              </TouchableOpacity>
              <View style={styles.footerDivider} />
              <TouchableOpacity style={styles.footerLinkButton}>
                <Text style={styles.footerLinkButtonText}>Privacy</Text>
              </TouchableOpacity>
              <View style={styles.footerDivider} />
              <TouchableOpacity style={styles.footerLinkButton}>
                <Text style={styles.footerLinkButtonText}>Terms</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.copyright}>
              © 2021-2024 MarketConnect.com, Inc. or its affiliates
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
    justifyContent: 'center',
  },
  stickyHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  heroSection: {
    height: height * 0.4,
  },
  heroOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  mainHeader: {
    alignItems: 'center',
    marginBottom: 30,
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
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  appTitleAccent: {
    fontSize: 32,
    fontWeight: '800',
    color: '#FF9900',
  },
  heroTagline: {
    fontSize: 18,
    color: 'white',
    textAlign: 'center',
    fontWeight: '500',
  },
  heroStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#D1D5DB',
  },
  contentSection: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    minHeight: height * 0.7,
  },
  welcomeCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  welcomeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginRight: 8,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: '#4B5563',
    marginBottom: 16,
  },
  featuresRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  featureText: {
    fontSize: 12,
    color: '#374151',
    marginLeft: 6,
    fontWeight: '500',
  },
  actionSection: {
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  amazonButton: {
    borderRadius: 8,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#F59E0B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  amazonButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
  },
  amazonButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  createAccountButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    marginBottom: 24,
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
  quickAccessSection: {
    marginBottom: 32,
  },
  quickAccessTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  shopCard: {
    backgroundColor: '#F0F9FF',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0F2FE',
    overflow: 'hidden',
  },
  shopCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  shopCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  shopCardText: {
    flex: 1,
  },
  shopCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: 4,
  },
  shopCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  shopCardFooter: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  shopCardFooterText: {
    color: '#1E40AF',
    fontSize: 14,
    fontWeight: '600',
  },
  sellerCard: {
    backgroundColor: '#FAF5FF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F3E8FF',
    overflow: 'hidden',
  },
  sellerCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  sellerCardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sellerCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7C3AED',
    marginBottom: 4,
  },
  sellerCardSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  sellerCardFooter: {
    backgroundColor: '#EDE9FE',
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  sellerCardFooterText: {
    color: '#7C3AED',
    fontSize: 14,
    fontWeight: '600',
  },
  benefitsSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
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
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  benefitItem: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  footerLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  footerLinks: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  footerLinkButton: {
    paddingHorizontal: 12,
  },
  footerLinkButtonText: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '500',
  },
  footerDivider: {
    width: 1,
    height: 16,
    backgroundColor: '#D1D5DB',
  },
  copyright: {
    fontSize: 11,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});