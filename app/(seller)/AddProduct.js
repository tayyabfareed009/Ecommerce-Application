// app/(seller)/AddProduct.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import { useState, useEffect } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from "expo-router";

const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dkwxr9ege/image/upload";

export default function AddProduct() {
  const params = useLocalSearchParams();
  const editProduct = params.editProduct ? JSON.parse(params.editProduct) : null;
  
  // Initialize with empty form
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
  const [isInitialized, setIsInitialized] = useState(false); // ADDED: Track initialization

  // FIXED: Use a stable way to check if editProduct exists and prevent infinite loops
  useEffect(() => {
    // Only run once when component mounts OR when editProduct changes from null to having a value
    if (editProduct && !isInitialized) {
      console.log("Initializing edit product:", editProduct.id);
      setProduct({
        name: editProduct.name || "",
        description: editProduct.description || "",
        price: editProduct.price ? editProduct.price.toString() : "",
        category: editProduct.category || "",
        stock: editProduct.stock ? editProduct.stock.toString() : "",
        image_url: editProduct.image_url || "",
      });
      setIsInitialized(true);
    } else if (!editProduct && isInitialized) {
      // Reset form when not editing (adding new product)
      setProduct({
        name: "",
        description: "",
        price: "",
        category: "",
        stock: "",
        image_url: "",
      });
      setIsInitialized(false);
    }
  }, [editProduct, isInitialized]); // FIXED: Added isInitialized to dependencies

  // Alternative simpler approach - initialize directly without useEffect
  // This runs once when the component mounts
  useEffect(() => {
    if (editProduct) {
      console.log("Setting edit product data");
      setProduct({
        name: editProduct.name || "",
        description: editProduct.description || "",
        price: editProduct.price ? editProduct.price.toString() : "",
        category: editProduct.category || "",
        stock: editProduct.stock ? editProduct.stock.toString() : "",
        image_url: editProduct.image_url || "",
      });
    }
  }, []); // Empty dependency array - runs only once on mount

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
          "Image Uploaded", 
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
      console.log("Product ID for update:", productId);

      const url = productId
        ? `https://ecommerce-app-three-rho.vercel.app/update-product/${productId}`
        : "https://ecommerce-app-three-rho.vercel.app/add-product";

      console.log("Using URL:", url);
      console.log("Method:", productId ? "PUT" : "POST");

      const payload = {
        name: product.name.trim(),
        description: product.description.trim(),
        price: price,
        category: product.category.trim(),
        stock: stock,
        image_url: product.image_url,
      };

      console.log("Payload:", payload);

      const res = await fetch(url, {
        method: productId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log("Response status:", res.status);

      if (res.ok) {
        const responseData = await res.json();
        console.log("Success response:", responseData);
        
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
        console.log("Error response:", errorText);
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
    <View style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.title}>
          {editProduct ? "Edit Product" : "Add New Product"}
        </Text>
        {editProduct && (
          <Text style={styles.productIdText}>
            ID: {editProduct.id?.substring(0, 8)}...
          </Text>
        )}
      </View>

      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Product Preview Section */}
        <View style={styles.previewSection}>
          <Text style={styles.sectionTitle}>Product Preview</Text>
          <View style={styles.previewCard}>
            {product.image_url ? (
              <Image 
                source={{ uri: product.image_url }} 
                style={styles.previewImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Ionicons name="image-outline" size={40} color="#CBD5E1" />
                <Text style={styles.previewPlaceholderText}>No image uploaded</Text>
              </View>
            )}
            
            <View style={styles.previewDetails}>
              <Text style={styles.previewName} numberOfLines={1}>
                {product.name || "Product Name"}
              </Text>
              <Text style={styles.previewPrice}>
                {product.price ? `$${product.price}` : "$0.00"}
              </Text>
              <Text style={styles.previewCategory}>
                {product.category || "Category"}
              </Text>
              <Text style={styles.previewStock}>
                Stock: {product.stock || "0"}
              </Text>
              {editProduct && (
                <Text style={styles.editNote}>
                  Editing existing product
                </Text>
              )}
            </View>
          </View>
        </View>

        {/* Image Upload Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="image-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Product Image</Text>
          </View>
          
          <View style={styles.imageUploadContainer}>
            <TouchableOpacity 
              style={[
                styles.imageUploadArea,
                product.image_url && styles.imageUploadAreaWithImage
              ]}
              onPress={pickAndUploadImage}
              disabled={uploading || isSubmitting}
            >
              {uploading ? (
                <View style={styles.uploadingContainer}>
                  <ActivityIndicator size="large" color="#0D9488" />
                  <Text style={styles.uploadingText}>Uploading...</Text>
                </View>
              ) : product.image_url ? (
                <Image 
                  source={{ uri: product.image_url }} 
                  style={styles.uploadedImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="cloud-upload-outline" size={40} color="#CBD5E1" />
                  <Text style={styles.uploadTitle}>Upload Product Image</Text>
                  <Text style={styles.uploadSubtitle}>
                    Tap to select from gallery
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Quality Selector */}
            <View style={styles.qualityContainer}>
              <Text style={styles.qualityLabel}>Image Quality:</Text>
              <View style={styles.qualityButtons}>
                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    imageQuality === "high" && styles.qualityOptionActive
                  ]}
                  onPress={() => setImageQuality("high")}
                  disabled={uploading || isSubmitting}
                >
                  <Ionicons
                    name={imageQuality === "high" ? "radio-button-on" : "radio-button-off"} 
                    size={16} 
                    color={imageQuality === "high" ? "#0D9488" : "#94A3B8"} 
                  />
                  <Text style={[
                    styles.qualityOptionText,
                    imageQuality === "high" && styles.qualityOptionTextActive
                  ]}>High Quality</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[
                    styles.qualityOption,
                    imageQuality === "ultra" && styles.qualityOptionActive
                  ]}
                  onPress={() => setImageQuality("ultra")}
                  disabled={uploading || isSubmitting}
                >
                  <Ionicons
                    name={imageQuality === "ultra" ? "radio-button-on" : "radio-button-off"} 
                    size={16} 
                    color={imageQuality === "ultra" ? "#0D9488" : "#94A3B8"} 
                  />
                  <Text style={[
                    styles.qualityOptionText,
                    imageQuality === "ultra" && styles.qualityOptionTextActive
                  ]}>Ultra HD</Text>
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.changeImageButton,
                (uploading || isSubmitting) && styles.changeImageButtonDisabled
              ]}
              onPress={pickAndUploadImage}
              disabled={uploading || isSubmitting}
            >
              <Ionicons name="sync-outline" size={18} color="#0D9488" />
              <Text style={styles.changeImageButtonText}>
                {product.image_url ? "Change Image" : "Select Image"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Product Details Form */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={20} color="#0D9488" />
            <Text style={styles.sectionTitle}>Product Details</Text>
          </View>
          
          <View style={styles.form}>
            {[
              { 
                label: "Product Name", 
                key: "name", 
                required: true,
                placeholder: "Enter product name",
                icon: "pricetag-outline"
              },
              { 
                label: "Category", 
                key: "category", 
                required: true,
                placeholder: "e.g., Electronics, Clothing",
                icon: "grid-outline"
              },
              { 
                label: "Price ($)", 
                key: "price", 
                required: true,
                keyboardType: "decimal-pad",
                placeholder: "Enter price",
                icon: "cash-outline"
              },
              { 
                label: "Stock Quantity", 
                key: "stock", 
                keyboardType: "number-pad",
                placeholder: "Enter stock quantity",
                icon: "cube-outline"
              },
              { 
                label: "Description", 
                key: "description", 
                multiline: true,
                placeholder: "Enter product description...",
                icon: "document-text-outline"
              },
            ].map((field) => (
              <View key={field.key} style={styles.fieldContainer}>
                <View style={styles.fieldLabel}>
                  <Ionicons name={field.icon} size={16} color="#64748B" />
                  <Text style={styles.fieldLabelText}>
                    {field.label}
                    {field.required && <Text style={styles.requiredStar}> *</Text>}
                  </Text>
                </View>
                
                <TextInput
                  style={[
                    styles.fieldInput,
                    field.multiline && styles.multilineInput
                  ]}
                  value={product[field.key]}
                  onChangeText={(text) => setProduct({ ...product, [field.key]: text })}
                  placeholder={field.placeholder}
                  placeholderTextColor="#94A3B8"
                  keyboardType={field.keyboardType || "default"}
                  multiline={field.multiline}
                  numberOfLines={field.multiline ? 4 : 1}
                  textAlignVertical={field.multiline ? "top" : "center"}
                  editable={!uploading && !isSubmitting}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[
              styles.cancelButton,
              (uploading || isSubmitting) && styles.buttonDisabled
            ]}
            onPress={() => router.back()}
            disabled={uploading || isSubmitting}
          >
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
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons
                  name={editProduct ? "checkmark-done-outline" : "add-outline"} 
                  size={20} 
                  color="#FFFFFF" 
                />
                <Text style={styles.submitButtonText}>
                  {editProduct ? "Update Product" : "Add Product"}
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
        
        <View style={styles.spacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  // Header Styles
  header: {
    height: 120,
    backgroundColor: "#0D9488",
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    marginTop: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#FFFFFF",
    flex: 1,
    marginTop: 8,
  },
  productIdText: {
    fontSize: 12,
    color: "#E0F2F1",
    marginTop: 8,
    fontStyle: 'italic',
  },
  editNote: {
    fontSize: 12,
    color: "#0D9488",
    marginTop: 4,
    fontStyle: 'italic',
  },

  // Scroll View
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },

  // Section Styles
  section: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F1F5F9",
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginLeft: 8,
  },

  // Preview Section
  previewSection: {
    marginBottom: 16,
  },
  previewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: "#F1F5F9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  previewImage: {
    width: '100%',
    height: 180,
    backgroundColor: "#F8FAFC",
  },
  previewPlaceholder: {
    width: '100%',
    height: 180,
    backgroundColor: "#F8FAFC",
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewPlaceholderText: {
    fontSize: 14,
    color: "#94A3B8",
    marginTop: 8,
  },
  previewDetails: {
    padding: 16,
  },
  previewName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 4,
  },
  previewPrice: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0D9488",
    marginBottom: 8,
  },
  previewCategory: {
    fontSize: 14,
    color: "#64748B",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  previewStock: {
    fontSize: 14,
    color: "#475569",
    fontWeight: "500",
  },

  // Image Upload Section
  imageUploadContainer: {
    alignItems: 'center',
  },
  imageUploadArea: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderColor: "#E2E8F0",
    borderStyle: 'dashed',
    overflow: "hidden",
    marginBottom: 16,
  },
  imageUploadAreaWithImage: {
    borderColor: "#0D9488",
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
  },
  uploadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#64748B",
    fontWeight: "500",
  },
  uploadedImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#475569",
    marginTop: 12,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#94A3B8",
    textAlign: 'center',
  },

  // Quality Selector
  qualityContainer: {
    width: '100%',
    marginBottom: 16,
  },
  qualityLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginBottom: 10,
  },
  qualityButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  qualityOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginHorizontal: 4,
  },
  qualityOptionActive: {
    backgroundColor: "#F0FDF4",
    borderColor: "#0D9488",
  },
  qualityOptionText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#64748B",
    marginLeft: 8,
  },
  qualityOptionTextActive: {
    color: "#0D9488",
    fontWeight: "600",
  },

  // Change Image Button
  changeImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#0D9488",
    width: '100%',
  },
  changeImageButtonDisabled: {
    opacity: 0.5,
  },
  changeImageButtonText: {
    color: "#0D9488",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
  },

  // Form Styles
  form: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  fieldLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  fieldLabelText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 8,
  },
  requiredStar: {
    color: "#EF4444",
  },
  fieldInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    color: "#1E293B",
  },
  multilineInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 14,
  },

  // Action Buttons
  actionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    marginRight: 10,
  },
  cancelButtonText: {
    color: "#64748B",
    fontSize: 15,
    fontWeight: "600",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 10,
    backgroundColor: "#0D9488",
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },

  spacer: {
    height: 40,
  },
});