import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import C from "../../theme/colors";
import { xoaBanAn } from "../../../services/adminService";

export default function XoaBanAnScreen(){
  const [id, setId] = useState("");

  const onDelete = async () => {
    try{
      await xoaBanAn(Number(id));
      Alert.alert("Thành công", `Đã xoá bàn #${id}`); setId("");
    }catch(e:any){ Alert.alert("Lỗi", e?.response?.data?.message || "Không xoá được bàn"); }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Xoá bàn ăn</Text>
      <View style={styles.inputWrap}>
        <TextInput placeholder="ID bàn" placeholderTextColor={C.textMuted}
          value={id} onChangeText={setId} keyboardType="number-pad" style={styles.input}/>
      </View>

      <TouchableOpacity style={styles.btnDanger} onPress={onDelete} activeOpacity={0.9}>
        <Ionicons name="trash-outline" size={18} color={C.white} />
        <Text style={styles.btnDangerText}>Xoá</Text>
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
  btnDanger:{
    marginTop:6, backgroundColor:C.danger, borderRadius:12, paddingVertical:14,
    alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8
  },
  btnDangerText:{ color:C.white, fontWeight:"700" }
});
