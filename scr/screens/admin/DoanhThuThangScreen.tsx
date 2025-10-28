import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { LineChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { doanhThuTheoThang } from "../../../services/adminService";
import Colors from "../../theme/colors";

const screenWidth = Dimensions.get("window").width;
const chartConfig = {
  backgroundColor: Colors.surface,
  backgroundGradientFrom: Colors.primarySoft,
  backgroundGradientTo: Colors.primarySoft,
  decimalPlaces: 0,
  color: (o = 1) => `rgba(0, 102, 204, ${o})`,
  labelColor: (o = 1) => `rgba(51, 51, 51, ${o})`,
  propsForBackgroundLines: { stroke: Colors.border },
};

export default function DoanhThuThangScreen(){
  const now = new Date();
  const [thang, setThang] = useState(String(now.getMonth()+1));
  const [nam, setNam] = useState(String(now.getFullYear()));
  const [data, setData] = useState<any>(null);

  const onLoad = async () => {
    const res = await doanhThuTheoThang(Number(thang), Number(nam));
    setData(res.data);
  };

  const mapToLine = () => {
    const items = data?.chiTietTheoNgay || [];
    const labels = items.map((x:any) => (x.ngay || "").slice(0,5));
    const values = items.map((x:any) => x.doanhThuThucTe || 0);
    return { labels, datasets: [{ data: values }] };
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 16 }}>
      <Text style={s.title}>Doanh thu theo tháng</Text>
      <View style={{ flexDirection:"row", gap:10 }}>
        <View style={s.inputWrap}><TextInput placeholder="Tháng" placeholderTextColor={Colors.textMuted} value={thang} onChangeText={setThang} keyboardType="number-pad" style={s.input}/></View>
        <View style={s.inputWrap}><TextInput placeholder="Năm" placeholderTextColor={Colors.textMuted} value={nam} onChangeText={setNam} keyboardType="number-pad" style={s.input}/></View>
      </View>

      <TouchableOpacity style={s.btnPrimary} onPress={onLoad} activeOpacity={0.9}>
        <Ionicons name="cloud-download-outline" size={18} color={Colors.white} />
        <Text style={s.btnPrimaryText}>Tải dữ liệu</Text>
      </TouchableOpacity>

      {data && (
        <>
          <View style={s.card}>
            <Row label="Tổng" value={data.tongDoanhThu}/>
            <Row label="Hoàn" value={data.tongHoanTien}/>
            <Row label="Thực thu" value={data.doanhThuThucTe}/>
            <Row label="Số đơn" value={data.soDon}/>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Thực thu theo ngày</Text>
            <LineChart
              data={mapToLine()}
              width={screenWidth - 32}
              height={240}
              chartConfig={chartConfig}
              bezier
              fromZero
              style={{ borderRadius: 12, marginTop: 8 }}
              yAxisSuffix="đ"
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const Row = ({label, value}:{label:string; value:any}) => (
  <View style={s.row}><Text style={s.rowLabel}>{label}</Text><Text style={s.rowValue}>{String(value)}</Text></View>
);

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor: Colors.white, padding:16 },
  title:{ fontSize:18, fontWeight:"700", color: Colors.primary, marginBottom:12 },
  inputWrap:{ flex:1, backgroundColor: Colors.primarySoft, borderRadius:12, borderWidth:1, borderColor: Colors.border, paddingHorizontal:12, paddingVertical:10 },
  input:{ color: Colors.text, fontSize:15 },
  btnPrimary:{ marginTop:10, backgroundColor: Colors.primary, borderRadius:12, paddingVertical:14, alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8 },
  btnPrimaryText:{ color: Colors.white, fontWeight:"700" },
  card:{ marginTop:14, backgroundColor: Colors.surface, borderWidth:1, borderColor: Colors.border, borderRadius:14, padding:12 },
  cardTitle:{ fontSize:16, fontWeight:"700", color: Colors.primary },
  row:{ flexDirection:"row", justifyContent:"space-between", paddingVertical:8, borderBottomWidth:1, borderColor:"#F1F5FE" },
  rowLabel:{ color: Colors.textMuted },
  rowValue:{ color: Colors.text, fontWeight:"700" },
});
