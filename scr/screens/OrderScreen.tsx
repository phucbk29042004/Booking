import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LichSuDatBan, LichSuDatBanItem } from "../../services/datBanService"
import { getTaiKhoanId } from "../../services/storage"

export default function OrderScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<LichSuDatBanItem[]>([])

  useEffect(() => {
    const load = async () => {
      try {
        const id = await getTaiKhoanId()
        if (!id) {
          setOrders([])
          setLoading(false)
          return
        }
        const data = await LichSuDatBan(id)
        setOrders(data)
      } catch (e) {
        console.error('Lỗi tải lịch sử đặt bàn:', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi đơn đặt bàn</Text>
        <View style={{ width: 24 }} />
      </View>
      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="small" color="#1976D2" />
          <Text style={{ marginTop: 8, color: "#666" }}>Đang tải...</Text>
        </View>
      ) : (
      <FlatList
        data={orders}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<Text style={{ textAlign: 'center', color: '#888', marginTop: 24 }}>Chưa có lịch sử đặt bàn</Text>}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.tableName}>Đơn #{item.id}</Text>
            <Text style={styles.status}>Trạng thái: <Text style={{ color: item.trangThai === 'Đã hủy' ? '#E53935' : '#43A047' }}>{item.trangThai || '—'}</Text></Text>
            <Text style={styles.time}>Ngày đặt: {item.ngayDat} {item.gioDat ? `- ${item.gioDat}` : ''}</Text>
            {item.chiTietDatBans?.map((ct, idx) => (
              <View key={idx} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 13, color: '#333' }}>Bàn: {ct.tenBan} {ct.monAnId ? `- Món: ${ct.tenMon} x${ct.soLuong || 1}` : ''}</Text>
              </View>
            ))}
            {item.ghiChu ? (<Text style={{ marginTop: 6, fontSize: 12, color: '#777' }}>Ghi chú: {item.ghiChu}</Text>) : null}
          </View>
        )}
      />)}
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
  loadingWrap: {
    padding: 24,
    alignItems: 'center'
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
