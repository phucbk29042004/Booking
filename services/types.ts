// Types và Interfaces cho ứng dụng Booking

// BanAn Types
export interface BanAn {
  id: number;
  tenBan: string;
  trangThai: number;
  idTang: number;
}

export interface BanAnResponse {
  id: number;
  tenBan: string;
  trangThai: number;
  idTang: number;
}

// TaiKhoan Types
export interface TaiKhoan {
  id: number;
  email: string;
  soDienThoai?: string;
  hoTen?: string;
  hinhAnh?: string;
  trangThai: boolean;
  loaiTaiKhoanId: number;
  ngayTao: string;
}

export interface TaiKhoanModel {
  email: string;
  soDienThoai?: string;
  matKhau: string;
}

// Auth Request/Response Types
export interface DangNhapRequest {
  email: string;
  matKhau: string;
}

export interface DangKyRequest {
  email: string;
  soDienThoai?: string;
  matKhau: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: TaiKhoan;
}

// Email Types
export interface GuiEmailRequest {
  email: string;
  tieuDe: string;
  noiDung: string;
}

export interface GuiEmailResponse {
  message: string;
}

// OTP Types
export interface GuiMaOTPRequest {
  email: string;
}

export interface CheckOTPRequest {
  email: string;
  otp: string;
}

export interface OTPResponse {
  message: string;
}

// Password Change Types
export interface DoiMatKhauRequest {
  email: string;
  matKhauMoi: string;
}

export interface DoiMatKhauResponse {
  message: string;
}

// Update Profile Types
export interface CapNhatThongTinRequest {
  id: number;
  email?: string;
  hoTen?: string;
  soDienThoai?: string;
  hinhAnh?: string;
  trangThai?: boolean;
  loaiTaiKhoanId?: number;
}

export interface CapNhatThongTinResponse {
  message: string;
  user?: TaiKhoan;
}

// API Response Types
export interface ApiResponse<T = any> {
  success?: boolean;
  message: string;
  data?: T;
  user?: T;
}

// DatBan Types
export interface DonDatBan {
  id: number;
  taiKhoanId: number;
  soNguoi: number;
  trangThai: string;
  ghiChu?: string;
  ngayDat: string;
  gioDat: string;
  ngayTao: string;
}

export interface ChiTietDatBan {
  id: number;
  donDatBanId: number;
  banAnId: number;
  monAnId?: number;
  soLuong: number;
  ghiChu?: string;
}

export interface DatBanModel {
  taiKhoanId: number;
  soNguoi?: number;
  trangThai?: string;
  ghiChu?: string;
  chiTietDatBans?: ChiTietDatBanModel[];
}

export interface ChiTietDatBanModel {
  donDatBanId: number;
  banAnId: number;
  monAnId?: number;
  soLuong?: number;
  ghiChu?: string;
}

export interface DatBanRequest {
  taiKhoanId: number;
  soNguoi?: number;
  trangThai?: string;
  ghiChu?: string;
  chiTietDatBans?: ChiTietDatBanModel[];
}

export interface DatBanResponse {
  message: string;
  donDatBanId: number;
}

export interface DatBanErrorResponse {
  message: string;
  inner?: string;
  stackTrace?: string;
  source?: string;
  targetSite?: string;
}

// Error Types
export interface ApiError {
  message: string;
  status?: number;
}
