"use client"

import React, { useState } from "react"
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

// ================= JSON DỮ LIỆU ==================
const tablesData = [
  { id: "1", ten: "A1", tang: "Tầng 1" },
  { id: "2", ten: "A2", tang: "Tầng 1" },
  { id: "3", ten: "A3", tang: "Tầng 1" },
  { id: "4", ten: "A4", tang: "Tầng 1" },
  { id: "5", ten: "A5", tang: "Tầng 1" },
  { id: "6", ten: "A6", tang: "Tầng 1" },
  { id: "7", ten: "A7", tang: "Tầng 1" },
  { id: "8", ten: "A8", tang: "Tầng 1" },
  { id: "9", ten: "A9", tang: "Tầng 1" },
  { id: "10", ten: "A10", tang: "Tầng 1" },
  { id: "21", ten: "B1", tang: "Tầng 2" },
  { id: "22", ten: "B2", tang: "Tầng 2" },
  { id: "23", ten: "B3", tang: "Tầng 2" },
  { id: "24", ten: "B4", tang: "Tầng 2" },
  { id: "25", ten: "B5", tang: "Tầng 2" },
  { id: "26", ten: "B6", tang: "Tầng 2" },
  { id: "27", ten: "B7", tang: "Tầng 2" },
  { id: "28", ten: "B8", tang: "Tầng 2" },
  { id: "29", ten: "B9", tang: "Tầng 2" },
  { id: "30", ten: "B10", tang: "Tầng 2" },
]

const menuData = [
  { id: "5", ten: "Gỏi cuốn tôm thịt", danhMuc: "Món khai vị" },
  { id: "9", ten: "Salad rau trộn dầu giấm", danhMuc: "Món khai vị" },
  { id: "11", ten: "Tôm hấp bia", danhMuc: "Món khai vị" },
  
  { id: "1", ten: "Cơm chiên hải sản", danhMuc: "Món chính" },
  { id: "2", ten: "Phở bò tái", danhMuc: "Món chính" },
  { id: "3", ten: "Mì xào bò", danhMuc: "Món chính" },
  { id: "4", ten: "Lẩu thái hải sản", danhMuc: "Món chính" },
  { id: "6", ten: "Bò lúc lắc", danhMuc: "Món chính" },
  { id: "7", ten: "Cá hồi nướng bơ tỏi", danhMuc: "Món chính" },
  { id: "13", ten: "Cơm tấm sườn bì chả", danhMuc: "Món chính" },
  { id: "14", ten: "Mì Ý sốt bò bằm", danhMuc: "Món chính" },
  
  { id: "8", ten: "Cánh gà chiên nước mắm", danhMuc: "Món phụ" },
  { id: "10", ten: "Sườn nướng mật ong", danhMuc: "Món phụ" },
  { id: "12", ten: "Cháo hải sản", danhMuc: "Món phụ" },
  
  { id: "15", ten: "Trà đào cam sả", danhMuc: "Đồ uống" },
]

// ================= INTERFACE ==================
interface Table {
  id: string
  ten: string
  tang: string
  trangThai: "trong" | "dat"
  soGhe: number
  monAn?: string[]
}

// ================= DATA MẪU ==================
const prepareTables = (): Table[] =>
  tablesData.map((item) => ({
    id: item.id,
    ten: item.ten,
    tang: item.tang,
    trangThai: Math.random() > 0.5 ? "trong" : "dat",
    soGhe: Math.floor(Math.random() * 6) + 4,
    monAn: [],
  }))

// ================= COMPONENT ==================
export default function BookingScreen() {
  const [tables, setTables] = useState<Table[]>(prepareTables())
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [selectedFloor, setSelectedFloor] = useState<string | null>(null)
  const [modalVisible, setModalVisible] = useState(false)
  const [search, setSearch] = useState("")
  const [selectedMenu, setSelectedMenu] = useState<string[]>([])
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])

  // Mở modal chọn món
  const showTableInfo = (table: Table) => {
    if (table.trangThai === "dat") {
      Alert.alert("Bàn đã được đặt", "Vui lòng chọn bàn khác.")
      return
    }
    setSelectedTable(table)
    setModalVisible(true)
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

  const confirmOrder = () => {
    if (!selectedTable) return

    const updatedTables: Table[] = tables.map((t) =>
      t.id === selectedTable.id
        ? { ...t, trangThai: "dat" as "dat", monAn: selectedMenu }
        : t,
    )

    setTables(updatedTables)
    setModalVisible(false)
    setSelectedMenu([])

    Alert.alert(
      "✅ Đặt bàn thành công!",
      `Bàn ${selectedTable.ten} đã được đặt với ${selectedMenu.length} món.`,
    )
  }

  const groupedTables = tables.reduce(
    (acc, table) => {
      if (!acc[table.tang]) acc[table.tang] = []
      acc[table.tang].push(table)
      return acc
    },
    {} as Record<string, Table[]>,
  )

  const filteredMenu = menuData.filter((item) =>
    item.ten.toLowerCase().includes(search.toLowerCase()),
  )

  // Nhóm món ăn theo danh mục
  const groupedMenu = filteredMenu.reduce((acc, item) => {
    if (!acc[item.danhMuc]) acc[item.danhMuc] = []
    acc[item.danhMuc].push(item)
    return acc
  }, {} as Record<string, typeof menuData>)

  const categories = Object.keys(groupedMenu)

  const renderTable = (table: Table, isDisabled: boolean) => {
    let backgroundColor = "#D0D0D0"
    if (table.trangThai === "trong") backgroundColor = "#4CAF50"
    if (selectedTable?.id === table.id) backgroundColor = "#FFA500"

    return (
      <TouchableOpacity
        key={table.id}
        style={[
          styles.tableCard,
          { backgroundColor, opacity: isDisabled ? 0.5 : 1 },
        ]}
        activeOpacity={0.8}
        onLongPress={() => !isDisabled && showTableInfo(table)}
        disabled={isDisabled}
      >
        <Ionicons name="restaurant" size={28} color="#fff" />
        <Text style={styles.tableName}>{table.ten}</Text>
        <Text style={styles.seatCount}>{table.soGhe} ghế</Text>
      </TouchableOpacity>
    )
  }

  const floors = Object.keys(groupedTables).sort()
  const availableCount = tables.filter((t) => t.trangThai === "trong").length
  const bookedCount = tables.filter((t) => t.trangThai === "dat").length

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
                    renderTable(table, isInactive),
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
              Chọn món cho bàn {selectedTable?.ten}
            </Text>

            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món ăn..."
              value={search}
              onChangeText={setSearch}
            />

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
})