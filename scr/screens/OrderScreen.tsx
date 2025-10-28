import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Modal, Alert, TextInput, ScrollView } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { LichSuDatBan, LichSuDatBanItem, HuyDatBan } from "../../services/datBanService"
import { getTaiKhoanId } from "../../services/storage"

export default function OrderScreen({ navigation }: any) {
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<LichSuDatBanItem[]>([])
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<LichSuDatBanItem | null>(null)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null)
  const [cancelReason, setCancelReason] = useState("")
  const [cancelling, setCancelling] = useState(false)

  const loadOrders = async () => {
    try {
      setLoading(true)
      const id = await getTaiKhoanId()
      if (!id) {
        setOrders([])
        return
      }
      const data = await LichSuDatBan(id)
      setOrders(data)
    } catch (e) {
      console.error('Lỗi tải lịch sử đặt bàn:', e)
      Alert.alert("Lỗi", "Không thể tải lịch sử đặt bàn")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrders()
  }, [])

  const handleCancelOrder = () => {
    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy đặt bàn")
      return
    }

    // Xác nhận trước khi hủy
    Alert.alert(
      "Xác nhận hủy đặt bàn",
      "Bạn có chắc chắn muốn hủy đơn đặt bàn này?",
      [
        {
          text: "Không",
          style: "cancel"
        },
        {
          text: "Có, hủy",
          style: "destructive",
          onPress: confirmCancel
        }
      ]
    )
  }

  const confirmCancel = async () => {
    if (!selectedOrderId) return

    try {
      setCancelling(true)
      const taiKhoanId = await getTaiKhoanId()
      if (!taiKhoanId) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập")
        return
      }

      const response = await HuyDatBan({
        DonDatBanId: selectedOrderId,
        TaiKhoanId: taiKhoanId,
        LyDoHuy: cancelReason
      })

      if (response.message.includes("thành công") || response.donDatBanId > 0) {
        Alert.alert("✅ Thành công", "Đơn đặt bàn đã được hủy")
        setCancelReason("")
        setSelectedOrderId(null)
        setCancelModalVisible(false)
        await loadOrders()
      } else {
        Alert.alert("Lỗi", response.message || "Không thể hủy đặt bàn")
      }
    } catch (error: any) {
      console.error('Lỗi hủy đặt bàn:', error)
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể hủy đặt bàn. Vui lòng thử lại.")
    } finally {
      setCancelling(false)
    }
  }

  const openDetailModal = (order: LichSuDatBanItem) => {
    setSelectedOrder(order)
    setDetailModalVisible(true)
  }

  const closeDetailModal = () => {
    setDetailModalVisible(false)
    setSelectedOrder(null)
  }

  const handleCancelFromDetail = () => {
    if (!selectedOrder) return
    setDetailModalVisible(false)
    setSelectedOrderId(selectedOrder.id)
    setCancelReason("")
    setCancelModalVisible(true)
  }

  const openCancelModal = (orderId: number) => {
    setSelectedOrderId(orderId)
    setCancelReason("")
    setCancelModalVisible(true)
  }

  const closeCancelModal = () => {
    setCancelModalVisible(false)
    setSelectedOrderId(null)
    setCancelReason("")
  }
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
          <TouchableOpacity 
            style={styles.card}
            activeOpacity={0.7}
            onPress={() => openDetailModal(item)}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.tableName}>Đơn #{item.id}</Text>
              <Ionicons name="chevron-forward" size={24} color="#999" />
            </View>
            <Text style={styles.status}>Trạng thái: <Text style={{ color: item.trangThai === 'Đã hủy' ? '#E53935' : '#43A047' }}>{item.trangThai || '—'}</Text></Text>
            <Text style={styles.time}>Ngày đặt: {item.ngayDat} {item.gioDat ? `- ${item.gioDat}` : ''}</Text>
            {item.chiTietDatBans?.map((ct, idx) => (
              <View key={idx} style={{ marginTop: 6 }}>
                <Text style={{ fontSize: 13, color: '#333' }}>Bàn: {ct.tenBan} {ct.monAnId ? `- Món: ${ct.tenMon} x${ct.soLuong || 1}` : ''}</Text>
              </View>
            ))}
            {item.ghiChu ? (<Text style={{ marginTop: 6, fontSize: 12, color: '#777' }}>Ghi chú: {item.ghiChu}</Text>) : null}
          </TouchableOpacity>
        )}
      />)}

      {/* Modal Chi tiết đơn hàng */}
      <Modal visible={detailModalVisible} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.detailModalContent}>
            <View style={styles.detailModalHeader}>
              <Text style={styles.detailModalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity onPress={closeDetailModal}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.detailScrollView}>
              {selectedOrder && (
                <>
                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Mã đơn</Text>
                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Trạng thái</Text>
                    <Text style={[
                      styles.detailValue,
                      { color: selectedOrder.trangThai === 'Đã hủy' ? '#E53935' : '#43A047' }
                    ]}>
                      {selectedOrder.trangThai || '—'}
                    </Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Ngày đặt</Text>
                    <Text style={styles.detailValue}>{selectedOrder.ngayDat || '—'}</Text>
                  </View>

                  <View style={styles.detailSection}>
                    <Text style={styles.detailLabel}>Giờ đặt</Text>
                    <Text style={styles.detailValue}>{selectedOrder.gioDat || '—'}</Text>
                  </View>

                  {selectedOrder.soNguoi && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Số người</Text>
                      <Text style={styles.detailValue}>{selectedOrder.soNguoi} người</Text>
                    </View>
                  )}

                  {selectedOrder.chiTietDatBans && selectedOrder.chiTietDatBans.length > 0 && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Chi tiết</Text>
                      {selectedOrder.chiTietDatBans.map((ct, idx) => (
                        <View key={idx} style={styles.detailItem}>
                          <Text style={styles.detailItemText}>
                            <Ionicons name="restaurant-outline" size={16} color="#1976D2" /> {ct.tenBan}
                          </Text>
                          {ct.tenMon && (
                            <Text style={styles.detailItemSubtext}>
                              {ct.tenMon} x{ct.soLuong || 1}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}

                  {selectedOrder.ghiChu && (
                    <View style={styles.detailSection}>
                      <Text style={styles.detailLabel}>Ghi chú</Text>
                      <Text style={styles.detailValue}>{selectedOrder.ghiChu}</Text>
                    </View>
                  )}
                </>
              )}
            </ScrollView>

            {/* Nút hủy đặt bàn */}
            {selectedOrder && selectedOrder.trangThai !== "Đã hủy" && selectedOrder.trangThai !== "Đã hoàn thành" && (
              <TouchableOpacity 
                style={styles.cancelOrderButton}
                onPress={handleCancelFromDetail}
              >
                <Ionicons name="close-circle" size={24} color="#fff" />
                <Text style={styles.cancelOrderButtonText}>
                  Bạn có muốn hủy đơn đặt hàng không?
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              style={styles.closeDetailButton}
              onPress={closeDetailModal}
            >
              <Text style={styles.closeDetailButtonText}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Hủy đặt bàn */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Hủy đặt bàn</Text>
            <Text style={styles.modalSubtitle}>
              Vui lòng nhập lý do hủy đặt bàn
            </Text>
            
            <TextInput
              style={styles.cancelReasonInput}
              placeholder="Nhập lý do hủy..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButtonModal]} 
                onPress={closeCancelModal}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleCancelOrder}
                disabled={cancelling}
              >
                {cancelling ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={styles.confirmButtonText}>Xác nhận hủy</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  tableName: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#1976D2",
  },
  cancelButton: {
    padding: 4,
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
  // Modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
  },
  cancelReasonInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: "#333",
    minHeight: 100,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonModal: {
    backgroundColor: "#f5f5f5",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  confirmButton: {
    backgroundColor: "#E53935",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  // Modal chi tiết styles
  detailModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    height: "85%",
    maxHeight: "90%",
  },
  detailModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  detailModalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  detailScrollView: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 13,
    color: "#666",
    marginBottom: 6,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "600",
  },
  detailItem: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  detailItemText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  detailItemSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 4,
  },
  cancelOrderButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E53935",
    padding: 16,
    marginHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  cancelOrderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  closeDetailButton: {
    backgroundColor: "#f5f5f5",
    padding: 16,
    marginHorizontal: 24,
    marginTop: 12,
    marginBottom: 24,
    borderRadius: 12,
    alignItems: "center",
  },
  closeDetailButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "600",
  },
})
