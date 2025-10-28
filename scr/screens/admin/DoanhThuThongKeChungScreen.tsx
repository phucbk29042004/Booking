import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import { PieChart } from "react-native-chart-kit";
import { Ionicons } from "@expo/vector-icons";
import { doanhThuThongKeChung } from "../../../services/adminService";
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
const palette = ["#0066CC", "#22C55E", "#F59E0B", "#EC4899", "#8B5CF6", "#0EA5E9"];

export default function DoanhThuThongKeChungScreen(){
  const [data, setData] = useState<any>(null);

  const onLoad = async () => {
    const res = await doanhThuThongKeChung();
    setData(res.data);
  };

  const mapToPie = () => {
    const arr = data?.thongKePhuongThuc || [];
    return arr.map((x:any, i:number) => ({
      name: x.phuongThuc || "Khác",
      population: x.tongTien || 0,
      color: palette[i % palette.length],
      legendFontColor: Colors.text,
      legendFontSize: 12,
    }));
  };

  const Row = ({label, value}:{label:string; value:any}) => (
    <View style={s.row}><Text style={s.rowLabel}>{label}</Text><Text style={s.rowValue}>{String(value)}</Text></View>
  );

  return (
    <ScrollView style={s.container} contentContainerStyle={{ paddingBottom: 16 }}>
      <Text style={s.title}>Tổng quan doanh thu</Text>

      <TouchableOpacity style={s.btnPrimary} onPress={onLoad} activeOpacity={0.9}>
        <Ionicons name="cloud-download-outline" size={18} color={Colors.white} />
        <Text style={s.btnPrimaryText}>Tải số liệu</Text>
      </TouchableOpacity>

      {data && (
        <>
          <View style={s.card}>
            <Text style={s.cardTitle}>Tổng quát</Text>
            <Row label="Tổng doanh thu" value={data.tongQuat.tongDoanhThuTatCa}/>
            <Row label="Tổng hoàn" value={data.tongQuat.tongHoanTienTatCa}/>
            <Row label="Thực thu" value={data.tongQuat.doanhThuThucTeTatCa}/>
            <Row label="Tổng số đơn" value={data.tongQuat.tongSoDon}/>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Cơ cấu theo phương thức thanh toán</Text>
            <PieChart
              data={mapToPie()}
              width={screenWidth - 32}
              height={220}
              accessor="population"
              chartConfig={chartConfig}
              backgroundColor="transparent"
              paddingLeft="0"
              hasLegend
              center={[0, 0]}
              style={{ marginTop: 8 }}
            />
          </View>
        </>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:{ flex:1, backgroundColor: Colors.white, padding:16 },
  title:{ fontSize:18, fontWeight:"700", color: Colors.primary, marginBottom:12 },
  btnPrimary:{ marginTop:6, backgroundColor: Colors.primary, borderRadius:12, paddingVertical:14, alignItems:"center", flexDirection:"row", justifyContent:"center", gap:8 },
  btnPrimaryText:{ color: Colors.white, fontWeight:"700" },
  card:{ marginTop:14, backgroundColor: Colors.surface, borderWidth:1, borderColor: Colors.border, borderRadius:14, padding:12 },
  cardTitle:{ fontSize:16, fontWeight:"700", color: Colors.primary, marginBottom:6 },
  row:{ flexDirection:"row", justifyContent:"space-between", paddingVertical:8, borderBottomWidth:1, borderColor:"#F1F5FE" },
  rowLabel:{ color: Colors.textMuted },
  rowValue:{ color: Colors.text, fontWeight:"700" },
});
