import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { GuiMaOTP } from "../../services/taiKhoanService"

export default function GuiOTPScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSend = async () => {
    if (!email) {
      Alert.alert("Lỗi", "Vui lòng nhập email")
      return
    }
    try {
      setLoading(true)
      const res = await GuiMaOTP(email)
      Alert.alert("Thông báo", res.message || "Đã gửi OTP")
      navigation.navigate("CheckOTP", { email })
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || e?.message || "Gửi OTP thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="mail" size={64} color="#1976D2" />
        <Text style={styles.title}>Gửi mã OTP</Text>
        <Text style={styles.subtitle}>Nhập email để nhận mã xác thực</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Ionicons name="mail-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleSend} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Đang gửi..." : "Gửi OTP"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.linkText}>Quay lại đăng nhập</Text>
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


