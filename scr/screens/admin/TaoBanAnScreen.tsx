import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import C from "../../theme/colors";
import { taoBanAn } from "../../../services/adminService";

export default function TaoBanAnScreen(){
  const [tenBan, setTenBan] = useState("");
  const [soChoNgoi, setSoChoNgoi] = useState("4");
  const [idTang, setIdTang] = useState("");

  const onSubmit = async () => {
    try {
      await taoBanAn({ tenBan, soChoNgoi: Number(soChoNgoi), idTang: idTang ? Number(idTang) : undefined });
      Alert.alert("Thành công", "Đã tạo bàn ăn");
      setTenBan(""); setSoChoNgoi("4"); setIdTang("");
    } catch(e:any){ Alert.alert("Lỗi", e?.response?.data?.message || "Không tạo được bàn"); }
  };

  const Input = (p:any)=>(
    <View style={styles.inputWrap}>
      <TextInput placeholderTextColor={C.textMuted} {...p} style={styles.input}/>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tạo bàn ăn</Text>
      <Input placeholder="Tên bàn" value={tenBan} onChangeText={setTenBan} />
      <Input placeholder="Số chỗ ngồi" value={soChoNgoi} onChangeText={setSoChoNgoi} keyboardType="number-pad" />
      <Input placeholder="ID tầng (tuỳ chọn)" value={idTang} onChangeText={setIdTang} keyboardType="number-pad" />

      <TouchableOpacity style={styles.btnPrimary} onPress={onSubmit} activeOpacity={0.9}>
        <Ionicons name="save-outline" size={18} color={C.white} />
        <Text style={styles.btnPrimaryText}>Tạo</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container:{ flex:1, backgroundColor:C.white, padding:16 },
  title:{ fontSize:18, fontWeight:"700", color:C.primary, marginBottom:12 },
  inputWrap:{
    backgroundColor:C.primarySoft, borderRadius:12, marginBottom:10,
    borderWidth:1, borderColor:C.border, paddingHorizontal:12, paddingVertical:10
  },
  input:{ color:C.text, fontSize:15 },
  btnPrimary:{
    marginTop:6, backgroundColor:C.primary, borderRadius:12, paddingVertical:14,
    alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8
  },
  btnPrimaryText:{ color:C.white, fontWeight:"700" }
});
