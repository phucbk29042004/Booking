import api from "./api"

export interface DatBanRequest{
    TaiKhoanId: number,
    SoNguoi?: number,
    TongTien: number,
    PhuongThucThanhToan : string,
    NgayDat?: string,
    TrangThai?: string,
    GhiChu?: string,
    ChiTietDatBans?: ChiTietDatBanModel[]
}

export interface ChiTietDatBanModel{
    DonDatBanId: number,
    BanAnId: number,
    MonAnId?: number,
    SoLuong?: number,
    GhiChu?: string
}

export interface DatBanResponse{
    statusCode: number,
    message: string,
    donDatBanId: number
}

export async function DatBan(datBan: DatBanRequest): Promise<DatBanResponse>{
    const response = api.post<DatBanResponse>("/api/DatBan/DatBan", datBan);
    return (await response).data;
}

// ========= Hủy đặt bàn =========
export interface HuyDatBanModel{
    DonDatBanId: number,
    TaiKhoanId: number,
    LyDoHuy?: string
}

export interface HuyDatBanResponse{
    message: string,
    donDatBanId: number
}

export async function HuyDatBan(huyDatBan: HuyDatBanModel): Promise<HuyDatBanResponse>{
    const response = api.post<HuyDatBanResponse>("/api/DatBan/HuyDatBan", huyDatBan);
    return (await response).data;
}

// ========= Lịch sử đặt bàn =========
export interface ChiTietDatBanItem{
    banAnId: number,
    tenBan: string,
    monAnId?: number,
    tenMon?: string | null,
    soLuong?: number,
    ghiChu?: string
}

export interface LichSuDatBanItem{
    id: number,
    ngayDat: string,
    gioDat: string,
    soNguoi?: number,
    trangThai?: string,
    ghiChu?: string,
    chiTietDatBans: ChiTietDatBanItem[]
}

export async function LichSuDatBan(taiKhoanId: number): Promise<LichSuDatBanItem[]>{
    const response = api.post<LichSuDatBanItem[]>("/api/DatBan/LichSuDatBan", taiKhoanId);
    return (await response).data;
}