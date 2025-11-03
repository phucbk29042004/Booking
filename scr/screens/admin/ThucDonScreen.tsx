import React, { useEffect, useMemo, useState } from "react";
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  FlatList, Alert, Modal, KeyboardAvoidingView, Platform, ScrollView
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { GetDanhSachThucDon, ThucDonItem } from "../../../services/thucDonService";
import { thucDonThemMoi, thucDonCapNhat, thucDonXoa } from "../../../services/adminService";

type LocalMon = {
  id?: number;
  tenMon: string;
  moTa?: string;
  gia: string;            // input text -> số khi submit
  hinhAnh?: string;
  monChinh?: boolean;
  doUong?: boolean;
  trangMien?: boolean;
};

type TabKey = "all" | "monChinh" | "doUong" | "trangMien";

const BLUE = "#0066CC";
const BLUE_DARK = "#1976D2";

export default function AdminThucDonScreen() {
  const [dsMon, setDsMon] = useState<ThucDonItem[]>([]);
  const [loading, setLoading] = useState(false);

  // lọc & search
  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [search, setSearch] = useState("");

  // modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState<LocalMon>({
    tenMon: "", gia: "", moTa: "", hinhAnh: "", monChinh: false, doUong: false, trangMien: false
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await GetDanhSachThucDon();
      setDsMon(res?.danhSachBan ?? []);
    } catch (e: any) {
      Alert.alert("Lỗi", e?.message || "Không thể tải thực đơn.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // đếm theo nhóm
  const count = useMemo(() => {
    const all = dsMon.length;
    const monChinh = dsMon.filter(x => x.monChinh === true).length;
    const doUong = dsMon.filter(x => x.doUong === true).length;
    const trangMien = dsMon.filter(x => x.trangMien === true).length;
    return { all, monChinh, doUong, trangMien };
  }, [dsMon]);

  // danh sách sau lọc & search
  const filtered = useMemo(() => {
    let base = dsMon;
    if (activeTab === "monChinh") base = base.filter(x => x.monChinh === true);
    if (activeTab === "doUong") base = base.filter(x => x.doUong === true);
    if (activeTab === "trangMien") base = base.filter(x => x.trangMien === true);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      base = base.filter(x => x.tenMon.toLowerCase().includes(q));
    }
    // sort nhẹ: món chính trước, sau đó theo tên
    return base
      .slice()
      .sort((a, b) => Number(b.monChinh) - Number(a.monChinh) || a.tenMon.localeCompare(b.tenMon));
  }, [dsMon, activeTab, search]);

  // mở modal thêm
  const openAdd = () => {
    setIsEdit(false);
    setForm({ tenMon: "", gia: "", moTa: "", hinhAnh: "", monChinh: false, doUong: false, trangMien: false });
    setShowModal(true);
  };

  // mở modal sửa
  const openEdit = (item: ThucDonItem) => {
    setIsEdit(true);
    setForm({
      id: item.id,
      tenMon: item.tenMon,
      gia: String(item.gia ?? ""),
      moTa: (item as any)?.moTa ?? "",
      hinhAnh: item.hinhAnh ?? "",
      monChinh: !!item.monChinh,
      doUong: !!item.doUong,
      trangMien: !!item.trangMien
    });
    setShowModal(true);
  };

  // submit
  const onSubmit = async () => {
    if (!form.tenMon.trim()) return Alert.alert("Lỗi", "Vui lòng nhập tên món");
    const giaNum = Number(form.gia);
    if (isNaN(giaNum)) return Alert.alert("Lỗi", "Giá phải là số");

    const payload = {
      tenMon: form.tenMon.trim(),
      moTa: form.moTa?.trim() || null,
      gia: giaNum,
      hinhAnh: (form.hinhAnh?.trim() || "") || null,
      monChinh: !!form.monChinh,
      doUong: !!form.doUong,
      trangMien: !!form.trangMien,
    };

    try {
      setLoading(true);
      if (isEdit && form.id) {
        await thucDonCapNhat({ id: form.id, ...payload });
        Alert.alert("Thành công", "Đã cập nhật món.");
      } else {
        await thucDonThemMoi(payload);
        Alert.alert("Thành công", "Đã thêm món mới.");
      }
      setShowModal(false);
      await loadData();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || "Không thể lưu.");
    } finally {
      setLoading(false);
    }
  };

  // xoá
  const onDelete = (id: number) => {
    Alert.alert("Xóa món", "Bạn chắc chắn muốn xóa?", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            setLoading(true);
            await thucDonXoa(id);
            await loadData();
            Alert.alert("Thành công", "Đã xóa món.");
          } catch (e: any) {
            Alert.alert("Lỗi", e?.response?.data?.message || "Không thể xóa.");
          } finally {
            setLoading(false);
          }
        },
      },
    ]);
  };

  // item UI
  const renderItem = ({ item }: { item: ThucDonItem }) => (
    <View style={styles.card}>
      <View style={styles.cardLeft}>
        <View style={styles.foodIcon}>
          <Ionicons name="fast-food-outline" size={20} color={BLUE} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle} numberOfLines={1}>{item.tenMon}</Text>
          <Text style={styles.cardSub} numberOfLines={2}>{(item as any)?.moTa ?? ""}</Text>
          <View style={styles.tags}>
            {item.monChinh ? <Text style={styles.tagBlue}>Món chính</Text> : null}
            {item.doUong ? <Text style={styles.tagBlue}>Đồ uống</Text> : null}
            {item.trangMien ? <Text style={styles.tagBlue}>Tráng miệng</Text> : null}
          </View>
        </View>
      </View>
      <View style={styles.cardRight}>
        <Text style={styles.price}>{(item.gia ?? 0).toLocaleString()} đ</Text>
        <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
          <TouchableOpacity style={styles.editBtn} onPress={() => openEdit(item)}>
            <Ionicons name="create-outline" size={18} color="#fff" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.delBtn} onPress={() => onDelete(item.id)}>
            <Ionicons name="trash-outline" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Quản lý Thực đơn</Text>
        <TouchableOpacity style={styles.refresh} onPress={loadData} disabled={loading}>
          <Ionicons name="refresh" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Thanh công cụ: Tabs + Search + Thêm */}
      <View style={styles.toolbar}>
        {/* Tabs lọc */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8 }}
        >
          <TabChip
            label={`Tất cả (${count.all})`}
            active={activeTab === "all"}
            onPress={() => setActiveTab("all")}
          />
          <TabChip
            label={`Món chính (${count.monChinh})`}
            active={activeTab === "monChinh"}
            onPress={() => setActiveTab("monChinh")}
          />
          <TabChip
            label={`Đồ uống (${count.doUong})`}
            active={activeTab === "doUong"}
            onPress={() => setActiveTab("doUong")}
          />
          <TabChip
            label={`Tráng miệng (${count.trangMien})`}
            active={activeTab === "trangMien"}
            onPress={() => setActiveTab("trangMien")}
          />
        </ScrollView>

        {/* Search + Thêm */}
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search-outline" size={18} color={BLUE} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm món theo tên..."
              placeholderTextColor="#9DB3D9"
              value={search}
              onChangeText={setSearch}
            />
            {search ? (
              <TouchableOpacity onPress={() => setSearch("")}>
                <Ionicons name="close-circle" size={18} color="#9DB3D9" />
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
            <Ionicons name="add-circle-outline" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Thêm món</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Danh sách */}
      <FlatList
        data={filtered}
        keyExtractor={(it) => String(it.id)}
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 24 }}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>Không có dữ liệu</Text>}
        refreshing={loading}
        onRefresh={loadData}
      />

      {/* Modal add/edit */}
      <Modal visible={showModal} transparent animationType="fade">
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Cập nhật món" : "Thêm món mới"}</Text>

            <TextInput
              style={styles.input}
              placeholder="Tên món"
              value={form.tenMon}
              onChangeText={(v) => setForm((s) => ({ ...s, tenMon: v }))}
            />
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Mô tả"
              value={form.moTa}
              onChangeText={(v) => setForm((s) => ({ ...s, moTa: v }))}
              multiline
            />
            <TextInput
              style={styles.input}
              placeholder="Giá (số)"
              keyboardType="numeric"
              value={form.gia}
              onChangeText={(v) => setForm((s) => ({ ...s, gia: v }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Link ảnh (tuỳ chọn)"
              value={form.hinhAnh}
              onChangeText={(v) => setForm((s) => ({ ...s, hinhAnh: v }))}
            />

            <View style={styles.checkRow}>
              <CheckBox
                label="Món chính"
                checked={!!form.monChinh}
                onToggle={() => setForm((s) => ({ ...s, monChinh: !s.monChinh }))}
              />
              <CheckBox
                label="Đồ uống"
                checked={!!form.doUong}
                onToggle={() => setForm((s) => ({ ...s, doUong: !s.doUong }))}
              />
              <CheckBox
                label="Tráng miệng"
                checked={!!form.trangMien}
                onToggle={() => setForm((s) => ({ ...s, trangMien: !s.trangMien }))}
              />
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowModal(false)}>
                <Text style={styles.cancelText}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
                <Text style={styles.saveText}>{isEdit ? "Lưu" : "Thêm"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

/* ===== Components nhỏ ===== */
function TabChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[styles.tabChip, active && styles.tabChipActive]}
    >
      <Text style={[styles.tabChipText, active && styles.tabChipTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function CheckBox({ label, checked, onToggle }: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <TouchableOpacity onPress={onToggle} style={styles.cb}>
      <Ionicons name={checked ? "checkbox" : "square-outline"} size={20} color={BLUE_DARK} />
      <Text style={styles.cbLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

/* ===== Styles ===== */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  header: {
    backgroundColor: BLUE,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerTitle: { flex: 1, textAlign: "center", color: "#fff", fontSize: 18, fontWeight: "700" },
  refresh: { padding: 6, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 10 },

  toolbar: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 8, gap: 10 },

  // Tabs / chips
  tabChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E8F0FF",
    borderWidth: 1,
    borderColor: "#E0E8FF",
  },
  tabChipActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  tabChipText: { color: "#355581", fontWeight: "700", fontSize: 12 },
  tabChipTextActive: { color: "#fff" },

  // search + add
  searchRow: { flexDirection: "row", gap: 10, alignItems: "center" },
  searchBox: {
    flex: 1,
    backgroundColor: "#F0F5FF",
    borderWidth: 1,
    borderColor: "#E0E8FF",
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, color: "#1E293B", fontSize: 14 },

  addBtn: {
    height: 44,
    paddingHorizontal: 14,
    backgroundColor: BLUE_DARK,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  addBtnText: { color: "#fff", fontWeight: "700" },

  // list item card
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1, borderColor: "#EEF3FF",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  cardLeft: { flexDirection: "row", gap: 10, flex: 1 },
  foodIcon: {
    width: 40, height: 40, borderRadius: 10,
    backgroundColor: "#E8F0FF",
    alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: "#E0E8FF",
  },
  cardTitle: { fontWeight: "700", color: "#1A1A1A", fontSize: 15 },
  cardSub: { color: "#6B7280", fontSize: 12, marginTop: 2 },
  tags: { flexDirection: "row", gap: 8, marginTop: 8, flexWrap: "wrap" },
  tagBlue: {
    backgroundColor: "#E8F0FF", color: BLUE_DARK,
    paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, fontWeight: "700", fontSize: 12,
  },

  cardRight: { alignItems: "flex-end", justifyContent: "space-between" },
  price: { fontWeight: "800", color: BLUE_DARK, fontSize: 14 },

  editBtn: { backgroundColor: "#0288D1", padding: 10, borderRadius: 10 },
  delBtn: { backgroundColor: "#E53935", padding: 10, borderRadius: 10 },

  // modal
  modalBackdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", alignItems: "center", padding: 18 },
  modalCard: { backgroundColor: "#fff", borderRadius: 14, width: "100%", maxWidth: 460, padding: 16 },
  modalTitle: { fontWeight: "700", color: "#1A1A1A", fontSize: 16, marginBottom: 12 },
  input: {
    backgroundColor: "#F0F5FF",
    borderWidth: 1,
    borderColor: "#E0E8FF",
    borderRadius: 10,
    paddingHorizontal: 12, height: 44, color: "#333",
    marginBottom: 10,
  },
  inputMultiline: { height: 86, textAlignVertical: "top", paddingTop: 10 },

  checkRow: { flexDirection: "row", gap: 16, marginVertical: 2 },
  cb: { flexDirection: "row", alignItems: "center", gap: 6 },
  cbLabel: { color: "#1A1A1A" },

  modalActions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginTop: 8 },
  cancelBtn: { backgroundColor: "#F8FAFC", borderWidth: 1, borderColor: "#E2E8F0", paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  cancelText: { color: "#1E293B", fontWeight: "600" },
  saveBtn: { backgroundColor: BLUE_DARK, paddingVertical: 10, paddingHorizontal: 16, borderRadius: 10 },
  saveText: { color: "#fff", fontWeight: "700" },

  empty: { textAlign: "center", color: "#94A3B8", marginTop: 24, fontSize: 14 },
});
