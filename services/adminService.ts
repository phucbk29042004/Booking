// services/quanTriService.ts
import api from "./api";

/* ========== BÀN ĂN ========== */

// Tạo bàn
export const taoBanAn = (payload: { tenBan: string; soChoNgoi: number; idTang?: number }) =>
  api.post("/api/BanAn/TaoBanAn", payload);

// Hủy trạng thái bàn (thay cho XoaBanAn)
// BE: POST /api/BanAn/HuyTrangThaiBanAn  (giả định nhận body { id })
export const huyTrangThaiBanAn = (id: number) =>
  api.post("/api/BanAn/HuyTrangThaiBanAn", { id });

/* ========== DOANH THU (giữ nguyên) ========== */
export const doanhThuTheoNgay = (ngay: string) =>
  api.get("/api/DoanhThu/TheoNgay", { params: { ngay } });

export const doanhThuTheoThang = (thang: number, nam: number) =>
  api.get("/api/DoanhThu/TheoThang", { params: { thang, nam } });

export const doanhThuTheoNam = (nam: number) =>
  api.get("/api/DoanhThu/TheoNam", { params: { nam } });

export const doanhThuThongKeChung = () =>
  api.get("/api/DoanhThu/ThongKeChung");

// POST: /api/ThucDon/ThemMoi
export const thucDonThemMoi = (payload: {
  tenMon: string;
  moTa?: string | null;
  gia: number;
  hinhAnh?: string | null;
  monChinh?: boolean;
  doUong?: boolean;
  trangMien?: boolean;
}) => api.post("/api/ThucDon/ThemMoi", payload);

// POST: /api/ThucDon/CapNhat
export const thucDonCapNhat = (payload: {
  id: number;
  tenMon: string;
  moTa?: string | null;
  gia: number;
  hinhAnh?: string | null;
  monChinh?: boolean;
  doUong?: boolean;
  trangMien?: boolean;
}) => api.post("/api/ThucDon/CapNhat", payload);

// DELETE: /api/ThucDon/Xoa/{id}
// NOTE: Nếu BE của bạn để [HttpPost("Xoa/{id}")] thì đổi thành:
// export const thucDonXoa = (id: number) => api.post(`/api/ThucDon/Xoa/${id}`);
export const thucDonXoa = (id: number) => api.delete(`/api/ThucDon/Xoa/${id}`);