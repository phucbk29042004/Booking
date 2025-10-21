import React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const mockNotifications = [
  {
    id: "1",
    message: "🎉 Bạn đã đặt thành công bàn A5 lúc 18:30!",
    type: "success",
  },
  {
    id: "2",
    message: "⚠️ Đơn đặt bàn B2 của bạn đã bị hủy.",
    type: "warning",
  },
]

export default function NotificationScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={mockNotifications}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View
            style={[
              styles.notification,
              item.type === "success"
                ? { borderLeftColor: "#4CAF50" }
                : { borderLeftColor: "#F44336" },
            ]}
          >
            <Ionicons
              name={
                item.type === "success"
                  ? "checkmark-circle"
                  : "alert-circle-outline"
              }
              size={22}
              color={item.type === "success" ? "#4CAF50" : "#F44336"}
              style={{ marginRight: 8 }}
            />
            <Text style={styles.message}>{item.message}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  listContent: {
    padding: 16,
  },
  notification: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    elevation: 2,
  },
  message: {
    fontSize: 14,
    color: "#444",
    flex: 1,
    flexWrap: "wrap",
  },
})
