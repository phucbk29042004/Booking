import api from './api';

// ---- Bàn ăn ----
export const taoBanAn = (payload: { tenBan: string; soChoNgoi: number; idTang?: number }) =>
  api.post('/api/BanAn/TaoBanAn', payload);

// BE của bạn đang để POST /api/BanAn/XoaBanAn/{id}
export const xoaBanAn = (id: number) =>
  api.post(`/api/BanAn/XoaBanAn/${id}`);

// ---- Doanh thu ----
// Theo controller: TheoNgay nhận query "ngay" dạng dd-MM-yyyy
export const doanhThuTheoNgay = (ngay: string) =>
  api.get('/api/DoanhThu/TheoNgay', { params: { ngay } });

// TheoThang nhận "thang" (1..12) và "nam"
export const doanhThuTheoThang = (thang: number, nam: number) =>
  api.get('/api/DoanhThu/TheoThang', { params: { thang, nam } });

// TheoNam nhận "nam"
export const doanhThuTheoNam = (nam: number) =>
  api.get('/api/DoanhThu/TheoNam', { params: { nam } });

export const doanhThuThongKeChung = () =>
  api.get('/api/DoanhThu/ThongKeChung');
