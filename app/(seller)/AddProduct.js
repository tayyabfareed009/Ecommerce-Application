import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const { width, height } = Dimensions.get('window');
const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkwxr9ege/image/upload";

export default function AddProduct() {
  const params = useLocalSearchParams();
  const editProduct = params.editProduct ? JSON.parse(params.editProduct) : null;
  
  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    stock: "",
    image_url: "",
  });

  const [uploading, setUploading] = useState(false);
  const [imageQuality, setImageQuality] = useState("high");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories] = useState([
    "Electronics", "Fashion", "Home & Kitchen", "Beauty", "Sports", "Books", 
    "Toys", "Automotive", "Health", "Groceries", "Furniture", "Jewelry"
  ]);

  // Initialize form with edit product data
  useEffect(() => {
    if (editProduct) {
      setProduct({
        name: editProduct.name || "",
        description: editProduct.description || "",
        price: editProduct.price ? editProduct.price.toString() : "",
        category: editProduct.category || "",
        stock: editProduct.stock ? editProduct.stock.toString() : "",
        image_url: editProduct.image_url || "",
      });
    }
  }, [editProduct]);

  const pickAndUploadImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
        allowsMultipleSelection: false,
        aspect: [4, 3],
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      setUploading(true);

      const formData = new FormData();
      formData.append("upload_preset", "expo_uploads");
      
      if (Platform.OS === "web") {
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        formData.append("file", blob, "product_image.jpg");
      } else {
        const filename = asset.uri.split('/').pop();
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : 'image/jpeg';
        
        formData.append("file", {
          uri: asset.uri,
          name: `product_${Date.now()}.jpg`,
          type: type,
        });
      }

      const res = await fetch(CLOUDINARY_URL, {
        method: "POST",
        body: formData,
      });
      
      const data = await res.json();

      if (data.secure_url) {
        let finalUrl = data.secure_url;
        
        if (finalUrl.includes('/upload/')) {
          const parts = finalUrl.split('/upload/');
          const quality = imageQuality === "ultra" ? "q_90,f_auto" : "q_80,f_auto";
          finalUrl = `${parts[0]}/upload/${quality}/${parts[1]}`;
        }
        
        setProduct(prev => ({ ...prev, image_url: finalUrl }));
        
        Alert.alert(
          "Success", 
          `${imageQuality === "ultra" ? "Ultra HD" : "High quality"} image uploaded successfully.`
        );
      } else {
        Alert.alert("Upload Failed", data.error?.message || "Failed to upload image.");
      }
    } catch (err) {
      console.error("Upload error:", err);
      Alert.alert("Upload Error", "Failed to upload image. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!product.name.trim()) {
      Alert.alert("Required", "Please enter product name");
      return;
    }
    if (!product.price.trim()) {
      Alert.alert("Required", "Please enter product price");
      return;
    }
    if (!product.category.trim()) {
      Alert.alert("Required", "Please enter product category");
      return;
    }
    if (!product.image_url) {
      Alert.alert("Required", "Please upload a product image");
      return;
    }

    const price = parseFloat(product.price);
    if (isNaN(price) || price <= 0) {
      Alert.alert("Invalid Price", "Please enter a valid price");
      return;
    }

    const stock = parseInt(product.stock || "0", 10);
    if (isNaN(stock) || stock < 0) {
      Alert.alert("Invalid Stock", "Please enter a valid stock quantity");
      return;
    }

    try {
      setIsSubmitting(true);
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Authentication Required", "Please login again");
        router.replace("/(auth)/LoginScreen");
        return;
      }

      const productId = editProduct?.id;

      const url = productId
        ? `https://ecommerce-app-three-rho.vercel.app/update-product/${productId}`
        : "https://ecommerce-app-three-rho.vercel.app/add-product";

      const payload = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: price,
        category: product.category.trim(),
        stock: stock,
        image_url: product.image_url,
      };

      const res = await fetch(url, {
        method: productId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const responseData = await res.json();
        
        Alert.alert(
          "Success", 
          productId ? "Product updated successfully" : "Product added successfully",
          [
            {
              text: "View Products",
              onPress: () => {
                router.push("/(seller)/ManageProducts");
              }
            },
            { text: "Stay Here" }
          ]
        );
        
        if (!productId) {
          // Reset form if adding new product
          setProduct({
            name: "",
            description: "",
            price: "",
            category: "",
            stock: "",
            image_url: "",
          });
        }
      } else {
        const errorText = await res.text();
        Alert.alert("Error", errorText || "Failed to save product");
      }
    } catch (err) {
      console.error("Submit error:", err);
      Alert.alert("Network Error", "Please check your connection");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <MaterialIcons name="arrow-back" size={24} color="#374151" />
          </TouchableOpacity>
          
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>
              {editProduct ? "Edit Product" : "Add New Product"}
            </Text>
            {editProduct && (
              <Text style={styles.headerSubtitle}>
                Editing: {editProduct.name?.substring(0, 20)}...
              </Text>
            )}
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.helpButton}>
              <MaterialIcons name="help-outline" size={22} color="#6B7280" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Image Upload Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Product Image</Text>
          <Text style={styles.sectionSubtitle}>Upload a clear product photo</Text>
          
          <TouchableOpacity 
            style={styles.imageUploadCard}
            onPress={pickAndUploadImage}
            disabled={uploading || isSubmitting}
          >
            {uploading ? (
              <View style={styles.uploadingContainer}>
                <ActivityIndicator size="large" color="#FF9900" />
                <Text style={styles.uploadingText}>Uploading Image...</Text>
              </View>
            ) : product.image_url ? (
              <Image 
                source={{ uri: product.image_url }} 
                style={styles.uploadedImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.imagePlaceholder}>
                <View style={styles.imagePlaceholderIcon}>
                  <MaterialIcons name="add-photo-alternate" size={48} color="#9CA3AF" />
                </View>
                <Text style={styles.uploadTitle}>Upload Product Image</Text>
                <Text style={styles.uploadSubtitle}>Tap to select from gallery</Text>
                <Text style={styles.uploadHint}>Recommended: 4:3 aspect ratio</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Quality Selector */}
          <View style={styles.qualitySection}>
            <Text style={styles.qualityLabel}>Image Quality</Text>
            <View style={styles.qualityButtons}>
              <TouchableOpacity
                style={[
                  styles.qualityButton,
                  imageQuality === "high" && styles.qualityButtonActive
                ]}
                onPress={() => setImageQuality("high")}
                disabled={uploading || isSubmitting}
              >
                <MaterialIcons 
                  name="photo" 
                  size={20} 
                  color={imageQuality === "high" ? "#FF9900" : "#6B7280"} 
                />
                <Text style={[
                  styles.qualityButtonText,
                  imageQuality === "high" && styles.qualityButtonTextActive
                ]}>High Quality</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[
                  styles.qualityButton,
                  imageQuality === "ultra" && styles.qualityButtonActive
                ]}
                onPress={() => setImageQuality("ultra")}
                disabled={uploading || isSubmitting}
              >
                <MaterialIcons 
                  name="high-quality" 
                  size={20} 
                  color={imageQuality === "ultra" ? "#FF9900" : "#6B7280"} 
                />
                <Text style={[
                  styles.qualityButtonText,
                  imageQuality === "ultra" && styles.qualityButtonTextActive
                ]}>Ultra HD</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Basic Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>
          
          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="title" size={18} color="#6B7280" />
              <Text style={styles.label}>Product Name *</Text>
            </View>
            <TextInput
              style={styles.input}
              value={product.name}
              onChangeText={(text) => setProduct({ ...product, name: text })}
              placeholder="Enter product name"
              placeholderTextColor="#9CA3AF"
              editable={!uploading && !isSubmitting}
            />
          </View>

          <View style={styles.formGroup}>
            <View style={styles.labelContainer}>
              <MaterialIcons name="category" size={18} color="#6B7280" />
              <Text style={styles.label}>Category *</Text>
            </View>
            
            {/* Category Picker */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.categoryScroll}
              contentContainerStyle={styles.categoryContainer}
            >
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    product.category === cat && styles.categoryButtonActive
                  ]}
                  onPress={() => setProduct({ ...product, category: cat })}
                  disabled={uploading || isSubmitting}
                >
                  <Text style={[
                    styles.categoryButtonText,
                    product.category === cat && styles.categoryButtonTextActive
                  ]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <TextInput
              style={[styles.input, styles.marginTop]}
              value={product.category}
              onChangeText={(text) => setProduct({ ...product, category: text })}
              placeholder="Or type custom category"
              placeholderTextColor="#9CA3AF"
              editable={!uploading && !isSubmitting}
            />
          </View>
        </View>

        {/* Pricing & Stock */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Pricing & Stock</Text>
          
          <View style={styles.row}>
            <View style={[styles.formGroup, styles.flex1]}>
              <View style={styles.labelContainer}>
                <MaterialIcons name="attach-money" size={18} color="#6B7280" />
                <Text style={styles.label}>Price ($) *</Text>
              </View>
              <TextInput
                style={styles.input}
                value={product.price}
                onChangeText={(text) => setProduct({ ...product, price: text })}
                placeholder="0.00"
                placeholderTextColor="#9CA3AF"
                keyboardType="decimal-pad"
                editable={!uploading && !isSubmitting}
              />
            </View>
            
            <View style={[styles.formGroup, styles.flex1, styles.marginLeft]}>
              <View style={styles.labelContainer}>
                <MaterialIcons name="inventory" size={18} color="#6B7280" />
                <Text style={styles.label}>Stock Quantity</Text>
              </View>
              <TextInput
                style={styles.input}
                value={product.stock}
                onChangeText={(text) => setProduct({ ...product, stock: text })}
                placeholder="0"
                placeholderTextColor="#9CA3AF"
                keyboardType="number-pad"
                editable={!uploading && !isSubmitting}
              />
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionSubtitle}>Add detailed product information</Text>
          
          <View style={styles.formGroup}>
            <TextInput
              style={styles.textarea}
              value={product.description}
              onChangeText={(text) => setProduct({ ...product, description: text })}
              placeholder="Describe your product in detail..."
              placeholderTextColor="#9CA3AF"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              editable={!uploading && !isSubmitting}
            />
          </View>
        </View>

        {/* Preview Card */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preview</Text>
          
          <View style={styles.previewCard}>
            {product.image_url ? (
              <Image 
                source={{ uri: product.image_url }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.previewImagePlaceholder}>
                <MaterialIcons name="image" size={40} color="#E5E7EB" />
              </View>
            )}
            
            <View style={styles.previewContent}>
              <Text style={styles.previewName} numberOfLines={2}>
                {product.name || "Product Name"}
              </Text>
              
              <View style={styles.previewMeta}>
                <View style={styles.previewCategory}>
                  <MaterialIcons name="category" size={12} color="#6B7280" />
                  <Text style={styles.previewCategoryText}>
                    {product.category || "Category"}
                  </Text>
                </View>
                
                <View style={styles.previewStock}>
                  <MaterialIcons name="inventory" size={12} color="#6B7280" />
                  <Text style={styles.previewStockText}>
                    {product.stock || "0"} in stock
                  </Text>
                </View>
              </View>
              
              <Text style={styles.previewPrice}>
                ${product.price ? parseFloat(product.price).toFixed(2) : "0.00"}
              </Text>
              
              <Text style={styles.previewDescription} numberOfLines={2}>
                {product.description || "Product description will appear here"}
              </Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={uploading || isSubmitting}
          >
            <MaterialIcons name="close" size={20} color="#6B7280" />
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.submitButton,
              (!product.name || !product.price || !product.category || !product.image_url || uploading || isSubmitting) && 
              styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={!product.name || !product.price || !product.category || !product.image_url || uploading || isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialIcons
                  name={editProduct ? "save" : "add-circle"} 
                  size={20} 
                  color="white" 
                />
                <Text style={styles.submitButtonText}>
                  {editProduct ? "Update Product" : "Add Product"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Make sure all information is accurate before publishing.
          </Text>
          <Text style={styles.footerCopyright}>
            © 2024 MarketConnect Seller Center
          </Text>
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
  header: {
    backgroundColor: '#F3F4F6',
    paddingTop: 20,
    paddingBottom: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  backButton: {
    padding: 8,
    backgroundColor: 'white',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  headerCenter: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  helpButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  imageUploadCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    height: 200,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginBottom: 16,
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  uploadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  uploadedImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  imagePlaceholderIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  qualitySection: {
    marginTop: 8,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  qualityButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  qualityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  qualityButtonActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF9900',
  },
  qualityButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6B7280',
  },
  qualityButtonTextActive: {
    color: '#FF9900',
  },
  formGroup: {
    marginBottom: 20,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 8,
  },
  input: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textarea: {
    backgroundColor: '#F9FAFB',
    borderRadius: 10,
    padding: 16,
    fontSize: 16,
    color: '#1F2937',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 12,
  },
  marginTop: {
    marginTop: 12,
  },
  categoryScroll: {
    marginHorizontal: -20,
    paddingLeft: 20,
  },
  categoryContainer: {
    paddingRight: 20,
  },
  categoryButton: {
    backgroundColor: '#F9FAFB',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginRight: 8,
    marginBottom: 8,
  },
  categoryButtonActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF9900',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  categoryButtonTextActive: {
    color: '#FF9900',
    fontWeight: '600',
  },
  previewCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  previewImage: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
  },
  previewImagePlaceholder: {
    width: '100%',
    height: 160,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    padding: 16,
  },
  previewName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  previewMeta: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  previewCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  previewCategoryText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '500',
  },
  previewStock: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  previewStockText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
  },
  previewPrice: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FF9900',
    marginBottom: 8,
  },
  previewDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  actionSection: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9FAFB',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF9900',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#FF9900',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  footerCopyright: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});