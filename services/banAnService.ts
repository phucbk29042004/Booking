import api from "./api"

export interface BanAnResponse{
    id: number,
    tenBan: string,
    trangThai: number,
    idTang: number
}

export interface ApiResponse{
    statusCode: number,
    message: string
}

export async function GetDanhSachBanAn(): Promise<BanAnResponse[]>{
    const response = api.get<BanAnResponse[]>("/api/BanAn/GetDanhSachBanAn");
    return (await response).data;
}

export async function SetTrangThai2(id: number): Promise<ApiResponse>{
    const response = api.post<ApiResponse>(`/api/BanAn/SetTrangThai2/${id}`);
    return (await response).data;
}

export async function SetTrangThai1(id: number): Promise<ApiResponse>{
    const response = api.post<ApiResponse>(`/api/BanAn/SetTrangThai1/${id}`);
    return (await response).data;
}