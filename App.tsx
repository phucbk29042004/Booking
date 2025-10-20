import React from "react"
import { NavigationContainer } from "@react-navigation/native"
import RootNavigator from "./navigation/RootNavigator"
import { AuthProvider } from "./scr/context/AuthContext"

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </AuthProvider>
  )
}
