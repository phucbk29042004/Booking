import React, { useState } from "react"
import { View, Text, Modal, TextInput, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs"
import HomeScreen from "../scr/screens/HomeScreen"
import BookingScreen from "../scr/screens/BookingScreen"
import MenuScreen from "../scr/screens/MenuScreen"
import PersonalStackNavigator from "./PersonalStackNavigator"
import AdminStackNavigator from "./AdminStackNavigator"

const Tab = createBottomTabNavigator()

export default function MainTabNavigator() {
  // trạng thái mở khóa admin
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false)
  const [showPwdModal, setShowPwdModal] = useState(false)
  const [pwd, setPwd] = useState("")

  const tryUnlock = () => {
    if (pwd === "123456") {
      setIsAdminUnlocked(true)
      setShowPwdModal(false)
      setPwd("")
    } else {
      // báo lỗi đơn giản
      setPwd("")
    }
  }

  return (
    <>
      {/* Modal nhập mật khẩu */}
      <Modal visible={showPwdModal} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 12 }}>Nhập mật khẩu Admin</Text>
            <TextInput
              value={pwd}
              onChangeText={setPwd}
              placeholder="••••••"
              secureTextEntry
              style={{ borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 10, padding: 12, marginBottom: 12 }}
            />
            <View style={{ flexDirection: "row", gap: 10 }}>
              <TouchableOpacity
                onPress={() => { setShowPwdModal(false); setPwd(""); }}
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#e5e7eb", alignItems: "center" }}>
                <Text>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={tryUnlock}
                style={{ flex: 1, padding: 12, borderRadius: 10, backgroundColor: "#2563eb", alignItems: "center" }}>
                <Text style={{ color: "#fff", fontWeight: "700" }}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              <Ionicons name={focused ? "home" : "home-outline"} size={26} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Booking"
          component={BookingScreen}
          options={{
            title: "Đặt bàn",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "restaurant" : "restaurant-outline"} size={26} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Menu"
          component={MenuScreen}
          options={{
            title: "Thực đơn",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "fast-food" : "fast-food-outline"} size={26} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Personal"
          component={PersonalStackNavigator}
          options={{
            title: "Cá nhân",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={26} color={color} />
            ),
          }}
        />

        {/* ===== Tab Admin ===== */}
        <Tab.Screen
          name="Admin"
          component={AdminStackNavigator}
          options={{
            title: "Admin",
            tabBarIcon: ({ focused, color }) => (
              <Ionicons name={focused ? "shield" : "shield-outline"} size={26} color={color} />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // nếu chưa mở khóa -> chặn vào, bật modal
              if (!isAdminUnlocked) {
                e.preventDefault()
                setShowPwdModal(true)
              }
            },
          })}
        />
      </Tab.Navigator>
    </>
  )
}
