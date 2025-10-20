import React from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, SafeAreaView } from "react-native"
import { Ionicons } from "@expo/vector-icons"

const mockOrders = [
  { id: "1", table: "A5", status: "Đã xác nhận", time: "18:30 - 20:00" },
  { id: "2", table: "B2", status: "Đã hủy", time: "19:00 - 21:00" },
]

export default function OrderScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn đặt bàn</Text>
        <View style={{ width: 24 }} />
      </View>
      <FlatList
        data={mockOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tableName}>Bàn {item.table}</Text>
            <Text style={styles.status}>
              Trạng thái:{" "}
              <Text
                style={{
                  color: item.status === "Đã hủy" ? "#E53935" : "#43A047",
                }}
              >
                {item.status}
              </Text>
            </Text>
            <Text style={styles.time}>{item.time}</Text>
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
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  tableName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1976D2",
  },
  status: {
    marginTop: 6,
    fontSize: 14,
  },
  time: {
    marginTop: 4,
    fontSize: 12,
    color: "#777",
  },
})
