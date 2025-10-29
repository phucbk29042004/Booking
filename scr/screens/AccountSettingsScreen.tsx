import React, { useMemo, useState } from "react";
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ScrollView, ActivityIndicator, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { capNhatThongTin } from "../../services/accountService";

const C = {
  primary: "#0066CC",
  primarySoft: "#F0F5FF",
  border: "#E0E8FF",
  surface: "#F8FAFF",
  text: "#333333",
  textMuted: "#8AA0D0",
  white: "#FFFFFF",
};

export default function AccountSettingsScreen({ navigation }: any) {
  const { user, setUser } = useAuth() as any;

  const initial = useMemo(() => ({
    Id: user?.id || user?.Id || 0,
    HoTen: user?.name || user?.HoTen || "",
    Email: user?.email || user?.Email || "",
    SoDienThoai: user?.phone || user?.SoDienThoai || "",
    HinhAnh: user?.avatar || user?.HinhAnh || "",
  }), [user]);

  const [form, setForm] = useState(initial);
  const [loading, setLoading] = useState(false);

  const onChange = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const validate = () => {
    if (!form.Id || form.Id <= 0) { Alert.alert("Lỗi", "Thiếu ID tài khoản."); return false; }
    if (!form.Email?.trim()) { Alert.alert("Lỗi", "Email không được để trống."); return false; }
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(form.Email)) { Alert.alert("Lỗi", "Email không hợp lệ."); return false; }
    return true;
  };

  const onSave = async () => {
    if (!validate()) return;
    try {
      setLoading(true);
      const res = await capNhatThongTin({
        Id: form.Id,
        Email: form.Email?.trim(),
        HoTen: form.HoTen?.trim(),
        SoDienThoai: form.SoDienThoai?.trim(),
        HinhAnh: form.HinhAnh?.trim(),
      });
      if (setUser) {
        setUser({
          ...user,
          id: res.data.user.id ?? res.data.user.Id,
          name: res.data.user.hoTen ?? res.data.user.HoTen,
          email: res.data.user.email ?? res.data.user.Email,
          phone: res.data.user.soDienThoai ?? res.data.user.SoDienThoai,
          avatar: res.data.user.hinhAnh ?? res.data.user.HinhAnh,
        });
      }
      Alert.alert("Thành công", res.data.message || "Đã cập nhật thông tin.");
      navigation.goBack();
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || "Cập nhật thất bại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={s.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        {/* Header */}
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={20} color={C.primary}/>
          </TouchableOpacity>
          <Text style={s.headerTitle}>Cài đặt tài khoản</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Avatar */}
        <View style={s.profileCard}>
          <View style={s.avatarWrap}>
            {form.HinhAnh ? (
              <Image source={{ uri: form.HinhAnh }} style={s.avatarImg}/>
            ) : (
              <Ionicons name="person" size={44} color={C.primary} />
            )}
          </View>
          <Text style={s.hint}>Dán link ảnh vào trường “Ảnh đại diện” bên dưới</Text>
        </View>

        {/* Form */}
        <View style={s.card}>
          <Label text="Họ và tên"/>
          <Input value={form.HoTen} onChangeText={(v:string)=>onChange("HoTen", v)} placeholder="Nguyễn Văn A" />

          <Label text="Email"/>
          <Input value={form.Email} onChangeText={(v:string)=>onChange("Email", v)} placeholder="email@domain.com" keyboardType="email-address" autoCapitalize="none" />

          <Label text="Số điện thoại"/>
          <Input value={form.SoDienThoai} onChangeText={(v:string)=>onChange("SoDienThoai", v)} placeholder="098xxxxxxx" keyboardType="phone-pad" />

          <Label text="Ảnh đại diện (URL)"/>
          <Input value={form.HinhAnh} onChangeText={(v:string)=>onChange("HinhAnh", v)} placeholder="https://..." autoCapitalize="none" />
        </View>

        {/* Save */}
        <TouchableOpacity style={[s.btnPrimary, loading && { opacity: 0.7 }]} onPress={onSave} activeOpacity={0.9} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={C.white}/>
          ) : (
            <>
              <Ionicons name="save-outline" size={18} color={C.white} />
              <Text style={s.btnPrimaryText}>Lưu thay đổi</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const Label = ({ text }: { text: string }) => <Text style={s.label}>{text}</Text>;

const Input = (props: any) => (
  <View style={s.inputWrap}>
    <TextInput {...props} placeholderTextColor={C.textMuted} style={s.input}/>
  </View>
);

const s = StyleSheet.create({
  container: { flex:1, backgroundColor: C.white },
  header: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 16, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  backBtn: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center", backgroundColor: C.primarySoft, borderWidth: 1, borderColor: C.border },
  headerTitle: { fontSize: 20, fontWeight: "800", color: C.primary },

  profileCard: { alignItems: "center", paddingVertical: 18, marginHorizontal: 16, marginBottom: 16, backgroundColor: C.primarySoft, borderRadius: 16, borderWidth: 1, borderColor: C.border },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, backgroundColor: C.white, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: C.primary },
  avatarImg: { width: "100%", height: "100%", borderRadius: 45 },
  hint: { marginTop: 8, color: C.textMuted, fontSize: 12 },

  card: { marginHorizontal: 16, backgroundColor: C.surface, borderRadius: 14, borderWidth: 1, borderColor: C.border, padding: 12 },
  label: { color: C.text, fontWeight: "700", marginTop: 8, marginBottom: 6 },
  inputWrap: { backgroundColor: C.primarySoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10, borderWidth: 1, borderColor: C.border },
  input: { color: C.text, fontSize: 15 },

  btnPrimary: { marginHorizontal: 16, marginTop: 16, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center", flexDirection: "row", gap: 8, justifyContent: "center" },
  btnPrimaryText: { color: C.white, fontWeight: "800" },
});
