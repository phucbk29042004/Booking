"use client"

import React, { useEffect, useState } from "react"
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Image, Modal, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { GetDanhSachThucDon, ThucDonItem, MonAnYeuThich, ThemMonAnYeuThich, XoaMonAnYeuThich } from "../../services/thucDonService"
import { getTaiKhoanId } from "../../services/storage"
type MenuItem = { id: string; ten: string; gia?: number; monChinh?: boolean; hinhAnh?: string }
type MenuBuckets = {
  yeuThich: MenuItem[]
  monChinh: MenuItem[]
  doUong: MenuItem[]
  trangMien: MenuItem[]
}
type TabKey = keyof MenuBuckets

export default function MenuScreen({ route }: any) {
  const initialTab = route?.params?.initialTab || "monChinh"
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab as TabKey)
  const [search, setSearch] = useState("")
  const [detailVisible, setDetailVisible] = useState(false)
  const [selectedItem, setSelectedItem] = useState<{ id: string; ten: string; hinhAnh?: string; gia?: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const [taiKhoanId, setTaiKhoanId] = useState<number | null>(null)
  const [danhSach, setDanhSach] = useState<ThucDonItem[]>([])
  const [yeuThich, setYeuThich] = useState<MonAnYeuThich[] | null>(null)

  useEffect(() => {
    if (route?.params?.initialTab) {
      setActiveTab(route.params.initialTab as TabKey)
    }
  }, [route?.params?.initialTab])

  useEffect(() => {
    const init = async () => {
      try {
        const id = await getTaiKhoanId()
        setTaiKhoanId(id)
        const res = await GetDanhSachThucDon(id ?? undefined)
        console.log('API response:', res)
        console.log('Danh sách món:', res.danhSachBan)
        console.log('Món yêu thích:', res.danhSachYeuThich)
        setDanhSach(res.danhSachBan || [])
        setYeuThich(res.danhSachYeuThich || null)
        if ((res.danhSachYeuThich?.length || 0) > 0) {
          setActiveTab("yeuThich")
        }
      } catch (e) {
        console.error('Lỗi tải thực đơn:', e)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  const buckets: MenuBuckets = {
    yeuThich: (yeuThich || []).map(x => ({ id: String(x.id), ten: x.tenMon, gia: x.gia, hinhAnh: x.hinhAnh })),
    monChinh: danhSach.filter(x => x.monChinh === true).map(x => ({ id: String(x.id), ten: x.tenMon, gia: x.gia, monChinh: x.monChinh || undefined, hinhAnh: x.hinhAnh })),
    doUong: danhSach.filter(x => x.doUong === true).map(x => ({ id: String(x.id), ten: x.tenMon, gia: x.gia, hinhAnh: x.hinhAnh })),
    trangMien: danhSach.filter(x => x.trangMien === true).map(x => ({ id: String(x.id), ten: x.tenMon, gia: x.gia, hinhAnh: x.hinhAnh })),
  }

  const filteredMenu = (buckets[activeTab] || []).filter((item) => item.ten.toLowerCase().includes(search.toLowerCase()))

  const openDetail = (item: { id: string; ten: string; hinhAnh?: string; gia?: number }) => {
    console.log('Mở detail với item:', item)
    console.log('URL ảnh:', item.hinhAnh)
    setSelectedItem(item)
    setDetailVisible(true)
  }

  const closeDetail = () => setDetailVisible(false)

  const renderMenuItem = ({ item }: { item: { id: string; ten: string; hinhAnh?: string; gia?: number } }) => (
    <TouchableOpacity style={styles.menuItem} activeOpacity={0.7} onPress={() => openDetail(item)}>
      <View style={styles.iconContainer}>
        <Ionicons name="restaurant-outline" size={20} color="#0066CC" />
      </View>
      <Text style={styles.menuText}>{item.ten}</Text>
      <Ionicons name="chevron-forward" size={18} color="#D0D5DD" />
    </TouchableOpacity>
  )

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.tabContainer}>
        {[
          { key: "yeuThich", label: "Món yêu thích" },
          { key: "monChinh", label: "Món chính" },
          { key: "doUong", label: "Đồ uống" },
          { key: "trangMien", label: "Tráng miệng" },
        ].map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabButton, activeTab === (tab.key as TabKey) && styles.activeTab]}
            onPress={() => {
              setActiveTab(tab.key as TabKey)
              setSearch("")
            }}
          >
            <Text style={[styles.tabText, activeTab === (tab.key as TabKey) && styles.activeTabText]}>{tab.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#0066CC" />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm món ăn..."
          placeholderTextColor="#A0A8B8"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {loading ? (
        <Text style={styles.emptyText}>Đang tải thực đơn...</Text>
      ) : (
      <FlatList
        data={filteredMenu}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderMenuItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Không có món trong mục này</Text>}
        contentContainerStyle={{ paddingVertical: 8 }}
        scrollEnabled={true}
      />)}

      <Modal visible={detailVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Image 
              source={{ uri: selectedItem?.hinhAnh || "https://picsum.photos/seed/food/600/360" }} 
              style={styles.modalImage}
              onError={(error) => {
                console.log('Lỗi load ảnh:', error.nativeEvent.error)
              }}
              onLoad={() => {
                console.log('Ảnh đã load thành công:', selectedItem?.hinhAnh)
              }}
            />
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>{selectedItem?.ten}</Text>
              <Text style={styles.modalPrice}>
                Giá: {selectedItem?.gia ? `${selectedItem.gia.toLocaleString()}đ` : 'Liên hệ'}
              </Text>
              <Text style={styles.modalDesc}>
                Món ăn được chế biến tươi mỗi ngày, hương vị đậm đà. Bạn có thể thêm ghi chú khi gọi món.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity style={styles.btnGhost} onPress={closeDetail}>
                  <Text style={styles.btnGhostText}>Đóng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.btnPrimary}
                  onPress={async () => {
                    try {
                      if (!selectedItem) return
                      if (!taiKhoanId) {
                        Alert.alert("Lỗi", "Vui lòng đăng nhập để thực hiện thao tác này")
                        return
                      }
                      
                      if (activeTab === "yeuThich") {
                        // Xóa khỏi yêu thích
                        await XoaMonAnYeuThich(taiKhoanId, parseInt(selectedItem.id))
                        setYeuThich((prev) => prev?.filter(x => String(x.id) !== selectedItem.id) || [])
                        Alert.alert("Thành công", "Đã xóa khỏi món yêu thích")
                      } else {
                        // Thêm vào yêu thích
                        await ThemMonAnYeuThich(taiKhoanId, parseInt(selectedItem.id))
                        setYeuThich((prev) => {
                          const exists = prev?.some(x => String(x.id) === selectedItem.id)
                          if (exists) return prev || []
                          const next = [...(prev || []), { 
                            id: parseInt(selectedItem.id), 
                            tenMon: selectedItem.ten, 
                            gia: selectedItem.gia || 0,
                            hinhAnh: selectedItem.hinhAnh || ""
                          }]
                          return next
                        })
                        Alert.alert("Thành công", "Đã thêm vào món yêu thích")
                      }
                      setDetailVisible(false)
                    } catch (e) {
                      console.error('API error:', e)
                      Alert.alert("Lỗi", "Không thể thực hiện thao tác. Vui lòng thử lại.")
                    }
                  }}
                >
                  <Ionicons name={activeTab === "yeuThich" ? "heart-dislike-outline" : "heart-outline"} size={18} color="#fff" />
                  <Text style={styles.btnPrimaryText}>
                    {activeTab === "yeuThich" ? "Xóa khỏi yêu thích" : "Thêm vào yêu thích"}
                  </Text>
                </TouchableOpacity>
              </View>
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
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 12,
    paddingTop: 8,
  },

  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    backgroundColor: "#E8F0FF",
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#0066CC",
  },
  tabText: {
    fontSize: 12,
    color: "#64748B",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },

  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  searchInput: {
    marginLeft: 8,
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E8F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    flex: 1,
    fontSize: 14,
    color: "#1E293B",
    fontWeight: "500",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 32,
    fontSize: 14,
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  modalImage: {
    width: "100%",
    height: 200,
  },
  modalContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1E293B",
    marginBottom: 8,
  },
  modalPrice: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0066CC",
    marginBottom: 12,
  },
  modalDesc: {
    fontSize: 13,
    color: "#64748B",
    lineHeight: 20,
    marginBottom: 16,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  btnGhost: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  btnGhostText: {
    color: "#64748B",
    fontWeight: "600",
    fontSize: 14,
  },
  btnPrimary: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: "#0066CC",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    shadowColor: "#0066CC",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  btnPrimaryText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
})
