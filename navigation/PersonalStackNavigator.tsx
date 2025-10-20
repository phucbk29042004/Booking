import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ProfileScreen from "../scr/screens/ProfileScreen"
import OrderScreen from "../scr/screens/OrderScreen"
import NotificationScreen from "../scr/screens/NotificationScreen"

const Stack = createNativeStackNavigator()

export default function PersonalStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Orders" component={OrderScreen} />
      <Stack.Screen name="Notifications" component={NotificationScreen} />
    </Stack.Navigator>
  )
}
