import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_TAI_KHOAN_ID = 'taiKhoanId';

export async function saveTaiKhoanId(taiKhoanId: number): Promise<void> {
  try {
    await AsyncStorage.setItem(KEY_TAI_KHOAN_ID, String(taiKhoanId));
  } catch (error) {
    console.error('Lỗi khi lưu taiKhoanId:', error);
    throw error;
  }
}

export async function getTaiKhoanId(): Promise<number | null> {
  try {
    const value = await AsyncStorage.getItem(KEY_TAI_KHOAN_ID);
    if (value === null) return null;
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  } catch (error) {
    console.error('Lỗi khi lấy taiKhoanId:', error);
    throw error;
  }
}

export async function removeTaiKhoanId(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY_TAI_KHOAN_ID);
  } catch (error) {
    console.error('Lỗi khi xóa taiKhoanId:', error);
    throw error;
  }
}

export const storageKeys = {
  taiKhoanId: KEY_TAI_KHOAN_ID,
};


