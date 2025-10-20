import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import AuthStackNavigator from "./AuthStackNavigator"
import MainTabNavigator from "./MainTabNavigator"
import { useAuth } from "../scr/context/AuthContext"

const Stack = createNativeStackNavigator()

export default function RootNavigator() {
  const { isLoggedIn } = useAuth()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!isLoggedIn ? (
        <Stack.Screen name="Auth" component={AuthStackNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      )}
    </Stack.Navigator>
  )
}
