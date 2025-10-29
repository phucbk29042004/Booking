import api from './api';

export type CapNhatThongTinRequest = {
  Id: number;
  Email?: string;
  HoTen?: string;
  SoDienThoai?: string;
  HinhAnh?: string;
  TrangThai?: number;
  LoaiTaiKhoanId?: number;
};

export type CapNhatThongTinResponse = {
  message: string;
  user: any;
};

export const capNhatThongTin = (payload: CapNhatThongTinRequest) =>
  api.post<CapNhatThongTinResponse>('/api/TaiKhoan/CapNhatThongTin', payload);
