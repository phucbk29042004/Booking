import React from "react"
import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import HomeScreen from "../scr/screens/HomeScreen"
import BookingScreen from "../scr/screens/BookingScreen"
import MenuScreen from "../scr/screens/MenuScreen"
import PersonalStackNavigator from "./PersonalStackNavigator"

const Tab = createBottomTabNavigator()

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: true,
        tabBarActiveTintColor: "#1976D2",
        tabBarInactiveTintColor: "#999",
        tabBarStyle: {
          height: 70,
          borderTopWidth: 1,
          borderColor: "#eee",
          backgroundColor: "#fff",
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 5,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Trang chủ",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "home" : "home-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Booking"
        component={BookingScreen}
        options={{
          title: "Đặt bàn",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "restaurant" : "restaurant-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Menu"
        component={MenuScreen}
        options={{
          title: "Thực đơn",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "fast-food" : "fast-food-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Personal"
        component={PersonalStackNavigator}
        options={{
          title: "Cá nhân",
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? "person" : "person-outline"}
              size={26}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  )
}
