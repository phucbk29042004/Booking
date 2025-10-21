import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { GetDanhSachThongBao, XoaThongBao, ThongBaoItem } from "../../services/thongBaoService"
import { getTaiKhoanId } from "../../services/storage"

export default function NotificationScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState<ThongBaoItem[]>([])
  const [taiKhoanId, setTaiKhoanId] = useState<number | null>(null)

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      const id = await getTaiKhoanId()
      setTaiKhoanId(id)
      if (!id) {
        setNotifications([])
        setLoading(false)
        return
      }
      const data = await GetDanhSachThongBao(id)
      setNotifications(data)
    } catch (e) {
      console.error('Lỗi tải thông báo:', e)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteNotification = async (id: number) => {
    try {
      await XoaThongBao(id)
      setNotifications(prev => prev.filter(item => item.id !== id))
      Alert.alert("Thành công", "Đã xóa thông báo")
    } catch (e) {
      console.error('Lỗi xóa thông báo:', e)
      Alert.alert("Lỗi", "Không thể xóa thông báo. Vui lòng thử lại.")
    }
  }

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
        <View style={{ width: 24 }} />
      </View>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color="#1976D2" />
          <Text style={styles.loadingText}>Đang tải thông báo...</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có thông báo nào</Text>
          }
          renderItem={({ item }) => (
            <View style={styles.notification}>
              <View style={styles.notificationContent}>
                <Text style={styles.title}>{item.tieuDe}</Text>
                <Text style={styles.message}>{item.noiDung}</Text>
                <Text style={styles.date}>{formatDate(item.ngayTao)}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDeleteNotification(item.id)}
                style={styles.deleteButton}
              >
                <Ionicons name="trash-outline" size={20} color="#F44336" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  loadingText: {
    marginTop: 8,
    color: "#666",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#888",
    marginTop: 32,
    fontSize: 14,
  },
  notification: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 4,
    borderLeftColor: "#1976D2",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  notificationContent: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginBottom: 6,
  },
  date: {
    fontSize: 12,
    color: "#999",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  },
})
