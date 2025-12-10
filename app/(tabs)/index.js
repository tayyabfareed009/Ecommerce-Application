// app/(tabs)/index.js
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function TabHomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to E-Commerce App</Text>
      <Text style={styles.subtitle}>Select a role to continue</Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity 
          style={[styles.button, styles.buyerButton]}
          onPress={() => router.push("/(buyer)/HomeScreen")}
        >
          <Text style={styles.buttonText}>👤 Continue as Buyer</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.sellerButton]}
          onPress={() => router.push("/(seller)/Dashboard")}
        >
          <Text style={styles.buttonText}>🏪 Continue as Seller</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.button, styles.authButton]}
          onPress={() => router.push("/(auth)/LoginScreen")}
        >
          <Text style={styles.buttonText}>🔐 Login / Signup</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2d3436',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#636e72',
    marginBottom: 40,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#0984e3',
    padding: 16,
    borderRadius: 12,
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyerButton: {
    backgroundColor: '#6c5ce7',
  },
  sellerButton: {
    backgroundColor: '#fdcb6e',
  },
  authButton: {
    backgroundColor: '#00b894',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});