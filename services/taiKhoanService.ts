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

export interface ApiMessageResponse {
    message: string
}

export async function LoginHandle(Email: string, MatKhau: string): Promise<LoginResponse>{
    const response = api.post<LoginResponse>("/api/TaiKhoan/DangNhap", {Email, MatKhau});
    return (await response).data;
}

export async function RegisterHandle(Email: string, MatKhau: string, SoDienThoai?: string): Promise<RegisterResponse>{
    const response = api.post<RegisterResponse>("/api/TaiKhoan/DangKy", {Email, MatKhau, SoDienThoai});
    return (await response).data;
}

// POST: api/TaiKhoan/GuiMaOTP - Backend nhận [FromBody] string email
export async function GuiMaOTP(email: string): Promise<ApiMessageResponse>{
    const response = api.post<ApiMessageResponse>(
        "/api/TaiKhoan/GuiMaOTP",
        JSON.stringify(email),
        { headers: { 'Content-Type': 'application/json' } }
    );
    return (await response).data;
}

// POST: api/TaiKhoan/CheckOTP - Backend nhận { Email, OTP }
export async function CheckOTP(Email: string, OTP: string): Promise<ApiMessageResponse>{
    const response = api.post<ApiMessageResponse>("/api/TaiKhoan/CheckOTP", { Email, OTP });
    return (await response).data;
}

// POST: api/TaiKhoan/DoiMatKhau - Backend nhận { Email, MatKhauMoi }
export async function DoiMatKhau(Email: string, MatKhauMoi: string): Promise<ApiMessageResponse>{
    const response = api.post<ApiMessageResponse>("/api/TaiKhoan/DoiMatKhau", { Email, MatKhauMoi });
    return (await response).data;
}