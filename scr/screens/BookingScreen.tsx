"use client"

import React, { useState, useEffect } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  Modal,
  TextInput,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { GetDanhSachBanAn, SetTrangThai1, SetTrangThai2, BanAnResponse } from "../../services/banAnService"
import { DatBan, DatBanRequest, ChiTietDatBanModel } from "../../services/datBanService"
import { GetDanhSachThucDon, ThucDonItem } from "../../services/thucDonService"
import { getTaiKhoanId } from "../../services/storage"

// ================= JSON DỮ LIỆU ==================
interface MenuItem {
  id: string
  ten: string
  danhMuc: string
}

// ================= INTERFACE ==================
interface Table {
  id: number
  tenBan: string
  trangThai: number
  idTang: number
  tang: string
  soGhe?: number
  monAn?: string[]
}

// ================= COMPONENT ==================
export default function BookingScreen() {
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedMenu, setSelectedMenu] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [currentSelectedTableId, setCurrentSelectedTableId] = useState<number | null>(null)
  const [taiKhoanId, setTaiKhoanId] = useState<number | null>(null)
  const [soNguoi, setSoNguoi] = useState<number>(1)
  const [ghiChu, setGhiChu] = useState<string>("")
  const [menuData, setMenuData] = useState<MenuItem[]>([])
  const [danhSachYeuThich, setDanhSachYeuThich] = useState<MenuItem[]>([])

  // Load dữ liệu bàn từ API và taiKhoanId từ storage
  useEffect(() => {
    loadTables()
    loadTaiKhoanId()
  }, [])

  const loadTaiKhoanId = async () => {
    try {
      const id = await getTaiKhoanId()
      setTaiKhoanId(id)
      console.log('taiKhoanId từ storage:', id)
      // Load menu data sau khi có taiKhoanId
      if (id) {
        await loadMenuData(id)
      }
    } catch (error) {
      console.error('Lỗi khi load taiKhoanId:', error)
    }
  }

  const loadMenuData = async (userId?: number) => {
    try {
      console.log('Đang gọi API GetDanhSachThucDon...')
      const response = await GetDanhSachThucDon(userId ?? undefined)
      console.log('Dữ liệu thực đơn từ API:', response)
      
      // Chuyển đổi dữ liệu từ API sang format cần thiết
      const formattedMenu: MenuItem[] = response.danhSachBan.map((item: ThucDonItem) => ({
        id: String(item.id),
        ten: item.tenMon,
        danhMuc: item.monChinh ? "Món chính" : "Món phụ"
      }))
      
      // Xử lý danh sách yêu thích nếu có
      const formattedYeuThich: MenuItem[] = response.danhSachYeuThich?.map((item) => ({
        id: String(item.id),
        ten: item.tenMon,
        danhMuc: "Món yêu thích"
      })) || []
      
      console.log('Dữ liệu menu đã format:', formattedMenu)
      console.log('Dữ liệu yêu thích đã format:', formattedYeuThich)
      setMenuData(formattedMenu)
      setDanhSachYeuThich(formattedYeuThich)
    } catch (error) {
      console.error('Lỗi khi load dữ liệu thực đơn:', error)
      Alert.alert("Lỗi", "Không thể tải thực đơn. Vui lòng thử lại.")
    }
  }

  const loadTables = async () => {
    try {
      setLoading(true)
      console.log('Đang gọi API GetDanhSachBanAn...')
      const banAnData = await GetDanhSachBanAn()
      console.log('Dữ liệu từ API:', banAnData)
      
      // Chuyển đổi dữ liệu từ API sang format cần thiết
      const formattedTables: Table[] = banAnData.map((item: BanAnResponse) => ({
        id: item.id,
        tenBan: item.tenBan,
        trangThai: item.trangThai,
        idTang: item.idTang,
        tang: `Tầng ${item.idTang}`,
        soGhe: Math.floor(Math.random() * 6) + 4, // Tạm thời random, có thể lấy từ API sau
        monAn: []
      }))
      
      console.log('Dữ liệu đã format:', formattedTables)
      setTables(formattedTables)
    } catch (error) {
      console.error('Lỗi khi load dữ liệu bàn:', error)
      Alert.alert("Lỗi", "Không thể tải danh sách bàn. Vui lòng thử lại.")
    } finally {
      setLoading(false)
    }
  }

  // Chọn bàn và gọi API
  const handleTableSelect = async (table: Table) => {
    try {
      // Nếu có bàn đang chọn trước đó, reset về trạng thái 1
      if (currentSelectedTableId && currentSelectedTableId !== table.id) {
        await SetTrangThai1(currentSelectedTableId)
      }

      // Set trạng thái 2 cho bàn mới chọn
      await SetTrangThai2(table.id)
      
      // Cập nhật state
      setCurrentSelectedTableId(table.id)
      setSelectedTable(table)
      
      // Mở modal chọn món
      setModalVisible(true)
      
    } catch (error) {
      console.error('Lỗi khi chọn bàn:', error)
      Alert.alert("Lỗi", "Không thể chọn bàn. Vui lòng thử lại.")
    }
  }

  // Mở modal chọn món
  const showTableInfo = (table: Table) => {
    console.log('showTableInfo called with table:', table)
    if (table.trangThai === 2) { // Trạng thái 2 = đã đặt
      Alert.alert("Bàn đã được đặt", "Vui lòng chọn bàn khác.")
      return
    }
    handleTableSelect(table)
  }

  const toggleMenuItem = (id: string) => {
    if (selectedMenu.includes(id)) {
      setSelectedMenu(selectedMenu.filter((item) => item !== id))
    } else {
      setSelectedMenu([...selectedMenu, id])
    }
  }

  const toggleCategory = (category: string) => {
    if (expandedCategories.includes(category)) {
      setExpandedCategories(expandedCategories.filter((c) => c !== category))
    } else {
      setExpandedCategories([...expandedCategories, category])
    }
  }

  const confirmOrder = async () => {
    if (!selectedTable) return

    // Kiểm tra taiKhoanId
    if (!taiKhoanId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt bàn.")
      return
    }

    try {
      // Chuyển đổi selectedMenu sang ChiTietDatBanModel
      const chiTietDatBans: ChiTietDatBanModel[] = selectedMenu.map((monAnId) => ({
        donDatBanId: 0, // Sẽ được set bởi server
        banAnId: selectedTable.id,
        monAnId: parseInt(monAnId),
        soLuong: 1, // Mặc định 1 phần
        ghiChu: ""
      }))

      // Tạo request cho API
      const datBanRequest: DatBanRequest = {
        taiKhoanId: taiKhoanId,
        soNguoi: soNguoi,
        trangThai: "Đã đặt",
        ghiChu: ghiChu,
        chiTietDatBans: chiTietDatBans
      }

      console.log('Gửi request đặt bàn:', datBanRequest)
      
      // Gọi API đặt bàn
      const response = await DatBan(datBanRequest)
      console.log('Response từ API:', response)

      if (response.statusCode === 200) {
        // Cập nhật local state
        const updatedTables: Table[] = tables.map((t) =>
          t.id === selectedTable.id
            ? { ...t, trangThai: 2, monAn: selectedMenu }
            : t,
        )

        setTables(updatedTables)
        setModalVisible(false)
        setSelectedMenu([])
        setCurrentSelectedTableId(null)
        setGhiChu("")

        Alert.alert(
          "✅ Đặt bàn thành công!",
          `Bàn ${selectedTable.tenBan} đã được đặt với ${selectedMenu.length} món.\nMã đơn: ${response.donDatBanId}`,
        )
      } else {
        Alert.alert("Lỗi", response.message || "Không thể đặt bàn. Vui lòng thử lại.")
      }
    } catch (error) {
      console.error('Lỗi khi đặt bàn:', error)
      Alert.alert("Lỗi", "Không thể đặt bàn. Vui lòng thử lại.")
    }
  }

  const groupedTables = tables.reduce(
    (acc, table) => {
      if (!acc[table.tang]) acc[table.tang] = []
      acc[table.tang].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  // Kết hợp menu data và danh sách yêu thích
  const allMenuData = [...menuData, ...danhSachYeuThich]
  
  const filteredMenu = allMenuData.filter((item) =>
    item.ten.toLowerCase().includes(search.toLowerCase()),
  )
  
  // Nhóm món ăn theo danh mục
  const groupedMenu = allMenuData.reduce((acc, item) => {
    if (!acc[item.danhMuc]) acc[item.danhMuc] = []
    acc[item.danhMuc].push(item)
    return acc
  }, {} as Record<string, typeof allMenuData>)

  const categories = Object.keys(groupedMenu)

  const renderTable = (table: Table, isDisabled: boolean) => {
    console.log(`Rendering table ${table.tenBan}, isDisabled: ${isDisabled}, trangThai: ${table.trangThai}`)
    let backgroundColor = "#D0D0D0"
    if (table.trangThai === 1) backgroundColor = "#4CAF50" // Trạng thái 1 = trống
    if (table.trangThai === 2) backgroundColor = "#D0D0D0" // Trạng thái 2 = đã đặt
    if (currentSelectedTableId === table.id) backgroundColor = "#FFA500" // Bàn đang chọn

    return (
      <TouchableOpacity
        key={table.id}
        style={[
          styles.tableCard,
          { backgroundColor, opacity: isDisabled ? 0.5 : 1 },
        ]}
        activeOpacity={0.8}
        onPress={() => {
          console.log(`Table ${table.tenBan} pressed, isDisabled: ${isDisabled}`)
          if (!isDisabled) {
            showTableInfo(table)
          }
        }}
        disabled={isDisabled}
      >
        <Ionicons name="restaurant" size={28} color="#fff" />
        <Text style={styles.tableName}>{table.tenBan}</Text>
        <Text style={styles.seatCount}>{table.soGhe} ghế</Text>
      </TouchableOpacity>
    )
  }

  const floors = Object.keys(groupedTables).sort()
  const availableCount = tables.filter((t) => t.trangThai === 1).length
  const bookedCount = tables.filter((t) => t.trangThai === 2).length

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách bàn...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chọn Bàn</Text>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#D0D0D0" }]} />
            <Text style={styles.legendText}>Đã đặt</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#4CAF50" }]} />
            <Text style={styles.legendText}>Trống</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendBox, { backgroundColor: "#FFA500" }]} />
            <Text style={styles.legendText}>Bạn</Text>
          </View>
        </View>
      </View>

      {/* Thống kê */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Trống</Text>
          <Text style={styles.statValue}>{availableCount}</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Đã đặt</Text>
          <Text style={styles.statValue}>{bookedCount}</Text>
        </View>
      </View>

      {/* DANH SÁCH TẦNG */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {floors.map((floor) => {
          const isInactive =
            selectedFloor && selectedFloor !== floor ? true : false
          return (
            <TouchableOpacity
              key={floor}
              activeOpacity={0.9}
              onPress={() =>
                setSelectedFloor(selectedFloor === floor ? null : floor)
              }
            >
              <View
                style={[
                  styles.floorSection,
                  isInactive ? { opacity: 0.3 } : { opacity: 1 },
                ]}
              >
                <Text style={styles.floorTitle}>{floor}</Text>
                <View style={styles.tablesGrid}>
                  {groupedTables[floor].map((table) =>
                    renderTable(table, false), // Không disable bàn nào cả
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* MODAL CHỌN MÓN ĂN */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Chọn món cho bàn {selectedTable?.tenBan}
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món ăn..."
              value={search}
              onChangeText={setSearch}
            />

            {/* Input số người và ghi chú */}
            <View style={styles.inputRow}>
              <TextInput
                style={[styles.searchInput, { flex: 1, marginRight: 8 }]}
                placeholder="Số người"
                value={soNguoi.toString()}
                onChangeText={(text) => setSoNguoi(parseInt(text) || 1)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.searchInput, { flex: 2, marginLeft: 8 }]}
                placeholder="Ghi chú (tùy chọn)"
                value={ghiChu}
                onChangeText={setGhiChu}
              />
            </View>

            <ScrollView style={{ marginTop: 10, maxHeight: 400 }}>
              {categories.map((category) => (
                <View key={category} style={styles.categoryContainer}>
                  <TouchableOpacity
                    style={styles.categoryHeader}
                    onPress={() => toggleCategory(category)}
                  >
                    <Text style={styles.categoryTitle}>{category}</Text>
                    <Ionicons
                      name={
                        expandedCategories.includes(category)
                          ? "chevron-up"
                          : "chevron-down"
                      }
                      size={20}
                      color="#333"
                    />
                  </TouchableOpacity>

                  {expandedCategories.includes(category) && (
                    <View style={styles.categoryItems}>
                      {groupedMenu[category].map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.menuItem}
                          onPress={() => toggleMenuItem(item.id)}
                        >
                          <Ionicons
                            name={
                              selectedMenu.includes(item.id)
                                ? "checkbox"
                                : "square-outline"
                            }
                            size={22}
                            color="#1976D2"
                          />
                          <Text style={styles.menuText}>{item.ten}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmOrder}>
              <Text style={styles.confirmText}>Xác nhận chọn món</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// ================= STYLE ==================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: {
    backgroundColor: "#6b759cff",
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  legend: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 16,
  },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
  legendText: { color: "#fff", fontSize: 12 },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    margin: 12,
    padding: 10,
    borderRadius: 10,
    elevation: 2,
  },
  statItem: { alignItems: "center" },
  statLabel: { color: "#999", fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statDivider: { width: 1, height: 30, backgroundColor: "#E0E0E0" },
  content: { flex: 1, paddingHorizontal: 10 },
  floorSection: {
    marginBottom: 20,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    elevation: 2,
  },
  floorTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  tablesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 10,
  },
  tableCard: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  tableName: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  seatCount: { color: "#fff", fontSize: 10 },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    maxHeight: "85%",
    borderRadius: 16,
    padding: 16,
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  searchInput: {
    backgroundColor: "#f3f3f3",
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  categoryContainer: {
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 8,
    overflow: "hidden",
  },
  categoryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    padding: 12,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  categoryItems: {
    backgroundColor: "#fff",
    paddingHorizontal: 12,
  },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  menuText: { marginLeft: 8, fontSize: 15, color: "#333" },
  confirmBtn: {
    backgroundColor: "#1976D2",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 15,
  },
  confirmText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { marginTop: 10, alignItems: "center" },
  cancelText: { color: "#1976D2", fontWeight: "600" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
})