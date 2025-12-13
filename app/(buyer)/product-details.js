import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get("window");

export default function ProductDetails() {
  const params = useLocalSearchParams();
  const product = params.product ? JSON.parse(params.product) : null;
  
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedColor, setSelectedColor] = useState("#FF6B6B");
  const [selectedSize, setSelectedSize] = useState("M");
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Simulate multiple product images
  const productImages = product?.image ? [
    product.image,
    "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070",
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?q=80&w=2070",
    "https://images.unsplash.com/photo-1546868871-7041f2a55e12?q=80&w=2064"
  ] : [];

  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#A78BFA"];
  const sizes = ["XS", "S", "M", "L", "XL", "XXL"];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  if (!product) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Product not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const addToCart = async () => {
    try {
      setAddingToCart(true);
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert(
          "🔒 Login Required",
          "Please sign in to add items to your cart",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Sign In", 
              style: "default",
              onPress: () => router.push("/(auth)/LoginScreen") 
            },
            { 
              text: "Continue Shopping", 
              style: "default",
              onPress: () => router.back() 
            },
          ]
        );
        return;
      }

      const baseUrl = "https://ecommerce-app-three-rho.vercel.app";
      const res = await fetch(`${baseUrl}/add-to-cart`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          product_id: product.id || product._id,
          quantity: quantity,
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Failed to add to cart");

      // Success Alert with Amazon-style options
      Alert.alert(
        "✅ Added to Cart!",
        `${quantity} × "${product.name}" has been added to your cart`,
        [
          { 
            text: "Continue Shopping", 
            style: "default",
            onPress: () => router.back()
          },
          { 
            text: "🛒 View Cart", 
            style: "default",
            onPress: () => router.push("/(buyer)/cart") 
          },
       
        ],
        { cancelable: false }
      );

    } catch (err) {
      Alert.alert(
        "❌ Error Adding to Cart",
        err.message || "There was a problem adding this item to your cart. Please try again.",
        [
          { text: "Try Again", style: "default" },
          { text: "Cancel", style: "cancel" }
        ]
      );
    } finally {
      setAddingToCart(false);
    }
  };

  const buyNow = () => {
    Alert.alert(
      "🚀 Buy Now",
      "Proceed to checkout with this item",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Continue", 
          style: "default",
          onPress: () => {
      
            console.log("Available ,in future updates");
          }
        }
      ]
    );
  };

  const imageUrl = product.image_url || product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=2070";

  // Calculate discounted price
  const discount = product.discount || 0;
  const originalPrice = Number(product.price || 0);
  const discountedPrice = discount > 0 ? originalPrice * (1 - discount / 100) : originalPrice;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButtonHeader}
          onPress={() => router.back()}
        >
          <MaterialIcons name="arrow-back" size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Product Details</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerIcon}>
            <MaterialIcons name="favorite-border" size={24} color="#1F2937" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.headerIcon, styles.cartIcon]}
            onPress={() => router.push("/(buyer)/cart")}
          >
            <MaterialIcons name="shopping-cart" size={24} color="#1F2937" />
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <Animated.ScrollView 
        style={[styles.scrollView, { opacity: fadeAnim }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Product Images */}
        <View style={styles.imageSection}>
          <View style={styles.mainImageContainer}>
            <Image
              source={{ uri: productImages[currentImageIndex] || imageUrl }}
              style={styles.mainProductImage}
              resizeMode="cover"
            />
            
            {discount > 0 && (
              <LinearGradient
                colors={['#FF3B30', '#FF6B6B']}
                style={styles.discountTag}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Text style={styles.discountTagText}>-{discount}% OFF</Text>
              </LinearGradient>
            )}
            
            <TouchableOpacity style={styles.shareButton}>
              <MaterialIcons name="share" size={22} color="#374151" />
            </TouchableOpacity>
          </View>
          
          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.thumbnailContainer}
              contentContainerStyle={styles.thumbnailContent}
            >
              {productImages.map((img, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.thumbnail,
                    currentImageIndex === index && styles.thumbnailActive
                  ]}
                  onPress={() => setCurrentImageIndex(index)}
                >
                  <Image
                    source={{ uri: img }}
                    style={styles.thumbnailImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>

        {/* Product Details Card */}
        <View style={styles.detailsCard}>
          <View style={styles.productHeader}>
            <Text style={styles.productName}>{product.name || "Product Name"}</Text>
            <View style={styles.ratingContainer}>
              <View style={styles.starsContainer}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <MaterialIcons 
                    key={star} 
                    name="star" 
                    size={16} 
                    color={star <= Math.floor(product.rating || 4) ? "#FF9900" : "#D1D5DB"} 
                  />
                ))}
              </View>
              <Text style={styles.ratingText}>{product.rating || 4.5} • 452 reviews</Text>
            </View>
          </View>

          <Text style={styles.productCategory}>
            {product.category || "Category"} • In stock • Free shipping
          </Text>

          {/* Price Section */}
          <View style={styles.priceSection}>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                ${discountedPrice.toFixed(2)}
              </Text>
              {discount > 0 && (
                <>
                  <Text style={styles.originalPrice}>
                    ${originalPrice.toFixed(2)}
                  </Text>
                  <View style={styles.discountBadge}>
                    <Text style={styles.discountBadgeText}>Save ${(originalPrice - discountedPrice).toFixed(2)}</Text>
                  </View>
                </>
              )}
            </View>
            <Text style={styles.taxText}>+ $3.99 shipping • Import fees included</Text>
          </View>

          {/* Color Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Color:</Text>
            <View style={styles.colorsContainer}>
              {colors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.colorOption,
                    selectedColor === color && styles.colorOptionActive,
                    { backgroundColor: color }
                  ]}
                  onPress={() => setSelectedColor(color)}
                >
                  {selectedColor === color && (
                    <MaterialIcons name="check" size={16} color="white" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Size Selection */}
          <View style={styles.selectionSection}>
            <Text style={styles.selectionTitle}>Size:</Text>
            <View style={styles.sizesContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeOption,
                    selectedSize === size && styles.sizeOptionActive
                  ]}
                  onPress={() => setSelectedSize(size)}
                >
                  <Text style={[
                    styles.sizeText,
                    selectedSize === size && styles.sizeTextActive
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Description */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>
              {product.description || "No description available for this product."}
            </Text>
            
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.featureText}>High-quality materials</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.featureText}>30-day return policy</Text>
              </View>
              <View style={styles.featureItem}>
                <MaterialIcons name="check-circle" size={18} color="#10B981" />
                <Text style={styles.featureText}>Free shipping over $50</Text>
              </View>
            </View>
          </View>

          {/* Quantity Selector */}
          <View style={styles.quantitySection}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <View style={styles.quantityPicker}>
              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(Math.max(1, quantity - 1))}
              >
                <Text style={styles.qtyBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.qtyDisplay}>
                <Text style={styles.qtyText}>{quantity}</Text>
              </View>

              <TouchableOpacity
                style={styles.qtyBtn}
                onPress={() => setQuantity(quantity + 1)}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        <TouchableOpacity 
          style={styles.wishlistButton}
          onPress={() => Alert.alert("Added to Wishlist", "Item saved for later")}
        >
          <MaterialIcons name="favorite-border" size={24} color="#6B7280" />
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={addToCart}
          disabled={addingToCart}
        >
          {addingToCart ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <>
              <MaterialIcons name="add-shopping-cart" size={22} color="white" />
              <Text style={styles.addToCartText}>Add to Cart</Text>
            </>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.buyNowButton}
          onPress={buyNow}
        >
          <LinearGradient
            colors={['#FF9900', '#FFAD33']}
            style={styles.buyNowGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.buyNowText}>Buy Now</Text>
            <MaterialIcons name="arrow-forward" size={20} color="white" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButtonHeader: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIcon: {
    padding: 8,
    marginLeft: 8,
  },
  cartIcon: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: '#DC2626',
    borderRadius: 10,
    width: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  scrollView: {
    flex: 1,
  },
  // Image Section
  imageSection: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
  },
  mainImageContainer: {
    position: 'relative',
    height: 400,
    backgroundColor: '#F9FAFB',
  },
  mainProductImage: {
    width: '100%',
    height: '100%',
  },
  discountTag: {
    position: 'absolute',
    top: 20,
    left: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  discountTagText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  shareButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'white',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  thumbnailContainer: {
    paddingHorizontal: 20,
    marginTop: 16,
  },
  thumbnailContent: {
    gap: 12,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  thumbnailActive: {
    borderColor: '#FF9900',
  },
  thumbnailImage: {
    width: '100%',
    height: '100%',
  },
  // Details Card
  detailsCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    marginTop: -30,
    paddingTop: 30,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  productHeader: {
    marginBottom: 12,
  },
  productName: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1F2937',
    lineHeight: 34,
    marginBottom: 8,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  productCategory: {
    fontSize: 15,
    color: '#6B7280',
    marginBottom: 20,
  },
  priceSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 36,
    fontWeight: '800',
    color: '#FF9900',
    marginRight: 12,
  },
  originalPrice: {
    fontSize: 20,
    color: '#9CA3AF',
    textDecorationLine: 'line-through',
    marginRight: 12,
  },
  discountBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  discountBadgeText: {
    fontSize: 12,
    color: '#92400E',
    fontWeight: '700',
  },
  taxText: {
    fontSize: 14,
    color: '#6B7280',
  },
  // Selection Sections
  selectionSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  selectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  colorsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorOptionActive: {
    borderColor: '#FF9900',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sizeOption: {
    minWidth: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
  },
  sizeOptionActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF9900',
  },
  sizeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  sizeTextActive: {
    color: '#FF9900',
    fontWeight: '700',
  },
  // Description
  descriptionSection: {
    marginBottom: 24,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    color: '#4B5563',
    lineHeight: 24,
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureText: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    fontWeight: '500',
  },
  // Quantity Selector
  quantitySection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },
  quantityLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  quantityPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  qtyBtn: {
    width: 52,
    height: 52,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: {
    color: '#374151',
    fontSize: 24,
    fontWeight: 'bold',
  },
  qtyDisplay: {
    width: 60,
    height: 52,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  qtyText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1F2937',
  },
  // Bottom Actions
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  wishlistButton: {
    width: 56,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    marginRight: 12,
  },
  addToCartButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 16,
    paddingVertical: 16,
    marginRight: 12,
    gap: 8,
  },
  addToCartText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  buyNowButton: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  buyNowGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
  },
  buyNowText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  // Error Styles
  errorText: {
    fontSize: 18,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
  backButton: {
    backgroundColor: '#0D9488',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
    alignSelf: 'center',
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});