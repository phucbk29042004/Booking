import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import LoginScreen from "../scr/screens/LoginScreen"
import RegisterScreen from "../scr/screens/RegisterScreen"
import GuiOTPScreen from "../scr/screens/GuiOTPScreen"
import CheckOTPScreen from "../scr/screens/CheckOTPScreen"
import DoiMatKhauScreen from "../scr/screens/DoiMatKhauScreen"

const Stack = createNativeStackNavigator()

export default function AuthStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="QuenMatKhau" component={GuiOTPScreen} />
      <Stack.Screen name="GuiOTP" component={GuiOTPScreen} />
      <Stack.Screen name="CheckOTP" component={CheckOTPScreen} />
      <Stack.Screen name="DoiMatKhau" component={DoiMatKhauScreen} />
    </Stack.Navigator>
  )
}
