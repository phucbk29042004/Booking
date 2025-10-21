import api from "./api"

export interface DatBanRequest{
    taiKhoanId: number,
    soNguoi?: number,
    trangThai?: string,
    ghiChu?: string,
    chiTietDatBans?: ChiTietDatBanModel[]
}

export interface ChiTietDatBanModel{
    donDatBanId: number,
    banAnId: number,
    monAnId?: number,
    soLuong?: number,
    ghiChu?: string
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