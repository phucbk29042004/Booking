import api from "./api"

export interface ThongBaoItem {
    id: number
    tieuDe: string
    noiDung: string
    ngayTao: string
}

export interface ApiResponse {
    statusCode: number
    message: string
}

// GET: api/ThongBao/GetDanhSachThongBao
export async function GetDanhSachThongBao(idTaiKhoan: number): Promise<ThongBaoItem[]> {
    const response = api.get<ThongBaoItem[]>(`/api/ThongBao/GetDanhSachThongBao?idTaiKhoan=${idTaiKhoan}`)
    return (await response).data
}

// POST: api/ThongBao/XoaThongBao/{id}
export async function XoaThongBao(id: number): Promise<ApiResponse> {
    const response = api.post<ApiResponse>(`/api/ThongBao/XoaThongBao/${id}`)
    return (await response).data
}
