import React, { useState } from "react"
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { LoginHandle, saveTaiKhoanId } from "../../services"
import { useAuth } from "../context/AuthContext"

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { loginWithId } = useAuth()

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ email và mật khẩu")
      return
    }

    try {
      const resp = await LoginHandle(email, password)
      if (resp.success && resp.idTaiKhoan) {
        await saveTaiKhoanId(resp.idTaiKhoan)
        loginWithId(resp.idTaiKhoan, email)
        // Không cần replace; RootNavigator sẽ tự switch sang Main theo isLoggedIn
      } else {
        Alert.alert("Lỗi", resp.message || "Đăng nhập thất bại")
      }
    } catch (error: any) {
      Alert.alert("Lỗi", error?.message || "Có lỗi xảy ra khi đăng nhập")
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.header}>
          <Ionicons name="restaurant" size={80} color="#1976D2" />
          <Text style={styles.title}>Chào mừng bạn trở lại!</Text>
          <Text style={styles.subtitle}>Đăng nhập để tiếp tục</Text>
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

          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={22} color="#666" />
            <TextInput
              style={styles.input}
              placeholder="Mật khẩu"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>

          <TouchableOpacity style={{ alignItems: "center", marginTop: 12 }} onPress={() => navigation.navigate("QuenMatKhau") }>
            <Text style={{ color: "#1976D2", fontSize: 14, fontWeight: "600" }}>Quên mật khẩu?</Text>
          </TouchableOpacity>

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={styles.registerLink}>Đăng ký</Text>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  keyboardView: {
    flex: 1,
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 8,
  },
  form: {
    paddingHorizontal: 30,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    height: 55,
  },
  input: {
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
    flex: 1,
  },
  loginButton: {
    backgroundColor: "#1976D2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  registerText: {
    fontSize: 16,
    color: "#666",
  },
  registerLink: {
    fontSize: 16,
    color: "#1976D2",
    fontWeight: "600",
  },
})

