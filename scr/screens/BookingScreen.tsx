"use client"

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
  Vibration,
  Image,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { GetDanhSachBanAn, SetTrangThai1, SetTrangThai2, BanAnResponse } from "../../services/banAnService"
import { DatBan, DatBanRequest, ChiTietDatBanModel, HuyDatBan } from "../../services/datBanService"
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
  const [heldTableId, setHeldTableId] = useState<number | null>(null)
  const [paymentModalVisible, setPaymentModalVisible] = useState(false)
  const [qrModalVisible, setQrModalVisible] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("")
  const [activeMenuTab, setActiveMenuTab] = useState<string>("yeuThich")
  const [countdown, setCountdown] = useState(600) // 10 phút = 600 giây
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null)
  const [isHoldingTable, setIsHoldingTable] = useState(false)
  const [justBookedOrderId, setJustBookedOrderId] = useState<number | null>(null)
  const [cancelModalVisible, setCancelModalVisible] = useState(false)
  const [cancelReason, setCancelReason] = useState("")
  
  // Animation refs cho hiệu ứng hold
  const scaleAnimations = useRef<{ [key: number]: Animated.Value }>({})
  const holdAnimations = useRef<{ [key: number]: Animated.Value }>({})

  // Load dữ liệu bàn từ API và taiKhoanId từ storage
  useEffect(() => {
    loadTables()
    loadTaiKhoanId()
  }, [])

  // Cleanup countdown interval khi component unmount
  useEffect(() => {
    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval)
      }
    }
  }, [countdownInterval])

  // Auto cancel reservation khi countdown hết
  useEffect(() => {
    if (countdown === 0 && isHoldingTable) {
      handleCountdownExpired()
    }
  }, [countdown, isHoldingTable])

  // Function để refresh dữ liệu
  const refreshData = async () => {
    try {
      setLoading(true)
      await loadTables()
      console.log('Đã refresh dữ liệu bàn')
    } catch (error) {
      console.error('Lỗi khi refresh dữ liệu:', error)
    } finally {
      setLoading(false)
    }
  }

  // Function để reset hoàn toàn state
  const resetBookingState = async () => {
    // Nếu có bàn đang giữ, trả bàn về trạng thái trống
    if (currentSelectedTableId && isHoldingTable) {
      try {
        await SetTrangThai1(currentSelectedTableId)
        console.log('Đã trả bàn về trạng thái trống')
      } catch (error) {
        console.error('Lỗi khi trả bàn:', error)
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
    stopCountdown() // Dừng countdown
    console.log('Đã reset booking state')
  }

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
        danhMuc: item.monChinh === true ? "Món chính" : 
                item.doUong === true ? "Đồ uống" :
                item.trangMien === true ? "Tráng miệng" : "Món phụ"
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
      
      // Khởi tạo animation values cho mỗi bàn
      formattedTables.forEach(table => {
        scaleAnimations.current[table.id] = new Animated.Value(1)
        holdAnimations.current[table.id] = new Animated.Value(0)
      })
      
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
      
      // Bắt đầu countdown 10 phút
      startCountdown()
      setIsHoldingTable(true)
      
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

  // Bắt đầu countdown timer 10 phút
  const startCountdown = () => {
    console.log('Bắt đầu countdown 10 phút')
    setCountdown(600) // 10 phút = 600 giây
    
    // Clear interval cũ nếu có
    if (countdownInterval) {
      clearInterval(countdownInterval)
    }
    
    // Bắt đầu countdown
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    
    setCountdownInterval(interval)
  }

  // Dừng countdown
  const stopCountdown = () => {
    if (countdownInterval) {
      clearInterval(countdownInterval)
      setCountdownInterval(null)
    }
    setCountdown(600)
    setIsHoldingTable(false)
  }

  const handlePaymentMethod = (method: string) => {
    if (method === "taiQuan") {
      setSelectedPaymentMethod("Thanh Toán tại quán")
      setPaymentModalVisible(false)
      // Tiếp tục với việc đặt bàn
      processOrder()
    } else if (method === "chuyenKhoan") {
      setPaymentModalVisible(false)
      setQrModalVisible(true)
    }
  }

  // Xử lý khi countdown hết
  const handleCountdownExpired = async () => {
    console.log('Countdown đã hết, tự động hủy đặt bàn')
    
    // Dừng countdown
    stopCountdown()
    
    // Reset trạng thái bàn về trạng thái 1 (trống)
    try {
      if (currentSelectedTableId) {
        await SetTrangThai1(currentSelectedTableId)
        console.log('Đã trả bàn về trạng thái trống')
      }
    } catch (error) {
      console.error('Lỗi khi trả bàn:', error)
    }

    // Reset state
    resetBookingState()
    
    // Reload danh sách bàn
    await refreshData()
    
    // Hiển thị alert
    Alert.alert(
      "⏰ Hết thời gian giữ chỗ", 
      "Bạn đã không xác nhận/thanh toán trong 10 phút. Bàn đã được nhả ra."
    )
  }

  // Format countdown thời gian (mm:ss)
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const handleTransferComplete = () => {
    setSelectedPaymentMethod("Chuyển khoản")
    setQrModalVisible(false)
    // Tiếp tục với việc đặt bàn
    processOrder()
  }

  // Hủy đặt bàn ngay sau khi đặt thành công
  const handleCancelJustBooked = () => {
    setCancelModalVisible(true)
  }

  const handleConfirmCancelOrder = async () => {
    if (!cancelReason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do hủy đặt bàn")
      return
    }

    if (!justBookedOrderId) return

    try {
      const taiKhoanId = await getTaiKhoanId()
      if (!taiKhoanId) {
        Alert.alert("Lỗi", "Vui lòng đăng nhập")
        return
      }

      const response = await HuyDatBan({
        DonDatBanId: justBookedOrderId,
        TaiKhoanId: taiKhoanId,
        LyDoHuy: cancelReason
      })

      if (response.message.includes("thành công") || response.donDatBanId > 0) {
        Alert.alert("✅ Thành công", "Đơn đặt bàn đã được hủy")
        setJustBookedOrderId(null)
        setCancelReason("")
        setCancelModalVisible(false)
        // Refresh danh sách bàn
        await refreshData()
      } else {
        Alert.alert("Lỗi", response.message || "Không thể hủy đặt bàn")
      }
    } catch (error: any) {
      console.error('Lỗi hủy đặt bàn:', error)
      Alert.alert("Lỗi", error.response?.data?.message || "Không thể hủy đặt bàn. Vui lòng thử lại.")
    }
  }

  const generateRandomSTK = () => {
    return "0123456789"
  }

  const confirmOrder = async () => {
    if (!selectedTable) return

    // Kiểm tra taiKhoanId
    if (!taiKhoanId) {
      Alert.alert("Lỗi", "Vui lòng đăng nhập để đặt bàn.")
      return
    }

    // Mở modal chọn phương thức thanh toán
    setPaymentModalVisible(true)
  }

  const processOrder = async () => {
    if (!selectedTable || !selectedPaymentMethod) return

    try {
      // Chuyển đổi selectedMenu sang ChiTietDatBanModel
      const chiTietDatBans: ChiTietDatBanModel[] = selectedMenu.map((monAnId: string) => ({
        DonDatBanId: 0, // Sẽ được set bởi server
        BanAnId: selectedTable.id,
        MonAnId: parseInt(monAnId),
        SoLuong: 1, // Mặc định 1 phần
        GhiChu: ""
      }))

      // Tạo request cho API
      const datBanRequest: DatBanRequest = {
        TaiKhoanId: taiKhoanId!,
        SoNguoi: soNguoi,
        TongTien: selectedMenu.length * 50000, // Tạm tính 50k/món, có thể tính từ API sau
        PhuongThucThanhToan: selectedPaymentMethod,
        TrangThai: "Đã đặt",
        GhiChu: ghiChu,
        ChiTietDatBans: chiTietDatBans
      }

      console.log('Gửi request đặt bàn:', datBanRequest)
      
      // Gọi API đặt bàn
      const response = await DatBan(datBanRequest)
      console.log('Response từ API:', response)
      console.log('Response statusCode:', response.statusCode)
      console.log('Response message:', response.message)

      // Kiểm tra response thành công - có thể response không có statusCode
      // Hoặc có thể response trực tiếp là object với message và donDatBanId
      const isSuccess = response.statusCode === 200 || 
                        response.statusCode === 201 || 
                        (response.message && response.message.includes("thành công")) ||
                        response.donDatBanId > 0

      console.log('isSuccess:', isSuccess)
      console.log('selectedTable trước khi reset:', selectedTable)
      console.log('currentSelectedTableId trước khi reset:', currentSelectedTableId)

      if (isSuccess) {
        // Lưu thông tin bàn trước khi reset
        const tableName = selectedTable?.tenBan
        const tableId = selectedTable?.id
        const menuCount = selectedMenu.length
        const donDatBanId = response.donDatBanId

        // Dừng countdown vì đã đặt bàn thành công
        stopCountdown()

        // Cập nhật trạng thái bàn trong state ngay lập tức
        setTables(prevTables => 
          prevTables.map(table => 
            table.id === tableId ? { ...table, trangThai: 2 } : table
          )
        )

        // Reset state
        setModalVisible(false)
        setSelectedMenu([])
        setCurrentSelectedTableId(null)
        setSelectedTable(null)
        setGhiChu("")
        setSoNguoi(1)
        setSearch("")
        setExpandedCategories([])

        // Reload danh sách bàn từ server để đảm bảo đồng bộ
        await refreshData()

        // Lưu ID đơn để có thể hủy ngay
        setJustBookedOrderId(donDatBanId)

        // Hiển thị alert thành công với nút hủy
        Alert.alert(
          "✅ Đặt bàn thành công!",
          `Bàn ${tableName} đã được đặt với ${menuCount} món.\nMã đơn: ${donDatBanId}`,
          [
            {
              text: "Hủy đặt bàn",
              style: "destructive",
              onPress: handleCancelJustBooked
            },
            {
              text: "Đóng",
              style: "cancel"
            }
          ]
        )
      } else {
        // Hiển thị alert lỗi với thông tin debug
        console.log('Response không thành công:', response)
        Alert.alert(
          "Lỗi", 
          response.message || "Không thể đặt bàn. Vui lòng thử lại.\nDebug: " + JSON.stringify(response)
        )
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

  // Lọc menu theo tab đang chọn
  const getFilteredMenuByTab = () => {
    switch (activeMenuTab) {
      case "yeuThich":
        return danhSachYeuThich.filter((item) =>
          item.ten.toLowerCase().includes(search.toLowerCase())
        )
      case "monChinh":
        return menuData.filter((item) =>
          item.danhMuc === "Món chính" && 
          item.ten.toLowerCase().includes(search.toLowerCase())
        )
      case "doUong":
        return menuData.filter((item) =>
          item.danhMuc === "Đồ uống" && 
          item.ten.toLowerCase().includes(search.toLowerCase())
        )
      case "trangMien":
        return menuData.filter((item) =>
          item.danhMuc === "Tráng miệng" && 
          item.ten.toLowerCase().includes(search.toLowerCase())
        )
      default:
        return filteredMenu
    }
  }

  const currentMenuItems = getFilteredMenuByTab()

  const renderTable = (table: Table, isDisabled: boolean) => {
    console.log(`Rendering table ${table.tenBan}, isDisabled: ${isDisabled}, trangThai: ${table.trangThai}`)
    let backgroundColor = "#D0D0D0"
    
    // Ưu tiên màu cam nếu đang chọn VÀ bàn còn trống
    if (currentSelectedTableId === table.id && table.trangThai === 1) {
      backgroundColor = "#FFA500" // Bàn đang chọn (chỉ khi trạng thái 1)
    } else if (table.trangThai === 1) {
      backgroundColor = "#4CAF50" // Trạng thái 1 = trống
    } else if (table.trangThai === 2) {
      backgroundColor = "#D0D0D0" // Trạng thái 2 = đã đặt
    }

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
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={refreshData}
            disabled={loading}
          >
            <Ionicons 
              name="refresh" 
              size={24} 
              color="#fff" 
              style={loading ? styles.refreshIconRotating : {}}
            />
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

            {/* Countdown Timer trong Modal */}
            {isHoldingTable && (
              <View style={[
                styles.countdownModalBox,
                countdown < 60 && styles.countdownModalBoxWarning
              ]}>
                <Ionicons 
                  name="time-outline" 
                  size={20} 
                  color={countdown < 60 ? "#EF4444" : "#FFA500"} 
                />
                <Text style={[
                  styles.countdownModalText,
                  countdown < 60 && styles.countdownModalTextWarning
                ]}>
                  Thời gian còn lại: {formatTime(countdown)}
                </Text>
              </View>
            )}

            {/* Tabs chọn loại món */}
            <View style={styles.tabContainer}>
              {[
                { key: "yeuThich", label: "Yêu thích" },
                { key: "monChinh", label: "Món chính" },
                { key: "doUong", label: "Đồ uống" },
                { key: "trangMien", label: "Tráng miệng" },
              ].map((tab) => (
                <TouchableOpacity
                  key={tab.key}
                  style={[styles.tabButton, activeMenuTab === tab.key && styles.activeTab]}
                  onPress={() => {
                    setActiveMenuTab(tab.key)
                    setSearch("")
                  }}
                >
                  <Text style={[styles.tabText, activeMenuTab === tab.key && styles.activeTabText]}>
                    {tab.label}
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
              {currentMenuItems.map((item) => (
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
              {currentMenuItems.length === 0 && (
                <Text style={styles.emptyText}>Không có món trong mục này</Text>
              )}
            </ScrollView>

            <TouchableOpacity style={styles.confirmBtn} onPress={confirmOrder}>
              <Text style={styles.confirmText}>Xác nhận chọn món</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={resetBookingState}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal chọn hình thức thanh toán */}
      <Modal visible={paymentModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chọn hình thức thanh toán</Text>
            
            <TouchableOpacity 
              style={styles.paymentOption} 
              onPress={() => handlePaymentMethod("taiQuan")}
            >
              <Ionicons name="restaurant" size={24} color="#1976D2" />
              <Text style={styles.paymentText}>Tại quán</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.paymentOption} 
              onPress={() => handlePaymentMethod("chuyenKhoan")}
            >
              <Ionicons name="card" size={24} color="#1976D2" />
              <Text style={styles.paymentText}>Chuyển khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setPaymentModalVisible(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal QR chuyển khoản */}
      <Modal visible={qrModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Chuyển khoản</Text>
            
            <View style={styles.qrContainer}>
              <Text style={styles.qrTitle}>Quét mã QR để thanh toán</Text>
              <Image 
                source={{ uri: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=MB%20Bank%20-%20STK%3A%200123456789%20-%20Chuyen%20khoan%20dat%20ban" }}
                style={styles.qrCode}
                resizeMode="contain"
              />
            </View>

            <View style={styles.bankInfo}>
              <Text style={styles.bankTitle}>Ngân hàng MB Bank</Text>
              <Text style={styles.stkText}>STK: {generateRandomSTK()}</Text>
            </View>

            <TouchableOpacity 
              style={styles.transferButton} 
              onPress={handleTransferComplete}
            >
              <Text style={styles.transferText}>Đã chuyển khoản</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setQrModalVisible(false)}
            >
              <Text style={styles.cancelText}>Hủy</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal hủy đặt bàn */}
      <Modal visible={cancelModalVisible} transparent animationType="fade">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
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
                onPress={() => {
                  setCancelModalVisible(false)
                  setCancelReason("")
                }}
              >
                <Text style={styles.cancelButtonText}>Đóng</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmCancelButton]} 
                onPress={handleConfirmCancelOrder}
              >
                <Text style={styles.confirmCancelButtonText}>Xác nhận hủy</Text>
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
  header: {
    backgroundColor: "#6b759cff",
    padding: 16,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
    textAlign: "center",
  },
  refreshButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
  },
  refreshIconRotating: {
    transform: [{ rotate: "180deg" }],
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
  // Payment modal styles
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  paymentText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 12,
  },
  qrCode: {
    width: 150,
    height: 150,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  qrPlaceholder: {
    fontSize: 14,
    color: "#64748B",
  },
  bankInfo: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    alignItems: "center",
  },
  bankTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1E293B",
    marginBottom: 8,
  },
  stkText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1976D2",
  },
  transferButton: {
    backgroundColor: "#1976D2",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  transferText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  // Tab styles
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
    paddingVertical: 8,
    borderRadius: 10,
  },
  activeTab: {
    backgroundColor: "#0066CC",
  },
  tabText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "600",
  },
  activeTabText: {
    color: "#fff",
    fontWeight: "700",
  },
  emptyText: {
    textAlign: "center",
    color: "#94A3B8",
    marginTop: 32,
    fontSize: 14,
  },
  // Countdown modal styles
  countdownModalBox: {
    backgroundColor: "#FFF3CD",
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#FFA500",
  },
  countdownModalBoxWarning: {
    backgroundColor: "#F8D7DA",
    borderColor: "#EF4444",
  },
  countdownModalText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFA500",
  },
  countdownModalTextWarning: {
    color: "#EF4444",
  },
  // Modal hủy đặt bàn styles
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 16,
    marginTop: 8,
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
    backgroundColor: "#F9FAFB",
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
  confirmCancelButton: {
    backgroundColor: "#E53935",
  },
  cancelButtonText: {
    color: "#333",
    fontWeight: "600",
    fontSize: 16,
  },
  confirmCancelButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
})