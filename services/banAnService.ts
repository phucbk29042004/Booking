import api from "./api"

export interface BanAnResponse{
    id: number,
    tenBan: string,
    trangThai: number,
    idTang: number,
    soChoNgoi?: number,
    daDat?: boolean,
    tinhTrangDatBan?: boolean,
    ngayDatBan?: string | null
}

export interface ApiResponse{
    statusCode: number,
    message: string
}

function normalizeNgayParamYMD(ngayDat?: Date | string): string | undefined {
    let ngayDatParam: string | undefined = undefined;
    if (ngayDat) {
        if (ngayDat instanceof Date) {
            const dd = String(ngayDat.getDate()).padStart(2, "0");
            const mm = String(ngayDat.getMonth() + 1).padStart(2, "0");
            const yyyy = String(ngayDat.getFullYear());
            ngayDatParam = `${yyyy}-${mm}-${dd}`; // yyyy-MM-dd
        } else if (typeof ngayDat === "string" && ngayDat.trim().length > 0) {
            const raw = ngayDat.trim();
            if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                const [d, m, y] = raw.split("-");
                ngayDatParam = `${y}-${m}-${d}`;
            } else if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                ngayDatParam = raw;
            }
        }
    }
    return ngayDatParam;
}

function normalizeNgayParamDMY(ngayDat?: Date | string): string | undefined {
    // Trả về dd-MM-yyyy (phù hợp endpoint GetDanhSachBanAn hiện tại)
    let ngayDatParam: string | undefined = undefined;
    if (ngayDat) {
        if (ngayDat instanceof Date) {
            const dd = String(ngayDat.getDate()).padStart(2, "0");
            const mm = String(ngayDat.getMonth() + 1).padStart(2, "0");
            const yyyy = String(ngayDat.getFullYear());
            ngayDatParam = `${dd}-${mm}-${yyyy}`; // dd-MM-yyyy
        } else if (typeof ngayDat === "string" && ngayDat.trim().length > 0) {
            const raw = ngayDat.trim();
            if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
                const [y, m, d] = raw.split("-");
                ngayDatParam = `${d}-${m}-${y}`;
            } else if (/^\d{2}-\d{2}-\d{4}$/.test(raw)) {
                ngayDatParam = raw;
            }
        }
    }
    return ngayDatParam;
}

export async function GetDanhSachBanAn(ngayDat?: Date | string): Promise<BanAnResponse[]>{
    // Endpoint này mong đợi dd-MM-yyyy
    const ngayDatParam = normalizeNgayParamDMY(ngayDat);

    const response = api.get<BanAnResponse[]>(
        "/api/BanAn/GetDanhSachBanAn",
        { params: ngayDatParam ? { ngayDat: ngayDatParam } : undefined }
    );
    return (await response).data;
}

export async function SetTrangThai2(id: number, ngayDat?: Date | string): Promise<ApiResponse>{
    const ngayDatParam = normalizeNgayParamYMD(ngayDat);
    const response = api.post<ApiResponse>(`/api/BanAn/SetTrangThai2/${id}`, null, {
        params: ngayDatParam ? { ngayDat: ngayDatParam } : undefined,
    });
    return (await response).data;
}

export async function SetTrangThai1(id: number, ngayDat?: Date | string): Promise<ApiResponse>{
    const ngayDatParam = normalizeNgayParamYMD(ngayDat);
    const response = api.post<ApiResponse>(`/api/BanAn/SetTrangThai1/${id}`, null, {
        params: ngayDatParam ? { ngayDat: ngayDatParam } : undefined,
    });
    return (await response).data;
}