import { Stack } from 'expo-router';

export default function SellerLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard" />
      <Stack.Screen name="ManageProducts" />
      <Stack.Screen name="AddProduct" />
      <Stack.Screen name="OrderDetails" />
      <Stack.Screen name="SellerProfile" />
    </Stack>
  );
}