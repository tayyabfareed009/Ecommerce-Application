import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { router } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const { height } = Dimensions.get('window');

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cartCount, setCartCount] = useState(3);
  const [showStickyHeader, setShowStickyHeader] = useState(false);

  const scrollY = new Animated.Value(0);

  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setShowStickyHeader(offsetY > 100);
  };

  const baseURL = "https://ecommerce-app-three-rho.vercel.app";

  const buildImageUrl = (imgPath) => {
    if (!imgPath) return null;
    if (imgPath.startsWith("http")) return imgPath;
    const cleanPath = imgPath.replace(/^\/+/, "");
    return `${baseURL.replace(/\/$/, "")}/${cleanPath}`;
  };

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${baseURL}/products`);
      const data = await response.json();
      const productsArray = Array.isArray(data) ? data : data?.products || [];

      const normalized = productsArray.map((p, i) => {
        const rawImage = p.image || p.img || p.photo || p.image_url || "";

        return {
          ...p,
          id: p._id || p.id || i.toString(),
          image: buildImageUrl(rawImage),
          rating: p.rating || (Math.random() * 1.5 + 3.5).toFixed(1),
          discount: i % 3 === 0 ? Math.floor(Math.random() * 35) + 15 : 0,
          isFeatured: i % 4 === 0,
          soldCount: Math.floor(Math.random() * 500) + 50, // Add sold count for social proof
        };
      });

      setProducts(normalized);
      setFilteredProducts(normalized);
    } catch (err) {
      console.log("Fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    const q = searchQuery.toLowerCase();
    let filtered = products;

    if (q) {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter(p =>
        p.category?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, products]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedCategory("All");
    fetchProducts();
  };

  const categories = [
    { name: "All", icon: "category" },
    { name: "Electronics", icon: "devices" },
    { name: "Fashion", icon: "checkroom" },
    { name: "Home", icon: "home" },
    { name: "Beauty", icon: "spa" },
    { name: "Sports", icon: "sports-basketball" },
  ];

  const renderProduct = ({ item, index }) => {
    const isLastInRow = index % 2 === 1;
    
    return (
      <View style={[styles.productCardWrapper, isLastInRow && styles.lastInRow]}>
        <TouchableOpacity
          style={styles.productCard}
          activeOpacity={0.9}
          onPress={() => router.push({
            pathname: "/(buyer)/product-details",
            params: { product: JSON.stringify(item) },
          })}
        >
          {/* Product Image Container */}
          <View style={styles.imageContainer}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <MaterialIcons name="image" size={40} color="#D1D5DB" />
              </View>
            )}

            {/* Discount Badge with improved styling */}
            {item.discount > 0 && (
              <LinearGradient
                colors={['#FF3B30', '#FF6B6B']}
                style={styles.discountBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </LinearGradient>
            )}

            {/* Featured Badge with gradient */}
            {item.isFeatured && (
              <LinearGradient
                colors={['#8B5CF6', '#A78BFA']}
                style={styles.featuredBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <MaterialIcons name="star" size={14} color="#FFF" />
                <Text style={styles.featuredText}>FEATURED</Text>
              </LinearGradient>
            )}

            {/* Quick View Button */}
            <TouchableOpacity style={styles.quickViewButton}>
              <MaterialIcons name="visibility" size={18} color="#374151" />
            </TouchableOpacity>

            {/* Sold Count Badge */}
            <View style={styles.soldBadge}>
              <MaterialIcons name="local-fire-department" size={12} color="#FF9900" />
              <Text style={styles.soldText}>{item.soldCount} sold</Text>
            </View>
          </View>

          {/* Product Info */}
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name || "Product Name"}
            </Text>
            
            <Text style={styles.productCategory}>
              {item.category || "Category"}
            </Text>

            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                ${item.discount > 0
                  ? (item.price * (1 - item.discount / 100)).toFixed(2)
                  : Number(item.price || 0).toFixed(2)}
              </Text>
              {item.discount > 0 && (
                <Text style={styles.originalPrice}>
                  ${Number(item.price).toFixed(2)}
                </Text>
              )}
            </View>

            {/* Rating and Add to Cart */}
            <View style={styles.bottomRow}>
              <View style={styles.ratingContainer}>
                <MaterialIcons name="star" size={14} color="#FF9900" />
                <Text style={styles.ratingText}>{item.rating}</Text>
                <Text style={styles.reviewCount}>({Math.floor(Math.random() * 500) + 50})</Text>
              </View>
              
              <TouchableOpacity style={styles.addToCartButton}>
                <MaterialIcons name="add-shopping-cart" size={18} color="#FF9900" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <MaterialIcons name="shopping-cart" size={64} color="#FF9900" />
        <Text style={styles.loadingTitle}>Loading Products...</Text>
        <ActivityIndicator size="large" color="#FF9900" style={{ marginTop: 20 }} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Background Image - Amazon Style */}
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
            <TouchableOpacity 
              style={styles.stickyCartButton}
              onPress={() => router.push("/(buyer)/cart")}
            >
              <MaterialIcons name="shopping-cart" size={22} color="#374151" />
              {cartCount > 0 && (
                <View style={styles.cartBadge}>
                  <Text style={styles.cartBadgeText}>{cartCount}</Text>
                </View>
              )}
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
        {/* Header with Gradient Overlay */}
        <View style={styles.heroSection}>
          <LinearGradient
            colors={['rgba(0,0,0,0.7)', 'rgba(0,0,0,0.4)', 'transparent']}
            style={styles.heroOverlay}
          >
            <View style={styles.header}>
              {/* Top Row */}
              <View style={styles.headerTop}>
                <TouchableOpacity 
                  style={styles.menuButton}
                  onPress={() => router.push("/(buyer)/profile")}
                >
                  <MaterialIcons name="menu" size={28} color="white" />
                </TouchableOpacity>
                
                <View style={styles.headerLogo}>
                  <MaterialIcons name="shopping-cart" size={28} color="#FF9900" />
                  <View style={styles.appTitleContainer}>
                    <Text style={styles.appTitle}>Market</Text>
                    <Text style={styles.appTitleAccent}>Connect</Text>
                  </View>
                </View>
                
                <View style={styles.headerActions}>
                  <TouchableOpacity style={styles.headerIconButton}>
                    <MaterialIcons name="search" size={24} color="white" />
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.headerIconButton}
                    onPress={() => router.push("/(buyer)/cart")}
                  >
                    <MaterialIcons name="shopping-cart" size={24} color="white" />
                    {cartCount > 0 && (
                      <View style={styles.cartBadge}>
                        <Text style={styles.cartBadgeText}>{cartCount}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {/* Welcome Section */}
              <View style={styles.welcomeSection}>
                <Text style={styles.welcomeText}>Welcome back!</Text>
                <Text style={styles.marketplaceText}>Your E-commerce   </Text>
                <Text style={styles.marketplaceText}>Marketplace</Text>
                <Text style={styles.subtitleText}>
                  Discover amazing products at unbeatable prices
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* Main Content Card */}
        <View style={styles.contentCard}>
          {/* Search Bar */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={22} color="#6B7280" style={styles.searchIcon} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search products, brands, and categories"
                placeholderTextColor="#9CA3AF"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <MaterialIcons name="close" size={22} color="#6B7280" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Categories Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Shop Categories</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoriesScroll}
              contentContainerStyle={styles.categoriesContent}
            >
              {categories.map((category) => (
                <TouchableOpacity
                  key={category.name}
                  style={[
                    styles.categoryCard,
                    selectedCategory === category.name && styles.categoryCardActive
                  ]}
                  onPress={() => setSelectedCategory(category.name)}
                >
                  <LinearGradient
                    colors={selectedCategory === category.name ? 
                      ['#FF9900', '#FFAD33'] : 
                      ['#F9FAFB', '#F3F4F6']
                    }
                    style={[
                      styles.categoryIconContainer,
                      selectedCategory === category.name && styles.categoryIconActive
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons 
                      name={category.icon} 
                      size={24} 
                      color={selectedCategory === category.name ? "white" : "#6B7280"} 
                    />
                  </LinearGradient>
                  <Text style={[
                    styles.categoryName,
                    selectedCategory === category.name && styles.categoryNameActive
                  ]}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Featured Banner with Amazon Style */}
          <View style={styles.section}>
            <TouchableOpacity style={styles.featuredBanner} activeOpacity={0.9}>
              <LinearGradient
                colors={['#FF9900', '#FFAD33']}
                style={styles.bannerGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <View style={styles.bannerContent}>
                  <View style={styles.bannerTextContainer}>
                    <Text style={styles.bannerTitle}>Prime Day Deals</Text>
                    <Text style={styles.bannerSubtitle}>Up to 60% OFF</Text>
                    <Text style={styles.bannerDescription}>
                      Exclusive offers for our customers
                    </Text>
                    <TouchableOpacity style={styles.shopNowButton}>
                      <Text style={styles.shopNowText}>Shop Now</Text>
                      <MaterialIcons name="arrow-forward" size={18} color="#FF9900" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.bannerImageContainer}>
                    <MaterialIcons name="local-offer" size={80} color="rgba(255,255,255,0.9)" />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Products Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {selectedCategory === "All" ? "Recommended For You" : selectedCategory}
              </Text>
              <Text style={styles.productCount}>
                {filteredProducts.length} items
              </Text>
            </View>

            {filteredProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="search-off" size={80} color="#E5E7EB" />
                <Text style={styles.emptyStateTitle}>No products found</Text>
                <Text style={styles.emptyStateText}>
                  Try adjusting your search or select a different category
                </Text>
              </View>
            ) : (
              <View style={styles.productsGrid}>
                <FlatList
                  data={filteredProducts}
                  renderItem={renderProduct}
                  keyExtractor={(item) => item.id}
                  numColumns={2}
                  scrollEnabled={false}
                  columnWrapperStyle={styles.productRow}
                  showsVerticalScrollIndicator={false}
                />
              </View>
            )}
          </View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featureItem}>
              <LinearGradient
                colors={['#EFF6FF', '#DBEAFE']}
                style={styles.featureIconContainer}
              >
                <MaterialIcons name="local-shipping" size={28} color="#2563EB" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Free Shipping</Text>
              <Text style={styles.featureDescription}>On orders over $50</Text>
            </View>
            
            <View style={styles.featureItem}>
              <LinearGradient
                colors={['#F0F9FF', '#E0F2FE']}
                style={styles.featureIconContainer}
              >
                <MaterialIcons name="security" size={28} color="#059669" />
              </LinearGradient>
              <Text style={styles.featureTitle}>Secure Payment</Text>
              <Text style={styles.featureDescription}>100% protected</Text>
            </View>
            
            <View style={styles.featureItem}>
              <LinearGradient
                colors={['#F5F3FF', '#EDE9FE']}
                style={styles.featureIconContainer}
              >
                <MaterialIcons name="support-agent" size={28} color="#7C3AED" />
              </LinearGradient>
              <Text style={styles.featureTitle}>24/7 Support</Text>
              <Text style={styles.featureDescription}>Always here to help</Text>
            </View>
          </View>

          {/* Amazon-Style Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>
              By shopping with us, you agree to our{' '}
              <Text style={styles.footerLink}>Conditions of Use</Text> and{' '}
              <Text style={styles.footerLink}>Privacy Notice</Text>.
            </Text>
            <Text style={styles.copyright}>© 2024 MarketConnect.com</Text>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  stickyHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginLeft: 8,
  },
  stickyCartButton: {
    position: 'relative',
    padding: 8,
  },
  heroSection: {
    height: height * 0.35,
  },
  heroOverlay: {
    flex: 1,
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  header: {
    flex: 1,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  menuButton: {
    padding: 8,
  },
  headerLogo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  appTitleContainer: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: 'white',
  },
  appTitleAccent: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FF9900',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconButton: {
    padding: 8,
    marginLeft: 12,
    position: 'relative',
  },
  cartBadge: {
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
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  welcomeSection: {
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 18,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  marketplaceText: {
    fontSize: 32,
    color: 'white',
    fontWeight: '800',
  },
  subtitleText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
  },
  contentCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    minHeight: height * 0.7,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#374151',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
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
  productCount: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoriesScroll: {
    marginLeft: -20,
    paddingLeft: 20,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 80,
  },
  categoryCardActive: {
    transform: [{ scale: 1.05 }],
  },
  categoryIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIconActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  categoryName: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    textAlign: 'center',
  },
  categoryNameActive: {
    color: '#FF9900',
    fontWeight: '600',
  },
  featuredBanner: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  bannerGradient: {
    padding: 24,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  bannerSubtitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: '700',
    marginBottom: 8,
  },
  bannerDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 16,
  },
  shopNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  shopNowText: {
    color: '#FF9900',
    fontSize: 16,
    fontWeight: '700',
    marginRight: 8,
  },
  bannerImageContainer: {
    marginLeft: 20,
  },
  productsGrid: {
    marginHorizontal: -8,
  },
  productRow: {
    justifyContent: 'space-between',
    paddingHorizontal: 8,
  },
  productCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  lastInRow: {
    marginLeft: '4%',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  imageContainer: {
    position: 'relative',
    height: 160,
    backgroundColor: '#F9FAFB',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  discountBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  featuredBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  featuredText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  soldBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  soldText: {
    fontSize: 10,
    color: '#374151',
    fontWeight: '600',
    marginLeft: 4,
  },
  quickViewButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: 'white',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    lineHeight: 20,
    height: 40,
  },
  productCategory: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF9900',
  },
  originalPrice: {
    fontSize: 12,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginLeft: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#92400E',
    marginLeft: 4,
  },
  reviewCount: {
    fontSize: 10,
    color: '#6B7280',
    marginLeft: 4,
  },
  addToCartButton: {
    padding: 8,
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 40,
  },
  featureItem: {
    alignItems: 'center',
    flex: 1,
    paddingHorizontal: 8,
  },
  featureIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
    textAlign: 'center',
  },
  featureDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
  },
  footerLink: {
    color: '#2563EB',
    textDecorationLine: 'underline',
  },
  copyright: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
});