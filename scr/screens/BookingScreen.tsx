import React, { useState, useEffect, useRef } from "react"
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  TextInput,
  Animated,
  Image,
  Platform,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { GetDanhSachBanAn, SetTrangThai1, SetTrangThai2, BanAnResponse } from "../../services/banAnService"
import { DatBan, DatBanRequest, ChiTietDatBanModel, HuyDatBan } from "../../services/datBanService"
import { GetDanhSachThucDon, ThucDonItem } from "../../services/thucDonService"
import { getTaiKhoanId } from "../../services/storage"
import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker"

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
  const [heldTableId, setHeldTableId] = useState<number | null>(null)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [qrModalVisible, setQrModalVisible] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [activeMenuTab, setActiveMenuTab] = useState<string>("yeuThich")
  const [countdown, setCountdown] = useState(600)
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)
  const [isHoldingTable, setIsHoldingTable] = useState(false)
  const [justBookedOrderId, setJustBookedOrderId] = useState<number | null>(null)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // ===== Date picker state (NGOÀI MODAL) =====
  const [showDatePicker, setShowDatePicker] = useState(false)
  const today = new Date()
  const maxDate = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7)
  const [displayDate, setDisplayDate] = useState<string>(() => {
    const dd = String(today.getDate()).padStart(2, "0")
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const yyyy = String(today.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  })

  const formatDDMMYYYY = (d: Date) => {
    const dd = String(d.getDate()).padStart(2, "0")
    const mm = String(d.getMonth() + 1).padStart(2, "0")
    const yyyy = String(d.getFullYear())
    return `${dd}-${mm}-${yyyy}`
  }

  const onChangeDate = (event: DateTimePickerEvent, selected?: Date) => {
    // Trên iOS: giữ mở picker, trên Android: đóng sau khi chọn
    setShowDatePicker(Platform.OS === "ios")
    if (event.type === "set" && selected) {
      const chosen = new Date(selected)
      const min = new Date(today.getFullYear(), today.getMonth(), today.getDate())
      if (chosen >= min && chosen <= maxDate) {
        setDisplayDate(formatDDMMYYYY(chosen))
      }
    }
  }
  // ==========================================

  // Animation refs
  const scaleAnimations = useRef<{ [key: number]: Animated.Value }>({})
  const holdAnimations = useRef<{ [key: number]: Animated.Value }>({})

  // Load dữ liệu
  useEffect(() => {
    loadTables()
    loadTaiKhoanId()
  }, [])

  useEffect(() => {
    return () => {
      if (countdownInterval) clearInterval(countdownInterval)
    }
  }, [countdownInterval])

  useEffect(() => {
    if (countdown === 0 && isHoldingTable) {
      handleCountdownExpired()
    }
  }, [countdown, isHoldingTable])

  const refreshData = async () => {
    try {
      setLoading(true)
      await loadTables()
    } catch (error) {
      console.error('Lỗi khi refresh:', error)
    } finally {
      setLoading(false)
    }
  }

  const resetBookingState = async () => {
    if (currentSelectedTableId && isHoldingTable) {
      try {
        await SetTrangThai1(currentSelectedTableId)
      } catch (error) {
        console.error('Lỗi trả bàn:', error)
      }
    }
    setModalVisible(false)
    setSelectedMenu([])
    setCurrentSelectedTableId(null)
    setSelectedTable(null)
    setGhiChu("")
    setSoNguoi(1)
    setSearch("")
    setExpandedCategories([])
    stopCountdown()
  }

  const loadTaiKhoanId = async () => {
    try {
      const id = await getTaiKhoanId()
      setTaiKhoanId(id)
      if (id) await loadMenuData(id)
    } catch (error) {
      console.error('Lỗi load taiKhoanId:', error)
    }
  }

  const loadMenuData = async (userId?: number) => {
    try {
      const response = await GetDanhSachThucDon(userId ?? undefined)
      const formattedMenu: MenuItem[] = response.danhSachBan.map((item: ThucDonItem) => ({
        id: String(item.id),
        ten: item.tenMon,
        danhMuc:
          item.monChinh === true ? "Món chính" :
          item.doUong === true ? "Đồ uống" :
          item.trangMien === true ? "Tráng miệng" : "Món phụ"
      }))
      const formattedYeuThich: MenuItem[] = response.danhSachYeuThich?.map((item) => ({
        id: String(item.id),
        ten: item.tenMon,
        danhMuc: "Món yêu thích"
      })) || []
      setMenuData(formattedMenu)
      setDanhSachYeuThich(formattedYeuThich)
    } catch (error) {
      console.error('Lỗi load menu:', error)
      Alert.alert("Lỗi", "Không thể tải thực đơn.")
    }
  }

  const loadTables = async () => {
    try {
      setLoading(true)
      const banAnData = await GetDanhSachBanAn()
      const formattedTables: Table[] = banAnData.map((item: BanAnResponse) => ({
        id: item.id,
        tenBan: item.tenBan,
        trangThai: item.trangThai,
        idTang: item.idTang,
        tang: `Tầng ${item.idTang}`,
        soGhe: Math.floor(Math.random() * 6) + 4,
        monAn: []
      }))
      formattedTables.forEach(table => {
        scaleAnimations.current[table.id] = new Animated.Value(1)
        holdAnimations.current[table.id] = new Animated.Value(0)
      })
      setTables(formattedTables)
    } catch (error) {
      console.error('Lỗi load bàn:', error)
      Alert.alert("Lỗi", "Không thể tải danh sách bàn.")
    } finally {
      setLoading(false)
    }
  }

  const handleTableSelect = async (table: Table) => {
    try {
      if (currentSelectedTableId && currentSelectedTableId !== table.id) {
        await SetTrangThai1(currentSelectedTableId)
      }
      await SetTrangThai2(table.id)
      setCurrentSelectedTableId(table.id)
      setSelectedTable(table)
      startCountdown()
      setIsHoldingTable(true)
      setModalVisible(true)
    } catch (error) {
      console.error('Lỗi chọn bàn:', error)
      Alert.alert("Lỗi", "Không thể chọn bàn.")
    }
  }

  const showTableInfo = (table: Table) => {
    if (table.trangThai === 2) {
      Alert.alert("Bàn đã được đặt", "Vui lòng chọn bàn khác.")
      return
    }
    handleTableSelect(table)
  }

  const toggleMenuItem = (id: string) => {
    setSelectedMenu(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    )
  }

  const startCountdown = () => {
    setCountdown(600)
    if (countdownInterval) clearInterval(countdownInterval)
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    setCountdownInterval(interval)
  }

  const stopCountdown = () => {
    if (countdownInterval) clearInterval(countdownInterval)
    setCountdownInterval(null)
    setCountdown(600)
    setIsHoldingTable(false)
  }

  const handleCountdownExpired = async () => {
    stopCountdown()
    if (currentSelectedTableId) {
      try {
        await SetTrangThai1(currentSelectedTableId)
      } catch (error) {
        console.error('Lỗi trả bàn:', error)
      }
    }
    resetBookingState()
    await refreshData()
    Alert.alert("Hết thời gian", "Bàn đã được nhả ra.")
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
  }

  const confirmOrder = async () => {
    if (!selectedTable || !taiKhoanId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập.")
      return
    }
    setPaymentModalVisible(true)
  }

  const processOrder = async () => {
    if (!selectedTable || !selectedPaymentMethod) return
    try {
      const chiTietDatBans: ChiTietDatBanModel[] = selectedMenu.map(id => ({
        DonDatBanId: 0,
        BanAnId: selectedTable.id,
        MonAnId: parseInt(id),
        SoLuong: 1,
        GhiChu: ""
      }))
      const datBanRequest: DatBanRequest = {
        TaiKhoanId: taiKhoanId!,
        SoNguoi: soNguoi,
        TongTien: selectedMenu.length * 50000,
        PhuongThucThanhToan: selectedPaymentMethod,
        TrangThai: "Đã đặt",
        GhiChu: ghiChu,
        ChiTietDatBans: chiTietDatBans
      }
      const response = await DatBan(datBanRequest)
      const isSuccess = (response as any).donDatBanId > 0

      if (isSuccess) {
        const donDatBanId = (response as any).donDatBanId
        stopCountdown()
        setTables(prev => prev.map(t => t.id === selectedTable.id ? { ...t, trangThai: 2 } : t))
        resetBookingState()
        setJustBookedOrderId(donDatBanId)
        Alert.alert(
          "Đặt bàn thành công!",
          `Bàn ${selectedTable.tenBan} đã được đặt.\nMã đơn: ${donDatBanId}`,
          [
            { text: "Hủy", style: "destructive", onPress: () => setCancelModalVisible(true) },
            { text: "Đóng", style: "cancel" }
          ]
        )
      } else {
        Alert.alert("Lỗi", "Không thể đặt bàn.")
      }
    } catch (error) {
      console.error('Lỗi đặt bàn:', error)
      Alert.alert("Lỗi", "Không thể đặt bàn.")
    }
  }

  const handlePaymentMethod = (method: string) => {
    if (method === "taiQuan") {
      setSelectedPaymentMethod("Thanh Toán tại quán")
      setPaymentModalVisible(false)
      processOrder()
    } else if (method === "chuyenKhoan") {
      setPaymentModalVisible(false)
      setQrModalVisible(true)
    }
  }

  const handleTransferComplete = () => {
    setSelectedPaymentMethod("Đã thanh toán")
    setQrModalVisible(false)
    processOrder()
  }

  const handleConfirmCancelOrder = async () => {
    if (!cancelReason.trim() || !justBookedOrderId) return
    try {
      const response = await HuyDatBan({
        DonDatBanId: justBookedOrderId,
        TaiKhoanId: taiKhoanId!,
        LyDoHuy: cancelReason
      })
      if (response.donDatBanId > 0) {
        Alert.alert("Thành công", "Đơn đã được hủy")
        setJustBookedOrderId(null)
        setCancelReason("")
        setCancelModalVisible(false)
        await refreshData()
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể hủy.")
    }
  }

  const groupedTables = tables.reduce((acc, table) => {
    if (!acc[table.tang]) acc[table.tang] = []
    acc[table.tang].push(table)
    return acc
  }, {} as Record<string, Table[]>)

  const allMenuData = [...menuData, ...danhSachYeuThich]
  const filteredMenu = allMenuData.filter(item => item.ten.toLowerCase().includes(search.toLowerCase()))

  const getFilteredMenuByTab = () => {
    switch (activeMenuTab) {
      case "yeuThich": return danhSachYeuThich.filter(i => i.ten.toLowerCase().includes(search.toLowerCase()))
      case "monChinh": return menuData.filter(i => i.danhMuc === "Món chính" && i.ten.toLowerCase().includes(search.toLowerCase()))
      case "doUong": return menuData.filter(i => i.danhMuc === "Đồ uống" && i.ten.toLowerCase().includes(search.toLowerCase()))
      case "trangMien": return menuData.filter(i => i.danhMuc === "Tráng miệng" && i.ten.toLowerCase().includes(search.toLowerCase()))
      default: return filteredMenu
    }
  }

  const currentMenuItems = getFilteredMenuByTab()
  const floors = Object.keys(groupedTables).sort()
  const availableCount = tables.filter(t => t.trangThai === 1).length
  const bookedCount = tables.filter(t => t.trangThai === 2).length

  const renderTable = (table: Table, isDisabled: boolean) => {
    let backgroundColor = "#D0D0D0"
    if (currentSelectedTableId === table.id && table.trangThai === 1) backgroundColor = "#FFA500"
    else if (table.trangThai === 1) backgroundColor = "#4CAF50"
    else if (table.trangThai === 2) backgroundColor = "#D0D0D0"

    return (
      <TouchableOpacity
        key={table.id}
        style={[styles.tableCard, { backgroundColor, opacity: isDisabled ? 0.5 : 1 }]}
        activeOpacity={0.8}
        onPress={() => !isDisabled && showTableInfo(table)}
        disabled={isDisabled}
      >
        <Ionicons name="restaurant" size={28} color="#fff" />
        <Text style={styles.tableName}>{table.tenBan}</Text>
        <Text style={styles.seatCount}>{table.soGhe} ghế</Text>
      </TouchableOpacity>
    )
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Đang tải danh sách bàn...</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Chọn Bàn</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={refreshData} disabled={loading}>
            <Ionicons name="refresh" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
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

      {/* NÚT CHỌN NGÀY Ở NGOÀI */}
      <View style={styles.datePickerContainer}>
        <Text style={styles.dateLabel}>Ngày đặt bàn</Text>
        <TouchableOpacity
          style={styles.dateDisplayButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Ionicons name="calendar-outline" size={20} color="#0066CC" />
          <Text style={styles.dateDisplayText}>{displayDate}</Text>
          <Ionicons name="chevron-down" size={18} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={new Date()}
            mode="date"
            display={Platform.OS === "android" ? "default" : "inline"}
            onChange={onChangeDate}
            minimumDate={today}
            maximumDate={maxDate}
          />
        )}
      </View>

      {/* DANH SÁCH TẦNG */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {floors.map(floor => {
          const isInactive = selectedFloor && selectedFloor !== floor
          return (
            <TouchableOpacity
              key={floor}
              activeOpacity={0.9}
              onPress={() => setSelectedFloor(selectedFloor === floor ? null : floor)}
            >
              <View style={[styles.floorSection, isInactive && { opacity: 0.3 }]}>
                <Text style={styles.floorTitle}>{floor}</Text>
                <View style={styles.tablesGrid}>
                  {groupedTables[floor].map(table => renderTable(table, false))}
                </View>
              </View>
            </TouchableOpacity>
          )
        })}
      </ScrollView>

      {/* MODAL ĐẶT MÓN */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Chọn món cho bàn {selectedTable?.tenBan}</Text>

            {isHoldingTable && (
              <View style={[styles.countdownModalBox, countdown < 60 && styles.countdownModalBoxWarning]}>
                <Ionicons name="time-outline" size={20} color={countdown < 60 ? "#EF4444" : "#FFA500"} />
                <Text style={[styles.countdownModalText, countdown < 60 && styles.countdownModalTextWarning]}>
                  Còn: {formatTime(countdown)}
                </Text>
              </View>
            )}

            <View style={styles.tabContainer}>
              {["yeuThich", "monChinh", "doUong", "trangMien"].map(key => (
                <TouchableOpacity
                  key={key}
                  style={[styles.tabButton, activeMenuTab === key && styles.activeTab]}
                  onPress={() => { setActiveMenuTab(key); setSearch("") }}
                >
                  <Text style={[styles.tabText, activeMenuTab === key && styles.activeTabText]}>
                    {key === "yeuThich" ? "Yêu thích" : key === "monChinh" ? "Món chính" : key === "doUong" ? "Đồ uống" : "Tráng miệng"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món ăn..."
              value={search}
              onChangeText={setSearch}
            />

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.searchInput, { flex: 1, marginRight: 8 }]}
                placeholder="Số người"
                value={soNguoi.toString()}
                onChangeText={text => setSoNguoi(parseInt(text) || 1)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.searchInput, { flex: 2, marginLeft: 8 }]}
                placeholder="Ghi chú"
                value={ghiChu}
                onChangeText={setGhiChu}
              />
            </View>

            <ScrollView style={{ maxHeight: 400 }}>
              {currentMenuItems.map(item => (
                <TouchableOpacity key={item.id} style={styles.menuItem} onPress={() => toggleMenuItem(item.id)}>
                  <Ionicons
                    name={selectedMenu.includes(item.id) ? "checkbox" : "square-outline"}
                    size={22}
                    color="#1976D2"
                  />
                  <Text style={styles.menuText}>{item.ten}</Text>
                </TouchableOpacity>
              ))}
              {currentMenuItems.length === 0 && <Text style={styles.emptyText}>Không có món</Text>}
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmOrder}>
              <Text style={styles.confirmText}>Xác nhận</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelBtn} onPress={resetBookingState}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Các modal khác giữ nguyên */}
      <Modal visible={paymentModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Thanh toán</Text>
            <TouchableOpacity style={styles.paymentOption} onPress={() => handlePaymentMethod("taiQuan")}>
              <Ionicons name="restaurant" size={24} color="#1976D2" />
              <Text style={styles.paymentText}>Tại quán</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.paymentOption} onPress={() => handlePaymentMethod("chuyenKhoan")}>
              <Ionicons name="card" size={24} color="#1976D2" />
              <Text style={styles.paymentText}>Chuyển khoản</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setPaymentModalVisible(false)}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chuyển khoản</Text>
            <Image
              source={{ uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MB%20Bank%20-%20STK%3A%200123456789" }}
              style={styles.qrCode}
            />
            <Text style={styles.stkText}>STK: 0123456789</Text>
            <TouchableOpacity style={styles.transferButton} onPress={handleTransferComplete}>
              <Text style={styles.transferText}>Đã chuyển</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setQrModalVisible(false)}>
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Hủy đặt bàn</Text>
            <TextInput
              style={styles.cancelReasonInput}
              placeholder="Lý do hủy..."
              value={cancelReason}
              onChangeText={setCancelReason}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButtonModal]} onPress={() => setCancelModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmCancelButton]} onPress={handleConfirmCancelOrder}>
                <Text style={styles.confirmCancelButtonText}>Xác nhận</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

// ================= STYLE ==================
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5F5F5" },
  header: { backgroundColor: "#6b759cff", padding: 16, borderBottomLeftRadius: 20, borderBottomRightRadius: 20 },
  headerTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  headerTitle: { fontSize: 22, fontWeight: "bold", color: "#fff", flex: 1, textAlign: "center" },
  refreshButton: { padding: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
  legend: { flexDirection: "row", justifyContent: "center", marginTop: 10, gap: 16 },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 12, height: 12, borderRadius: 3 },
  legendText: { color: "#fff", fontSize: 12 },
  statsContainer: { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", margin: 12, padding: 10, borderRadius: 10, elevation: 2 },
  statItem: { alignItems: "center" },
  statLabel: { color: "#999", fontSize: 12 },
  statValue: { fontSize: 18, fontWeight: "bold" },
  statDivider: { width: 1, height: 30, backgroundColor: "#E0E0E0" },

  // NÚT CHỌN NGÀY Ở NGOÀI
  datePickerContainer: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  dateLabel: { fontSize: 13, color: "#64748B", marginBottom: 6, fontWeight: "600" },
  dateDisplayButton: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", padding: 12, borderRadius: 12, borderWidth: 1, borderColor: "#E2E8F0", gap: 8 },
  dateDisplayText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1E293B" },

  content: { flex: 1, paddingHorizontal: 10 },
  floorSection: { marginBottom: 20, backgroundColor: "#fff", borderRadius: 14, padding: 10, elevation: 2 },
  floorTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 8 },
  tablesGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between", rowGap: 10 },
  tableCard: { width: "22%", aspectRatio: 1, borderRadius: 12, justifyContent: "center", alignItems: "center", padding: 8 },
  tableName: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  seatCount: { color: "#fff", fontSize: 10 },

  modalContainer: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContent: { backgroundColor: "#fff", width: "90%", maxHeight: "85%", borderRadius: 16, padding: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  searchInput: { backgroundColor: "#f3f3f3", padding: 10, borderRadius: 10, marginBottom: 10 },
  inputRow: { flexDirection: "row", marginBottom: 10 },
  menuItem: { flexDirection: "row", alignItems: "center", paddingVertical: 8 },
  menuText: { marginLeft: 8, fontSize: 15, color: "#333" },
  confirmBtn: { backgroundColor: "#1976D2", padding: 12, borderRadius: 10, alignItems: "center", marginTop: 15 },
  confirmText: { color: "#fff", fontWeight: "bold" },
  cancelBtn: { marginTop: 10, alignItems: "center" },
  cancelText: { color: "#1976D2", fontWeight: "600" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  loadingText: { fontSize: 16, color: "#666" },
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center", padding: 20 },
  modalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 400 },
  paymentOption: { flexDirection: "row", alignItems: "center", backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E2E8F0" },
  paymentText: { marginLeft: 12, fontSize: 16, fontWeight: "600", color: "#1E293B" },
  qrCode: { width: 150, height: 150, alignSelf: "center", marginVertical: 16 },
  stkText: { fontSize: 18, fontWeight: "700", color: "#1976D2", textAlign: "center" },
  transferButton: { backgroundColor: "#1976D2", borderRadius: 12, padding: 16, alignItems: "center", marginBottom: 12 },
  transferText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  cancelButton: { backgroundColor: "#F8FAFC", borderRadius: 12, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#E2E8F0" },
  tabContainer: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16, backgroundColor: "#E8F0FF", borderRadius: 12, padding: 4 },
  tabButton: { flex: 1, alignItems: "center", paddingVertical: 8, borderRadius: 10 },
  activeTab: { backgroundColor: "#0066CC" },
  tabText: { fontSize: 11, color: "#64748B", fontWeight: "600" },
  activeTabText: { color: "#fff", fontWeight: "700" },
  emptyText: { textAlign: "center", color: "#94A3B8", marginTop: 32, fontSize: 14 },
  countdownModalBox: { backgroundColor: "#FFF3CD", paddingVertical: 10, paddingHorizontal: 12, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: "#FFA500" },
  countdownModalBoxWarning: { backgroundColor: "#F8D7DA", borderColor: "#EF4444" },
  countdownModalText: { fontSize: 14, fontWeight: "600", color: "#FFA500" },
  countdownModalTextWarning: { color: "#EF4444" },
  cancelReasonInput: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, minHeight: 100, backgroundColor: "#F9FAFB", marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalButton: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  cancelButtonModal: { backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#ddd" },
  confirmCancelButton: { backgroundColor: "#E53935" },
  cancelButtonText: { color: "#333", fontWeight: "600", fontSize: 16 },
  confirmCancelButtonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
})