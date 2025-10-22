import api from "./api"

export interface ThucDonItem {
    id: number
    gia: number
    tenMon: string
    monChinh: boolean | null
    hinhAnh: string
    doUong: boolean | null
    trangMien: boolean | null
}

export interface MonAnYeuThich {
    id: number
    tenMon: string
    gia: number
    hinhAnh: string
}

export interface GetDanhSachThucDonResponse {
    danhSachBan: ThucDonItem[]
    danhSachYeuThich: MonAnYeuThich[] | null
}

export interface ApiResponse {
    statusCode: number
    message: string
}

// GET: api/ThucDon/GetDanhSachThucDon
export async function GetDanhSachThucDon(idTaiKhoan?: number): Promise<GetDanhSachThucDonResponse> {
    const params = idTaiKhoan ? { idTaiKhoan } : {}
    const response = api.get<GetDanhSachThucDonResponse>("/api/ThucDon/GetDanhSachThucDon", { params })
    return (await response).data
}

// GET: api/ThucDon/GetMonAnYeuThich
export async function GetMonAnYeuThich(idTaiKhoan: number): Promise<MonAnYeuThich[]> {
    const response = api.get<MonAnYeuThich[]>(`/api/ThucDon/GetMonAnYeuThich?idTaiKhoan=${idTaiKhoan}`)
    return (await response).data
}

// POST: api/ThucDon/ThemMonAnYeuThich
export async function ThemMonAnYeuThich(idTaiKhoan: number, idThucDon: number): Promise<ApiResponse> {
    const response = api.post<ApiResponse>(`/api/ThucDon/ThemMonAnYeuThich?idTaiKhoan=${idTaiKhoan}&idThucDon=${idThucDon}`)
    return (await response).data
}

// POST: api/ThucDon/XoaMonAnYeuThich
export async function XoaMonAnYeuThich(idTaiKhoan: number, idThucDon: number): Promise<ApiResponse> {
    const response = api.post<ApiResponse>(`/api/ThucDon/XoaMonAnYeuThich?idTaiKhoan=${idTaiKhoan}&idThucDon=${idThucDon}`)
    return (await response).data
}
