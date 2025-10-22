import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { CheckOTP } from "../../services/taiKhoanService"

export default function CheckOTPScreen({ navigation, route }: any) {
  const presetEmail = route?.params?.email || ""
  const [email] = useState(presetEmail)
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)

  const handleVerify = async () => {
    if (!email || !otp) {
      Alert.alert("Lỗi", "Vui lòng nhập email và mã OTP")
      return
    }
    try {
      setLoading(true)
      const res = await CheckOTP(email, otp)
      Alert.alert("Thành công", res.message || "Xác thực thành công", [
        { text: "Đổi mật khẩu", onPress: () => navigation.navigate("DoiMatKhau", { email }) },
      ])
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || e?.message || "Xác thực thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="key" size={64} color="#1976D2" />
        <Text style={styles.title}>Xác thực OTP</Text>
        <Text style={styles.subtitle}>Nhập email và mã OTP đã nhận</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#666" />
          <TextInput
            style={[styles.input, { color: "#64748B" }]}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            editable={false}
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Mã OTP"
            placeholderTextColor="#999"
            value={otp}
            onChangeText={setOtp}
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Đang xác thực..." : "Xác thực"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate("GuiOTP") }>
          <Text style={styles.linkText}>Chưa có OTP? Gửi lại</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 24 },
  header: { alignItems: "center", marginTop: 40, marginBottom: 30 },
  title: { fontSize: 24, fontWeight: "700", color: "#1E293B", marginTop: 12 },
  subtitle: { fontSize: 14, color: "#64748B", marginTop: 6 },
  form: {},
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 54,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  input: { marginLeft: 10, fontSize: 16, color: "#1E293B", flex: 1 },
  button: {
    backgroundColor: "#1976D2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  linkBtn: { alignItems: "center", marginTop: 14 },
  linkText: { color: "#1976D2", fontSize: 14, fontWeight: "600" },
})


