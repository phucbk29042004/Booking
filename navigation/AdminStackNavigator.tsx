import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

import AdminHomeScreen from '../scr/screens/admin/AdminHomeScreen';
import DoanhThuNgayScreen from '../scr/screens/admin/DoanhThuNgayScreen';
import DoanhThuThangScreen from '../scr/screens/admin/DoanhThuThangScreen';
import DoanhThuNamScreen from '../scr/screens/admin/DoanhThuNamScreen';
import DoanhThuThongKeChungScreen from '../scr/screens/admin/DoanhThuThongKeChungScreen';
import TaoBanAnScreen from '../scr/screens/admin/TaoBanAnScreen';
import XoaBanAnScreen from '../scr/screens/admin/HuyTrangThaiBanAnScreen';
import ThucDonScreen from "../scr/screens/admin/ThucDonScreen";


const Stack = createStackNavigator();

export default function AdminStackNavigator() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="AdminHome" component={AdminHomeScreen} options={{ title: 'Admin' }} />
      <Stack.Screen name="TaoBanAn" component={TaoBanAnScreen} options={{ title: 'Tạo bàn' }} />
      <Stack.Screen name="XoaBanAn" component={XoaBanAnScreen} options={{ title: 'Xoá bàn' }} />
      <Stack.Screen name="ThucDon" component={ThucDonScreen} options={{ title: "Quản lý Thực đơn" }} />
      <Stack.Screen name="DTNgay" component={DoanhThuNgayScreen} options={{ title: 'DT ngày' }} />
      <Stack.Screen name="DTThang" component={DoanhThuThangScreen} options={{ title: 'DT tháng' }} />
      <Stack.Screen name="DTNam" component={DoanhThuNamScreen} options={{ title: 'DT năm' }} />
      <Stack.Screen name="DTThongKe" component={DoanhThuThongKeChungScreen} options={{ title: 'Tổng quan' }} />
    </Stack.Navigator>
  );
}
