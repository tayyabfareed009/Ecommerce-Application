import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function ManageProducts() {
  const [allProducts, setAllProducts] = useState([]);
  const [sellerProducts, setSellerProducts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseUrl = "https://ecommerce-app-three-rho.vercel.app";

  const getCurrentUserId = async () => {
    try {
      const userId = await AsyncStorage.getItem("id");
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.log("Error getting user ID:", error);
      return null;
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const userId = await getCurrentUserId();
      
      const res = await fetch(`${baseUrl}/products`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (!res.ok) {
        console.log("Failed to fetch products:", res.status);
        setAllProducts([]);
        setSellerProducts([]);
        return;
      }
      
      const data = await res.json();
      setAllProducts(data || []);
      
      if (userId) {
        const filtered = data.filter(product => {
          return product.seller_id === userId || 
                 product.seller_id?.toString() === userId ||
                 product.sellerId === userId;
        });
        setSellerProducts(filtered);
      } else {
        setSellerProducts(data || []);
      }
      
    } catch (err) {
      console.log("Error fetching products:", err);
      setAllProducts([]);
      setSellerProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = (id) => {
    setProductToDelete(id);
    setDeleteModalVisible(true);
  };

  const performDelete = async () => {
    if (!productToDelete) return;

    try {
      const token = await AsyncStorage.getItem("token");
      
      const res = await fetch(`${baseUrl}/delete-product/${productToDelete}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
      });
      
      if (res.ok) {
        setDeleteModalVisible(false);
        setProductToDelete(null);
        await fetchProducts();
      } else {
        const errorData = await res.json();
        alert(`Delete failed: ${errorData.message}`);
      }
    } catch (err) {
      console.log("Delete error:", err);
      alert("Delete failed. Please try again.");
    }
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
    setProductToDelete(null);
  };

  useFocusEffect(
    useCallback(() => {
      fetchProducts();
    }, [])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  };

  const renderProduct = ({ item }) => {
    const imageUrl = item.image_url 
      ? (item.image_url.startsWith("http")
          ? item.image_url
          : `${baseUrl}/${item.image_url}`)
      : null;

    return (
      <View style={styles.productCardWrapper}>
        <View style={styles.productCard}>
          {/* Product Image */}
          <TouchableOpacity
            onPress={() => router.push({
              pathname: "/(seller)/AddProduct",
              params: { editProduct: JSON.stringify(item) }
            })}
            activeOpacity={0.9}
          >
            <View style={styles.imageContainer}>
              {imageUrl ? (
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.productImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <MaterialIcons name="image" size={40} color="#D1D5DB" />
                </View>
              )}
              
              {/* Stock Badge */}
              <View style={[
                styles.stockBadge,
                { backgroundColor: (item.stock || 0) > 0 ? '#DCFCE7' : '#FEE2E2' }
              ]}>
                <MaterialIcons 
                  name={(item.stock || 0) > 0 ? "inventory" : "error-outline"} 
                  size={12} 
                  color={(item.stock || 0) > 0 ? '#059669' : '#DC2626'} 
                />
                <Text style={[
                  styles.stockText,
                  { color: (item.stock || 0) > 0 ? '#059669' : '#DC2626' }
                ]}>
                  {(item.stock || 0) > 0 ? `${item.stock} in stock` : 'Out of stock'}
                </Text>
              </View>
            </View>

            {/* Product Info */}
            <View style={styles.productInfo}>
              <Text style={styles.productName} numberOfLines={2}>
                {item.name || "Unnamed Product"}
              </Text>
              
              <Text style={styles.productCategory}>
                {item.category || "Uncategorized"}
              </Text>

              <View style={styles.priceContainer}>
                <Text style={styles.productPrice}>
                  ${parseFloat(item.price || 0).toFixed(2)}
                </Text>
              </View>

              {/* Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity 
                  style={styles.editButton}
                  onPress={() => router.push({
                    pathname: "/(seller)/AddProduct",
                    params: { editProduct: JSON.stringify(item) }
                  })}
                >
                  <MaterialIcons name="edit" size={16} color="#2563EB" />
                  <Text style={styles.editButtonText}>Edit</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.deleteButton}
                  onPress={() => confirmDelete(item.id)}
                >
                  <MaterialIcons name="delete" size={16} color="#DC2626" />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="light" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerBrand}>
            <MaterialIcons name="inventory" size={28} color="#FF9900" />
            <View style={styles.headerTextContainer}>
              <Text style={styles.headerTitle}>Manage Products</Text>
              <Text style={styles.headerSubtitle}>
                {sellerProducts.length} products • Your inventory
              </Text>
            </View>
          </View>
          
          <TouchableOpacity 
            style={styles.addButton}
            onPress={() => router.push("/(seller)/AddProduct")}
          >
            <MaterialIcons name="add" size={20} color="white" />
            <Text style={styles.addButtonText}>Add New</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sellerProducts}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id.toString()}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9900"]}
            tintColor="#FF9900"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <MaterialIcons name="inventory" size={64} color="#E5E7EB" />
            </View>
            <Text style={styles.emptyTitle}>No Products Found</Text>
            <Text style={styles.emptyText}>
              Start selling by adding your first product to inventory
            </Text>
            <TouchableOpacity 
              style={styles.emptyButton}
              onPress={() => router.push("/(seller)/AddProduct")}
            >
              <MaterialIcons name="add-circle" size={20} color="white" />
              <Text style={styles.emptyButtonText}>Add First Product</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Delete Confirmation Modal - Amazon Style */}
      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <MaterialIcons name="warning" size={32} color="#DC2626" />
              <Text style={styles.modalTitle}>Delete Product</Text>
            </View>
            
            <Text style={styles.modalMessage}>
              This action cannot be undone. The product will be permanently removed from your inventory.
            </Text>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelButton}
                onPress={cancelDelete}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.modalDeleteButton}
                onPress={performDelete}
              >
                <MaterialIcons name="delete" size={18} color="white" />
                <Text style={styles.modalDeleteText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerBrand: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    gap: 8,
  },
  addButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  scrollContent: {
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 16,
  },
  productRow: {
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  productCardWrapper: {
    width: CARD_WIDTH,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  imageContainer: {
    position: 'relative',
    height: 140,
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
  stockBadge: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 4,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '600',
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
    textTransform: 'capitalize',
  },
  priceContainer: {
    marginBottom: 12,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FF9900',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EFF6FF',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  editButtonText: {
    fontSize: 12,
    color: '#2563EB',
    fontWeight: '600',
  },
  deleteButtonText: {
    fontSize: 12,
    color: '#DC2626',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
    marginTop: 40,
  },
  emptyIcon: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9900',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#FF9900',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    width: '85%',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#1F2937',
    marginTop: 12,
  },
  modalMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    width: '100%',
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalDeleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    backgroundColor: '#DC2626',
    borderRadius: 12,
    gap: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  modalCancelText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  modalDeleteText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
  },
});