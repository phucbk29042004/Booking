import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import C from "../../theme/colors";

export default function AdminHomeScreen({ navigation }: any) {
  const Item = ({ title, icon, to }:{title:string; icon:any; to:string}) => (
    <TouchableOpacity style={styles.item} onPress={() => navigation.navigate(to)} activeOpacity={0.9}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={C.primary} />
      </View>
      <Text style={styles.itemText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color={C.textMuted} />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bảng điều khiển Admin</Text>
      <View style={styles.card}>
        <Item title="Tạo bàn ăn" icon="add" to="TaoBanAn" />
        <Item title="Xoá bàn ăn" icon="trash-outline" to="XoaBanAn" />
      </View>

      <Text style={[styles.title, { marginTop: 16 }]}>Doanh thu</Text>
      <View style={styles.card}>
        <Item title="Theo ngày" icon="calendar-outline" to="DTNgay" />
        <Item title="Theo tháng" icon="calendar-number-outline" to="DTThang" />
        <Item title="Theo năm" icon="calendar-sharp" to="DTNam" />
        <Item title="Tổng quan" icon="stats-chart-outline" to="DTThongKe" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:C.white, padding:16 },
  title:{ fontSize:18, fontWeight:"700", color:C.primary, marginBottom:12 },
  card:{
    backgroundColor:C.surface, borderRadius:14, padding:8,
    borderWidth:1, borderColor:C.border
  },
  item:{
    flexDirection:"row", alignItems:"center", gap:10,
    paddingVertical:12, paddingHorizontal:8,
    borderBottomWidth:1, borderColor:"#F1F5FE"
  },
  iconWrap:{
    width:30, height:30, borderRadius:8,
    backgroundColor:C.primarySoft, alignItems:"center", justifyContent:"center",
    borderWidth:1, borderColor:C.border
  },
  itemText:{ flex:1, color:C.text, fontWeight:"600" }
});
