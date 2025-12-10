// HomeScreen.js - FINAL + GORGEOUS PRODUCT CARDS
import React, { useEffect, useState, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2; // Better spacing
const HEADER_MAX_HEIGHT = 300;
const HEADER_MIN_HEIGHT = 140;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function HomeScreen() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedTag, setSelectedTag] = useState("All");
  const [cartCount, setCartCount] = useState(3);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  const baseURL = "https://ecommerce-app-three-rho.vercel.app";
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_SCROLL_DISTANCE],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100],
    outputRange: [1, 0.95],
    extrapolate: "clamp",
  });

  const searchTranslateY = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, -50],
    extrapolate: "clamp",
  });

  const searchOpacity = scrollY.interpolate({
    inputRange: [80, 120],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

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
          isNew: i % 5 === 0,
          discount: i % 3 === 0 ? Math.floor(Math.random() * 35) + 15 : 0,
          colors: ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#A78BFA"]
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.floor(Math.random() * 4) + 2),
          isTrending: i % 7 === 0,
        };
      });

      setProducts(normalized);
      setFilteredProducts(normalized);
      setFeaturedProducts(normalized.filter((_, i) => i % 4 === 0).slice(0, 8));
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

    if (selectedTag !== "All") {
      filtered = filtered.filter(p =>
        p.name?.toLowerCase().includes(selectedTag.toLowerCase()) ||
        p.category?.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedTag, products]);

  const onRefresh = () => {
    setRefreshing(true);
    setSearchQuery("");
    setSelectedTag("All");
    fetchProducts();
  };

  const tags = [
    { name: "All", icon: "grid-outline" },
    { name: "Trending", icon: "flame" },
    { name: "Shirts", icon: "shirt-outline" },
    { name: "Shoes", icon: "footsteps-outline" },
    { name: "Watches", icon: "time-outline" },
    { name: "Electronics", icon: "phone-portrait-outline" },
    { name: "Accessories", icon: "glasses-outline" },
  ];

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="storefront" size={80} color="#0D9488" />
        <Text style={styles.loadingTitle}>StyleSphere</Text>
        <ActivityIndicator size="large" color="#0D9488" style={{ marginTop: 20 }} />
      </View>
    );
  }

  const renderProduct = ({ item }) => {
    const scale = new Animated.Value(1);

    const onPressIn = () => {
      Animated.spring(scale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    };

    const onPressOut = () => {
      Animated.spring(scale, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }).start();
    };

    return (
      <Animated.View style={{ transform: [{ scale }] }}>
        <TouchableOpacity
          style={styles.productCard}
          activeOpacity={1}
          onPressIn={onPressIn}
          onPressOut={onPressOut}
          onPress={() => router.push({
            pathname: "/(buyer)/product-details",
            params: { product: JSON.stringify(item) },
          })}
        >
          {/* Image Container */}
          <View style={styles.imageWrapper}>
            {item.image ? (
              <Image
                source={{ uri: item.image }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholder}>
                <Ionicons name="image-outline" size={50} color="#CBD5E1" />
              </View>
            )}

            {/* Badges */}
            {item.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>-{item.discount}%</Text>
              </View>
            )}
            {item.isNew && (
              <View style={styles.newBadge}>
                <Text style={styles.newText}>NEW</Text>
              </View>
            )}
            {item.isTrending && (
              <View style={styles.trendingBadge}>
                <Ionicons name="flame" size={18} color="#FFF" />
              </View>
            )}

            {/* Gradient Overlay on Bottom */}
            <View style={styles.gradientOverlay} />
            
            {/* Quick Add */}
            <TouchableOpacity style={styles.quickAdd}>
              <Ionicons name="add" size={26} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Info */}
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={2}>
              {item.name || "Product"}
            </Text>
            <Text style={styles.category}>{item.category || "Fashion"}</Text>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ${item.discount > 0
                  ? (item.price * (1 - item.discount / 100)).toFixed(2)
                  : Number(item.price || 0).toFixed(2)}
              </Text>
              {item.discount > 0 && (
                <Text style={styles.oldPrice}>${Number(item.price).toFixed(2)}</Text>
              )}
            </View>

            <View style={styles.bottomRow}>
              <View style={styles.rating}>
                <Ionicons name="star" size={14} color="#FFD700" />
                <Text style={styles.ratingText}>{item.rating}</Text>
              </View>
              <View style={styles.colorsRow}>
                {item.colors.slice(0, 3).map((c, i) => (
                  <View key={i} style={[styles.colorDot, { backgroundColor: c }]} />
                ))}
                {item.colors.length > 3 && (
                  <Text style={styles.moreColors}>+{item.colors.length - 3}</Text>
                )}
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  const renderTag = ({ item }) => (
    <TouchableOpacity
      style={[styles.tag, selectedTag === item.name && styles.tagActive]}
      onPress={() => setSelectedTag(item.name)}
    >
      <Ionicons name={item.icon} size={28} color={selectedTag === item.name ? "#0D9488" : "#64748B"} />
      <Text style={[styles.tagText, selectedTag === item.name && styles.tagTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Animated.View style={[styles.header, { height: headerHeight, opacity: headerOpacity }]}>
        <View style={StyleSheet.absoluteFillObject}>
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#0D9488" }]} />
          <View style={[StyleSheet.absoluteFillObject, { backgroundColor: "#14B8A6", opacity: 0.7 }]} />
        </View>

        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => router.push("/(buyer)/profile")}>
            <View style={styles.avatar}><Ionicons name="person" size={26} color="#FFF" /></View>
          </TouchableOpacity>
          <Text style={styles.logo}>StyleSphere</Text>
          <View style={styles.actions}>
            <TouchableOpacity style={styles.iconBtn}><Ionicons name="search" size={26} color="#FFF" /></TouchableOpacity>
            <TouchableOpacity style={styles.iconBtn} onPress={() => router.push("/(buyer)/cart")}>
              <Ionicons name="cart" size={26} color="#FFF" />
              {cartCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{cartCount > 99 ? "99+" : cartCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.welcome}>
          <Text style={styles.greeting}>Discover Amazing</Text>
          <Text style={styles.title}>Products</Text>
          <Text style={styles.subtitle}>Handpicked just for you</Text>
        </View>
      </Animated.View>

      {/* Sticky Search */}
      <Animated.View style={[styles.stickySearch, { opacity: searchOpacity }]}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={22} color="#94A3B8" />
          <TextInput placeholder="Search products..." value={searchQuery} onChangeText={setSearchQuery} style={styles.input} placeholderTextColor="#94A3B8" />
          {searchQuery ? <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={22} color="#94A3B8" /></TouchableOpacity> : null}
        </View>
      </Animated.View>

      <Animated.FlatList
        data={filteredProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.row}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0D9488"]} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
        ListHeaderComponent={
          <>
            <Animated.View style={{ transform: [{ translateY: searchTranslateY }] }}>
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={22} color="#64748B" />
                <TextInput style={styles.searchInput} placeholder="Search for products, brands..." placeholderTextColor="#94A3B8" value={searchQuery} onChangeText={setSearchQuery} />
                {searchQuery.length > 0 && <TouchableOpacity onPress={() => setSearchQuery("")}><Ionicons name="close-circle" size={22} color="#64748B" /></TouchableOpacity>}
              </View>
            </Animated.View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <FlatList horizontal showsHorizontalScrollIndicator={false} data={tags} renderItem={renderTag} keyExtractor={(item) => item.name} contentContainerStyle={{ paddingHorizontal: 8 }} />
            </View>

            <View style={styles.banner}>
              <View style={styles.bannerContent}>
                <View>
                  <Text style={styles.bannerTitle}>Summer Collection</Text>
                  <Text style={styles.bannerSubtitle}>Up to 50% off</Text>
                  <TouchableOpacity style={styles.bannerBtn}><Text style={styles.bannerBtnText}>Shop Now</Text></TouchableOpacity>
                </View>
                <Ionicons name="shirt" size={90} color="rgba(255,255,255,0.9)" />
              </View>
            </View>

            {featuredProducts.length > 0 && (
              <View style={styles.section}>
                <View style={styles.headerRow}>
                  <Text style={styles.sectionTitle}>Featured</Text>
                  <TouchableOpacity onPress={() => setSelectedTag("All")}><Text style={styles.seeAll}>See all</Text></TouchableOpacity>
                </View>
                <FlatList
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  data={featuredProducts}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.featuredCard} onPress={() => router.push({ pathname: "/(buyer)/product-details", params: { product: JSON.stringify(item) } })}>
                      <Image source={{ uri: item.image || "https://via.placeholder.com/300" }} style={styles.featuredImg} resizeMode="cover" />
                      <View style={styles.featuredOverlay}>
                        <Text style={styles.featuredName} numberOfLines={1}>{item.name}</Text>
                        <Text style={styles.featuredPrice}>${Number(item.price || 0).toFixed(2)}</Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>
                  {searchQuery ? `Results for "${searchQuery}"` : selectedTag}
                </Text>
                <Text style={styles.count}>{filteredProducts.length} items</Text>
              </View>
            </View>
          </>
        }
        contentContainerStyle={{ paddingTop: HEADER_MAX_HEIGHT + 20, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bag-remove-outline" size={90} color="#CBD5E1" />
            <Text style={styles.emptyTitle}>No products found</Text>
          </View>
        }
      />
    </View>
  );
}

// GORGEOUS STYLES - Product Cards Now Look INCREDIBLE
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { position: "absolute", top: 0, left: 0, right: 0, zIndex: 10, paddingTop: 50, borderBottomLeftRadius: 36, borderBottomRightRadius: 36, overflow: "hidden" },
  headerTop: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingBottom: 20 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.25)", justifyContent: "center", alignItems: "center" },
  logo: { fontSize: 30, fontWeight: "900", color: "#FFF", letterSpacing: 0.5 },
  actions: { flexDirection: "row", gap: 16 },
  iconBtn: { position: "relative" },
  badge: { position: "absolute", top: -8, right: -8, backgroundColor: "#FF4757", borderRadius: 12, minWidth: 24, height: 24, justifyContent: "center", alignItems: "center", paddingHorizontal: 6 },
  badgeText: { color: "#FFF", fontSize: 11, fontWeight: "bold" },
  welcome: { paddingHorizontal: 28 },
  greeting: { fontSize: 30, color: "#FFF", fontWeight: "600" },
  title: { fontSize: 42, color: "#FFF", fontWeight: "900", marginVertical: 6 },
  subtitle: { fontSize: 17, color: "rgba(255,255,255,0.9)" },

  stickySearch: { position: "absolute", top: 100, left: 20, right: 20, zIndex: 20 },
  searchBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 20, paddingHorizontal: 20, height: 56, shadowColor: "#000", shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.18, shadowRadius: 25, elevation: 20 },
  input: { flex: 1, marginLeft: 14, fontSize: 17 },

  searchContainer: { marginHorizontal: 24, marginTop: 20, marginBottom: 20 },
  searchInput: { flex: 1, fontSize: 17, color: "#1E293B", marginLeft: 14 },

  section: { marginTop: 28, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 26, fontWeight: "800", color: "#1E293B" },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  seeAll: { color: "#0D9488", fontWeight: "700", fontSize: 16 },
  count: { color: "#64748B", fontWeight: "600" },

  tag: { alignItems: "center", marginRight: 24, padding: 10 },
  tagActive: { transform: [{ scale: 1.1 }] },
  tagText: { marginTop: 8, fontSize: 14, color: "#64748B" },
  tagTextActive: { color: "#0D9488", fontWeight: "800" },

  banner: { marginHorizontal: 24, marginVertical: 28, height: 160, backgroundColor: "#6366F1", borderRadius: 28, overflow: "hidden", justifyContent: "center" },
  bannerContent: { flexDirection: "row", justifyContent: "space-between", padding: 28, alignItems: "center" },
  bannerTitle: { fontSize: 30, fontWeight: "900", color: "#FFF" },
  bannerSubtitle: { fontSize: 17, color: "#FFF", marginVertical: 8 },
  bannerBtn: { backgroundColor: "#FFF", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16, marginTop: 12 },
  bannerBtnText: { color: "#6366F1", fontWeight: "700", fontSize: 16 },

  featuredCard: { width: 160, height: 220, borderRadius: 24, overflow: "hidden", marginRight: 16, backgroundColor: "#FFF", shadowColor: "#000", shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 12 },
  featuredImg: { width: "100%", height: "100%" },
  featuredOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.65)", padding: 16 },
  featuredName: { color: "#FFF", fontWeight: "700", fontSize: 15 },
  featuredPrice: { color: "#FFD700", fontSize: 18, fontWeight: "800", marginTop: 4 },

  // PRODUCT CARDS - NOW LOOK ABSOLUTELY GORGEOUS
  row: { justifyContent: "space-between", paddingHorizontal: 12 },
  productCard: {
    width: CARD_WIDTH,
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.15,
    shadowRadius: 30,
    elevation: 20,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  imageWrapper: {
    height: 240,
    position: "relative",
    backgroundColor: "#F8FAFC",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  placeholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
  },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "linear-gradient(180deg, transparent 60%, rgba(0,0,0,0.4) 100%)",
  },
  discountBadge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#FF3B30",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  discountText: { color: "#FFF", fontWeight: "900", fontSize: 14 },
  newBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#10B981",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  newText: { color: "#FFF", fontWeight: "900", fontSize: 14 },
  trendingBadge: {
    position: "absolute",
    top: 60,
    right: 16,
    backgroundColor: "#F59E0B",
    padding: 12,
    borderRadius: 30,
  },
  quickAdd: {
    position: "absolute",
    bottom: 16,
    right: 16,
    width: 56,
    height: 56,
    backgroundColor: "#0D9488",
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 20,
    elevation: 15,
  },

  info: { padding: 20 },
  name: { fontSize: 17, fontWeight: "700", color: "#1E293B", lineHeight: 24 },
  category: { fontSize: 14, color: "#64748B", marginVertical: 6, fontWeight: "600" },
  priceRow: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  price: { fontSize: 22, fontWeight: "900", color: "#0D9488" },
  oldPrice: { fontSize: 16, color: "#94A3B8", textDecorationLine: "line-through", marginLeft: 12 },
  bottomRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12 },
  rating: { flexDirection: "row", alignItems: "center", backgroundColor: "#FEF3C7", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, gap: 6 },
  ratingText: { fontSize: 13, fontWeight: "900", color: "#92400E" },
  colorsRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  colorDot: { width: 20, height: 20, borderRadius: 10, borderWidth: 3, borderColor: "#FFF", shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4 },
  moreColors: { fontSize: 13, color: "#64748B", fontWeight: "600" },

  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFF" },
  empty: { alignItems: "center", paddingVertical: 100 },
  emptyTitle: { fontSize: 26, fontWeight: "700", marginTop: 24, color: "#1E293B" },
});