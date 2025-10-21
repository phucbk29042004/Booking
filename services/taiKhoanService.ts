import api from "./api"

export interface LoginResponse{
    success: boolean,
    message: string,
    user: any,
    idTaiKhoan: number
}

export interface RegisterResponse{
    statusCode: number,
    message: string,
    taiKhoanId: number
}

export async function LoginHandle(Email: string, MatKhau: string): Promise<LoginResponse>{
    const response = api.post<LoginResponse>("/api/TaiKhoan/DangNhap", {Email, MatKhau});
    return (await response).data;
}

export async function RegisterHandle(Email: string, MatKhau: string, SoDienThoai?: string): Promise<RegisterResponse>{
    const response = api.post<RegisterResponse>("/api/TaiKhoan/DangKy", {Email, MatKhau, SoDienThoai});
    return (await response).data;
}