import React, { useState } from "react"
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"
import { DoiMatKhau } from "../../services/taiKhoanService"
import { saveTaiKhoanId } from "../../services/storage"

export default function DoiMatKhauScreen({ navigation, route }: any) {
  const [email, setEmail] = useState(route?.params?.email || "")
  const [matKhauMoi, setMatKhauMoi] = useState("")
  const [xacNhan, setXacNhan] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = async () => {
    if (!email || !matKhauMoi || !xacNhan) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ thông tin")
      return
    }
    if (matKhauMoi !== xacNhan) {
      Alert.alert("Lỗi", "Mật khẩu xác nhận không khớp")
      return
    }
    try {
      setLoading(true)
      const res = await DoiMatKhau(email, matKhauMoi)
      
      // Lưu idTaiKhoan vào AsyncStorage
      await saveTaiKhoanId(res.idTaiKhoan)
      
      // Navigate đến HomeScreen
      navigation.navigate("Home")
    } catch (e: any) {
      Alert.alert("Lỗi", e?.response?.data?.message || e?.message || "Đổi mật khẩu thất bại")
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="shield-checkmark" size={64} color="#1976D2" />
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <Text style={styles.subtitle}>Nhập email và mật khẩu mới</Text>
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
            placeholder="Mật khẩu mới"
            placeholderTextColor="#999"
            value={matKhauMoi}
            onChangeText={setMatKhauMoi}
            secureTextEntry
          />
        </View>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={22} color="#666" />
          <TextInput
            style={styles.input}
            placeholder="Xác nhận mật khẩu"
            placeholderTextColor="#999"
            value={xacNhan}
            onChangeText={setXacNhan}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleChange} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Đang đổi..." : "Đổi mật khẩu"}</Text>
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
})


