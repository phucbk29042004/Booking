import { View, Text, StyleSheet, ScrollView, TextInput, Image, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Ionicons } from "@expo/vector-icons"

const categories = [
  { id: "1", title: "Tráng miệng", image: "https://picsum.photos/100" },
  { id: "2", title: "Món chính", image: "https://picsum.photos/101" },
  { id: "3", title: "Đồ uống", image: "https://picsum.photos/102" },
]


export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.headerContainer}>
          <View style={styles.searchContainer}>
            <Ionicons name="search-outline" size={20} color="#0066CC" />
            <TextInput style={styles.searchInput} placeholder="Tìm kiếm món ăn..." placeholderTextColor="#B0B0B0" />
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate("Personal", { screen: "Notifications" })}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#0066CC" />
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Banner full width */}
        <View style={styles.banner}>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
            }}
            style={styles.bannerImage}
          />
          <View style={styles.bannerOverlay} />
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerTitle}>Đặt Bàn Siêu Tốc</Text>
            <Text style={styles.bannerSubtitle}>Bàn ăn dưới tay bạn!</Text>
          </View>
        </View>

        {/* Danh mục */}
        <Text style={styles.sectionTitle}>Menu</Text>
        <View style={styles.menuRow}>
          {categories.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                // Map category titles to menu tabs
                const tabMap: { [key: string]: string } = {
                  "Tráng miệng": "trangMien",
                  "Món chính": "monChinh",
                  "Đồ uống": "doUong",
                }
                const tab = tabMap[item.title] || "monChinh"
                navigation.navigate("Menu", { initialTab: tab })
              }}
            >
              <View style={styles.categoryImageContainer}>
                <Image source={{ uri: item.image }} style={styles.categoryImage} />
              </View>
              <Text style={styles.menuText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 16,
    marginBottom: 20,
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F5FF",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: "#E0E8FF",
  },
  searchInput: {
    marginLeft: 10,
    fontSize: 15,
    color: "#333333",
    flex: 1,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#F0F5FF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E8FF",
    position: "relative",
  },
  notificationBadge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF4444",
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "bold",
  },
  banner: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: "hidden",
    position: "relative",
  },
  bannerImage: {
    width: "100%",
    height: 180,
    resizeMode: "cover",
  },
  bannerOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
  bannerTextBox: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  bannerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#F0F0F0",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0066CC",
    marginTop: 20,
    marginBottom: 12,
  },
  menuRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  menuItem: {
    alignItems: "center",
    width: "47%",
    backgroundColor: "#F8FAFF",
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E8EFFF",
  },
  categoryImageContainer: {
    width: 70,
    height: 70,
    borderRadius: 10,
    backgroundColor: "#E8EFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  menuText: {
    fontSize: 13,
    color: "#333333",
    fontWeight: "500",
  },
})
