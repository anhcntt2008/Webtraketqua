namespace HealthResultPortal.Api.Models;

// ========== AUTH ==========
public record LoginRequest(string DienThoai, string MatKhau);
public record LoginResponse(string Token, UserInfo User);
public record UserInfo(string DienThoai, string TenBenhNhan, string MaLuotKham, long IdBenhNhan, bool IsAdmin);

public record ChangePasswordRequest(string OldPassword, string NewPassword);
public record AdminResetPasswordRequest(string DienThoai, string NewPassword);

public record UserSummary(string DienThoai, string TenBenhNhan, long IdBenhNhan, bool IsAdmin);
public record PagedUsers(List<UserSummary> Items, int Total);

// ========== PATIENT (Table 1) ==========
public class PatientInfo
{
    public long IdBenhNhan { get; set; }
    public string MaLuotKham { get; set; } = "";
    public string Name { get; set; } = "";
    public string Dob { get; set; } = "";
    public string Gender { get; set; } = "";
    public string Pid { get; set; } = "";
    public string Phone { get; set; } = "";
    public string Address { get; set; } = "";
    public string Insurance { get; set; } = "";
    public string DoiTuongKcb { get; set; } = "";
    public string SoCccd { get; set; } = "";
    public string SoBenhAn { get; set; } = "";
    public string NgayKham { get; set; } = "";
    public string Job { get; set; } = "";
    public string Company { get; set; } = "";
}

// ========== EXAM INFO (Table 2) ==========
public class Vitals
{
    public string Height { get; set; } = "";
    public string Weight { get; set; } = "";
    public string Bmi { get; set; } = "";
    public string BmiStatus { get; set; } = "";
    public string BloodPressure { get; set; } = "";
    public string HeartRate { get; set; } = "";
    public string Temperature { get; set; } = "";
    public string Spo2 { get; set; } = "";
    public string VisionLeft { get; set; } = "";
    public string VisionRight { get; set; } = "";
}

public class DepartmentExam
{
    public string Name { get; set; } = "";
    public string Doctor { get; set; } = "";
    public string Icon { get; set; } = "";
    public string Findings { get; set; } = "";
    public string Diagnosis { get; set; } = "";
    public string Note { get; set; } = "";
}

public class ExamInfo
{
    public Vitals Vitals { get; set; } = new();
    public List<DepartmentExam> Departments { get; set; } = new();
}

// ========== LAB RESULTS (Table 3) ==========
public class LabTest
{
    public string Name { get; set; } = "";
    public string Value { get; set; } = "";
    public string Unit { get; set; } = "";
    public string Range { get; set; } = "";
    public string Status { get; set; } = "normal";
    public string Doctor { get; set; } = "";
    public int SttIn { get; set; }
}

public class LabCategory
{
    public string Name { get; set; } = "";
    public string Icon { get; set; } = "";
    public int Stt { get; set; }
    public List<LabTest> Tests { get; set; } = new();
}

// ========== IMAGING RESULTS (Table 5) ==========
public class ImagingResult
{
    public int Id { get; set; }
    public long IdChitietChidinh { get; set; }
    public string Name { get; set; } = "";
    public string Result { get; set; } = "";
    public string ContentHtml { get; set; } = "";
    public string Doctor { get; set; } = "";
    public string Date { get; set; } = "";
}

// Files của một dịch vụ CĐHA (kcb_hinhanh_file)
public class ImagingFile
{
    public long Id { get; set; }
    public long IdChitietChidinh { get; set; }
    public string FileName { get; set; } = "";
    public string FilePath { get; set; } = "";
    public string FileType { get; set; } = "";
    public string LinkUrl { get; set; } = "";
    public string NguoiTao { get; set; } = "";
    public string NgayTao { get; set; } = "";
    public string Kind { get; set; } = "other"; // pdf | image | video | link | other
}

// ========== PRESCRIPTION (Table 6) ==========
public class Prescription
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Generic { get; set; } = "";
    public string Dosage { get; set; } = "";
    public string Quantity { get; set; } = "";
    public string Unit { get; set; } = "";
    public string Usage { get; set; } = "";
    public string Doctor { get; set; } = "";
    public string Date { get; set; } = "";
    public string Category { get; set; } = "";
}

// ========== FILES (Table 4 + Table 7 merged) ==========
public class ResultFile
{
    public int Id { get; set; }
    public string Name { get; set; } = "";
    public string Size { get; set; } = "";
    public string Type { get; set; } = "";
    public string DuongDan { get; set; } = "";
    public string DuongDanDaKy { get; set; } = "";
    public bool DaKy { get; set; }
    public string ReportCode { get; set; } = "";
    public string MaPhieu { get; set; } = "";
    public string Category { get; set; } = "";
}

// ========== MAIN RESULT ==========
public class HealthResult
{
    public PatientInfo Patient { get; set; } = new();
    public string ExamDate { get; set; } = "";
    public string ExamCode { get; set; } = "";
    public string Doctor { get; set; } = "";
    public string Department { get; set; } = "";
    public string Status { get; set; } = "pending";
    public string Diagnosis { get; set; } = "";

    // Tab 1 — Thông tin khám
    public ExamInfo ExamInfo { get; set; } = new();

    // Tab 2 — Xét nghiệm
    public List<LabCategory> Categories { get; set; } = new();
    public string Conclusion { get; set; } = "";

    // Tab 3 — Hình ảnh (CĐHA)
    public List<ImagingResult> ImagingResults { get; set; } = new();

    // Tab 4 — Đơn thuốc
    public List<Prescription> Prescriptions { get; set; } = new();
    public string PrescriptionDoctor { get; set; } = "";
    public string PrescriptionDate { get; set; } = "";
    public string PrescriptionNote { get; set; } = "";

    // Tab 5 — Files (XN files + đơn thuốc/bảng kê files merged)
    public List<ResultFile> Files { get; set; } = new();
}

// ========== Raw SP row models ==========
public class SpBenhNhanRow
{
    public long id_benhnhan { get; set; }
    public string ma_luotkham { get; set; } = "";
    public string ten_benhnhan { get; set; } = "";
    public int? nam_sinh { get; set; }
    public string? gioi_tinh { get; set; }
    public DateTime? ngay_sinh { get; set; }
    public string? dien_thoai { get; set; }
    public string? dia_chi { get; set; }
    public string? ten_doituong_kcb { get; set; }
    public string? mathe_bhyt { get; set; }
    public string? so_cccd { get; set; }
    public string? so_benh_an { get; set; }
    public DateTime? ngay_kham { get; set; }
}

public class SpKhamRow
{
    public long id_benhnhan { get; set; }
    public string ma_luotkham { get; set; } = "";
    public string? chandoan { get; set; }
    public DateTime? ngay_kham { get; set; }
    public string? mach { get; set; }
    public string? nhietdo { get; set; }
    public string? huyetap { get; set; }
    public string? cannang { get; set; }
    public string? chieucao { get; set; }
    public string? chiso_ibm { get; set; }
    public string? ketluan { get; set; }
    public string? huong_dieutri { get; set; }
    public string? loidan { get; set; }
    public string? phongkham { get; set; }
    public string? bacsyKham { get; set; }
}

public class SpXetNghiemRow
{
    public long id_benhnhan { get; set; }
    public string ma_luotkham { get; set; } = "";
    public string? chandoan { get; set; }
    public string? ten_thongso { get; set; }
    public string? ten_kq { get; set; }
    public string? ket_qua { get; set; }
    public string? ten_donvitinh { get; set; }
    public DateTime? ngay_xacnhan { get; set; }
    public string? bt_nam { get; set; }
    public string? bt_nu { get; set; }
    public string? ma_benhpham { get; set; }
    public string? bacsyXN { get; set; }
    public int? stt_in { get; set; }
    public string? ten_dichvu { get; set; }
    public int? stt_nhom { get; set; }
}

public class SpFileRow
{
    public int? id_file { get; set; }
    public long id_benhnhan { get; set; }
    public string? duong_dan { get; set; }
    public string? duongdan_daky { get; set; }
    public bool? da_ky { get; set; }
    public string? report_code { get; set; }
    public string? report_name { get; set; }
    public string? ten_file { get; set; }
    public string? ma_luotkham { get; set; }
    public string? id_phieu { get; set; }
    public string? ma_phieu { get; set; }
}

public class SpHinhAnhRow
{
    public long id_benhnhan { get; set; }
    public string ma_luotkham { get; set; } = "";
    public string? chandoan { get; set; }
    public long? idChitietChidinh { get; set; }
    public DateTime? ngay_ketqua { get; set; }
    public string? ten_dichvu { get; set; }
    public string? ketquahtml { get; set; }
    public string? ketquahrtf { get; set; }
    public string? ket_qua { get; set; }
    public string? de_nghi { get; set; }
    public string? nguoitra_ketqua { get; set; }
    public string? ten_dichvu_parent { get; set; }
    public int? id { get; set; }
}

public class SpDonThuocRow
{
    public long id_benhnhan { get; set; }
    public string ma_luotkham { get; set; } = "";
    public string? chandoan { get; set; }
    public string? ma_thuoc { get; set; }
    public string? ten_thuoc { get; set; }
    public string? ham_luong { get; set; }
    public decimal? so_luong { get; set; }
    public string? donvi_tinh { get; set; }
    public string? cach_dung { get; set; }
    public string? bacsy_kedon { get; set; }
    public DateTime? ngay_kedon { get; set; }
}

// ========== Visit list ==========
public class SpVisitRow
{
    public string ma_luotkham { get; set; } = "";
    public DateTime? ngay_tiepdon { get; set; }
    public long id_benhnhan { get; set; }
}

public class VisitDto
{
    public string MaLuotKham { get; set; } = "";
    public string NgayTiepDon { get; set; } = "";
    public long IdBenhNhan { get; set; }
}
// thông tin file 

public class FileData
{
    public string FilePath { get; set; }
    public string FileName { get; set; }
    public string FileGroup { get; set; }
    public string FileBase64 { get; set; }
}
public class ResponseFile
{
    public bool IsSuccess { get; set; }
    public string Messge { get; set; }
    public object data { get; set; }
}

public class FileDetail
{
    public byte[] fileByte { get; set; }
    public string fileName { get; set; }
}
public class AppSettings
{
    public string Path_XN { get; set; } = "";
    public string Path_CDHA { get; set; } = "";
    public string Path_FILE { get; set; } = "";
    public string Link_File { get; set; } = "";
    public List<string> Admins { get; set; } = new();
}