// app/(buyer)/_layout.tsx
import { Stack } from 'expo-router';

export default function BuyerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false, // Hide headers by default
        contentStyle: {
          backgroundColor: '#FFFFFF',
        },
      }}
    >
      {/* HomeScreen.js */}
      <Stack.Screen
        name="HomeScreen"
        options={{
          title: 'Home',
        }}
      />
      
      {/* cart.js */}
      <Stack.Screen
        name="cart"
        options={{
          title: 'Cart',
        }}
      />
      
      {/* profile.js */}
      <Stack.Screen
        name="profile"
        options={{
          title: 'Profile',
        }}
      />
      
      {/* product-details.js */}
      <Stack.Screen
        name="product-details"
        options={{
          title: 'Product Details',
        }}
      />
    </Stack>
  );
}