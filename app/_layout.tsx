import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function RootLayout() {
  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />           {/* Welcome screen */}
        <Stack.Screen name="(auth)" />          {/* Login/Signup */}
        <Stack.Screen name="(buyer)" />         {/* Buyer screens */}
        <Stack.Screen name="(seller)" />        {/* Seller screens */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}