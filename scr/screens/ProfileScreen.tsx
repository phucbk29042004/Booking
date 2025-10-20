"use client"
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Alert, ScrollView } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { useAuth } from "../context/AuthContext"

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: () => {
          logout()
          Alert.alert("Thành công", "Đã đăng xuất!")
        },
      },
    ])
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Hồ sơ</Text>
        </View>

        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color="#0066CC" />
          </View>
          <Text style={styles.userName}>{user?.name || "Guest"}</Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Orders")}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="receipt-outline" size={20} color="#0066CC" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Theo dõi đơn đặt bàn</Text>
              <Text style={styles.menuSubtitle}>Xem lịch sử đặt bàn của bạn</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D0D0D0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Notifications")}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="notifications-outline" size={20} color="#0066CC" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Thông báo</Text>
              <Text style={styles.menuSubtitle}>Cập nhật từ ứng dụng</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D0D0D0" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuIconContainer}>
              <Ionicons name="settings-outline" size={20} color="#0066CC" />
            </View>
            <View style={styles.menuContent}>
              <Text style={styles.menuTitle}>Cài đặt tài khoản</Text>
              <Text style={styles.menuSubtitle}>Quản lý thông tin cá nhân</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#D0D0D0" />
          </TouchableOpacity>
        </View>

        {/* Spacer */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <View style={styles.logoutContainer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={18} color="#0066CC" />
          <Text style={styles.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  profileCard: {
    alignItems: "center",
    paddingVertical: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    backgroundColor: "#F0F7FF",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0EEFF",
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 2,
    borderColor: "#0066CC",
  },
  userName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 13,
    color: "#666666",
  },
  menuSection: {
    paddingHorizontal: 20,
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#F0F7FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 12,
    color: "#999999",
  },
  logoutContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#F0F7FF",
    borderWidth: 1.5,
    borderColor: "#0066CC",
    gap: 8,
  },
  logoutText: {
    color: "#0066CC",
    fontSize: 15,
    fontWeight: "600",
  },
})
