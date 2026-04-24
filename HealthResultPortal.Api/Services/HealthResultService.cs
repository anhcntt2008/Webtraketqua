using System.Data;
using System.Text;
using System.Text.Json.Serialization;
using HealthResultPortal.Api.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;

namespace HealthResultPortal.Api.Services;

public interface IHealthResultService
{
    List<VisitDto> GetVisitsByBenhNhan(long idBenhNhan);
    HealthResult? GetByMaLuotKham(string maLuotKham);
    Task<string?> GetFileContentAsync(string maLuotKham, int fileId, CancellationToken ct = default);

    // Imaging files (kcb_hinhanh_file)
    List<ImagingFile> GetImagingFilesByChitiet(long idChitietChidinh);
    ImagingFile? GetImagingFileById(long idFile);
    Task<(byte[]? Bytes, string ContentType)> GetImagingFileContentAsync(ImagingFile file, CancellationToken ct = default);
}

public class HealthResultService : IHealthResultService
{
    private readonly string _connStr;
    private readonly AppSettings _appSettings;
    private readonly IHttpClientFactory _httpClientFactory;
    public HealthResultService(IConfiguration config, IOptions<AppSettings> appIdentitySettingsAccessor, IHttpClientFactory httpClientFactory)
    {
        _connStr = config.GetConnectionString("HISConnection")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:HISConnection");
        _appSettings = appIdentitySettingsAccessor.Value;
        _httpClientFactory = httpClientFactory;

        Console.WriteLine($"[DEBUG] _appSettings null? {_appSettings == null}");
        Console.WriteLine($"[DEBUG] Path_XN: '{_appSettings?.Path_XN}'");
        Console.WriteLine($"[DEBUG] Link_File: '{_appSettings?.Link_File}'");
    }

    public List<VisitDto> GetVisitsByBenhNhan(long idBenhNhan)
    {
        var visits = new List<VisitDto>();
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        using var cmd = new SqlCommand("Web_laydanhsach_luotkham", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.Add("@idbenhnhan", SqlDbType.BigInt).Value = idBenhNhan;

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            visits.Add(new VisitDto
            {
                MaLuotKham = GetStr(reader, "ma_luotkham"),
                NgayTiepDon = GetDateNull(reader, "ngay_tiepdon")?.ToString("yyyy-MM-ddTHH:mm:ss") ?? "",
                IdBenhNhan = reader.IsDBNull("id_benhnhan") ? 0 : reader.GetInt64(reader.GetOrdinal("id_benhnhan")),
            });
        }
        return visits;
    }

    public HealthResult? GetByMaLuotKham(string maLuotKham)
    {
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        using var cmd = new SqlCommand("web_laythongtin_kham", conn)
        {
            CommandType = CommandType.StoredProcedure
        };
        cmd.Parameters.Add("@luotkham", SqlDbType.NVarChar, 20).Value = maLuotKham;

        using var reader = cmd.ExecuteReader();

        // ================================================================
        // TABLE 1: Thông tin bệnh nhân
        // ================================================================
        SpBenhNhanRow? bnRow = null;
        if (reader.Read())
        {
            bnRow = new SpBenhNhanRow
            {
                id_benhnhan = GetLong(reader, "id_benhnhan"),
                ma_luotkham = GetStr(reader, "ma_luotkham"),
                ten_benhnhan = GetStr(reader, "ten_benhnhan"),
                nam_sinh = GetIntNull(reader, "nam_sinh"),
                gioi_tinh = GetStrNull(reader, "gioi_tinh"),
                ngay_sinh = GetDateNull(reader, "ngay_sinh"),
                dien_thoai = GetStrNull(reader, "dien_thoai"),
                dia_chi = GetStrNull(reader, "dia_chi"),
                ten_doituong_kcb = GetStrNull(reader, "ten_doituong_kcb"),
                mathe_bhyt = GetStrNull(reader, "mathe_bhyt"),
                so_cccd = GetStrNull(reader, "so_cccd"),
                so_benh_an = GetStrNull(reader, "so_benh_an"),
                ngay_kham = GetDateNull(reader, "ngay_kham"),
            };
        }

        if (bnRow == null) return null;

        // ================================================================
        // TABLE 2: Thông tin lần khám và chẩn đoán (kcb_chandoan_ketluan)
        // ================================================================
        var khamRows = new List<SpKhamRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                khamRows.Add(new SpKhamRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    ma_luotkham = GetStr(reader, "ma_luotkham"),
                    chandoan = GetStrNull(reader, "chandoan"),
                    ngay_kham = GetDateNull(reader, "ngay_kham"),
                    mach = GetStrNull(reader, "mach"),
                    nhietdo = GetStrNull(reader, "nhietdo"),
                    huyetap = GetStrNull(reader, "huyetap"),
                    cannang = GetStrNull(reader, "cannang"),
                    chieucao = GetStrNull(reader, "chieucao"),
                    chiso_ibm = GetStrNull(reader, "chiso_ibm"),
                    ketluan = GetStrNull(reader, "ketluan"),
                    huong_dieutri = GetStrNull(reader, "huong_dieutri"),
                    loidan = GetStrNull(reader, "loidan"),
                    phongkham = GetStrNull(reader, "phongkham"),
                    bacsyKham = GetStrNull(reader, "bacsyKham"),
                });
            }
        }

        // ================================================================
        // TABLE 3: Kết quả xét nghiệm (kcb_ketqua_cls)
        // ================================================================
        var xnRows = new List<SpXetNghiemRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                xnRows.Add(new SpXetNghiemRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    ma_luotkham = GetStr(reader, "ma_luotkham"),
                    chandoan = GetStrNull(reader, "chandoan"),
                    ten_thongso = GetStrNull(reader, "ten_thongso"),
                    ten_kq = GetStrNull(reader, "ten_kq"),
                    ket_qua = GetStrNull(reader, "ket_qua"),
                    ten_donvitinh = GetStrNull(reader, "ten_donvitinh"),
                    ngay_xacnhan = GetDateNull(reader, "ngay_xacnhan"),
                    bt_nam = GetStrNull(reader, "bt_nam"),
                    bt_nu = GetStrNull(reader, "bt_nu"),
                    ma_benhpham = GetStrNull(reader, "ma_benhpham"),
                    bacsyXN = GetStrNull(reader, "bacsyXN"),
                    stt_in = GetIntNull(reader, "stt_in"),
                    ten_dichvu = GetStrNull(reader, "ten_dichvu"),
                    stt_nhom = GetIntNull(reader, "stt_nhom"),
                });
            }
        }

        // ================================================================
        // TABLE 4: File xét nghiệm (kcb_thongtin_file WHERE ma_phieu='XN')
        // ================================================================
        var fileXNRows = new List<SpFileRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                fileXNRows.Add(new SpFileRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    id_file = GetIntNull(reader, "id_file"),
                    duong_dan = GetStrNull(reader, "duong_dan"),
                    duongdan_daky = GetStrNull(reader, "duongdan_daky"),
                    da_ky = GetIntNull(reader, "da_ky") == 1 ? true : false,
                    report_code = GetStrNull(reader, "report_code"),
                    report_name = GetStrNull(reader, "report_name"),
                    ten_file = GetStrNull(reader, "ten_file"),
                    ma_luotkham = GetStrNull(reader, "ma_luotkham"),
                    id_phieu = GetStrNull(reader, "id_phieu"),
                    ma_phieu = GetStrNull(reader, "ma_phieu"),
                });
            }
        }

        // ================================================================
        // TABLE 5: Kết quả hình ảnh (kcb_ketqua_ha)
        // ================================================================
        var haRows = new List<SpHinhAnhRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                haRows.Add(new SpHinhAnhRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    ma_luotkham = GetStr(reader, "ma_luotkham"),
                    chandoan = GetStrNull(reader, "chandoan"),
                    idChitietChidinh = GetLongNull(reader, "idChitietChidinh"),
                    ngay_ketqua = GetDateNull(reader, "ngay_ketqua"),
                    ten_dichvu = HasColumn(reader, "ten_dichvu") ? GetStrNull(reader, "ten_dichvu") : null,
                    ketquahtml = GetStrNull(reader, "ketquahtml"),
                    ketquahrtf = GetStrNull(reader, "ketquahrtf"),
                    ket_qua = GetStrNull(reader, "ket_qua"),
                    de_nghi = GetStrNull(reader, "de_nghi"),
                    nguoitra_ketqua = GetStrNull(reader, "nguoitra_ketqua"),
                    id = GetIntNull(reader, "id"),
                });
            }
        }

        // ================================================================
        // TABLE 6: Đơn thuốc (kcb_donthuoc_chitiet)
        // ================================================================
        var thuocRows = new List<SpDonThuocRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                thuocRows.Add(new SpDonThuocRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    ma_luotkham = GetStr(reader, "ma_luotkham"),
                    chandoan = GetStrNull(reader, "chandoan"),
                    ma_thuoc = GetStrNull(reader, "ma_thuoc"),
                    ten_thuoc = GetStrNull(reader, "ten_thuoc"),
                    ham_luong = GetStrNull(reader, "ham_luong"),
                    so_luong = GetDecimalNull(reader, "so_luong"),
                    donvi_tinh = GetStrNull(reader, "donvi_tinh"),
                    cach_dung = GetStrNull(reader, "cach_dung"),
                    bacsy_kedon = GetStrNull(reader, "bacsy_kedon"),
                    ngay_kedon = GetDateNull(reader, "ngay_kedon"),
                });
            }
        }

        // ================================================================
        // TABLE 7: File đơn thuốc / bảng kê (kcb_thongtin_file WHERE ma_phieu IN ('DONTHUOC','BANGKEKCB','FILE'))
        // ================================================================
        var fileDTRows = new List<SpFileRow>();
        if (reader.NextResult())
        {
            while (reader.Read())
            {
                fileDTRows.Add(new SpFileRow
                {
                    id_benhnhan = GetLong(reader, "id_benhnhan"),
                    id_file = GetIntNull(reader, "id_file"),
                    duong_dan = GetStrNull(reader, "duong_dan"),
                    duongdan_daky = GetStrNull(reader, "duongdan_daky"),
                    da_ky = GetIntNull(reader, "da_ky") == 1 ? true : false,
                    report_code = GetStrNull(reader, "report_code"),
                    report_name = GetStrNull(reader, "report_name"),
                    ten_file = GetStrNull(reader, "ten_file"),
                    ma_luotkham = GetStrNull(reader, "ma_luotkham"),
                    id_phieu = GetStrNull(reader, "id_phieu"),
                    ma_phieu = GetStrNull(reader, "ma_phieu"),
                });
            }
        }

        // ================================================================
        // MAP TO HealthResult
        // ================================================================
        var result = new HealthResult
        {
            Patient = MapPatient(bnRow),
            ExamDate = bnRow.ngay_kham?.ToString("dd/MM/yyyy") ?? "",
            ExamCode = bnRow.ma_luotkham,
            Status = "completed",
        };

        // --- Table 2 → ExamInfo, Vitals, Departments ---
        if (khamRows.Count > 0)
        {
            var kham = khamRows[0];
            result.Doctor = kham.bacsyKham ?? "";
            result.Department = kham.phongkham ?? "";
            result.Conclusion = kham.ketluan ?? "";
            result.Diagnosis = kham.chandoan ?? "";

            result.ExamInfo = new ExamInfo
            {
                Vitals = new Vitals
                {
                    Height = kham.chieucao ?? "",
                    Weight = kham.cannang ?? "",
                    Bmi = kham.chiso_ibm ?? "",
                    BmiStatus = CalcBmiStatus(kham.chiso_ibm),
                    BloodPressure = kham.huyetap ?? "",
                    HeartRate = kham.mach ?? "",
                    Temperature = kham.nhietdo ?? "",
                    Spo2 = "",
                    VisionLeft = "",
                    VisionRight = "",
                },
                Departments = khamRows.Select(k => new DepartmentExam
                {
                    Name = k.phongkham ?? "",
                    Doctor = k.bacsyKham ?? "",
                    Icon = "🩺",
                    Findings = k.ketluan ?? "",
                    Diagnosis = k.chandoan ?? "",
                    Note = k.huong_dieutri ?? "",
                }).ToList()
            };

            result.PrescriptionNote = kham.loidan ?? "";
            result.PrescriptionDoctor = kham.bacsyKham ?? "";
            result.PrescriptionDate = kham.ngay_kham?.ToString("dd/MM/yyyy") ?? "";
        }

        // --- Table 3 → Lab categories grouped by ten_dichvu ---
        var gender = bnRow.gioi_tinh?.Trim().ToLower();
        result.Categories = xnRows
            .GroupBy(x => new { x.ten_dichvu, x.stt_nhom })
            .OrderBy(g => g.Key.stt_nhom ?? 999)
            .Select(g => new LabCategory
            {
                Name = g.Key.ten_dichvu ?? "Xét nghiệm",
                Icon = "🔬",
                Stt = g.Key.stt_nhom ?? 0,
                Tests = g.OrderBy(t => t.stt_in ?? 0).Select(t =>
                {
                    var refRange = (gender == "nữ" || gender == "nu") ? t.bt_nu : t.bt_nam;
                    return new LabTest
                    {
                        Name = t.ten_thongso ?? t.ten_kq ?? "",
                        Value = t.ket_qua ?? "",
                        Unit = t.ten_donvitinh ?? "",
                        Range = refRange ?? "",
                        Status = EvalLabStatus(t.ket_qua, refRange),
                        Doctor = t.bacsyXN ?? "",
                        SttIn = t.stt_in ?? 0,
                    };
                }).ToList()
            }).ToList();

        // --- Table 5 → Imaging results (files lấy riêng qua API /imaging/{idChitietChidinh}/files) ---
        result.ImagingResults = haRows.Select((h, idx) => new ImagingResult
        {
            Id = h.id ?? (idx + 1),
            IdChitietChidinh = h.idChitietChidinh ?? 0,
            Name = h.ten_dichvu ?? "Kết quả CĐHA",
            Result = h.ket_qua ?? "",
            ContentHtml = h.ketquahtml ?? "",
            Doctor = h.nguoitra_ketqua ?? "",
            Date = h.ngay_ketqua?.ToString("dd/MM/yyyy HH:mm") ?? "",
        }).ToList();

        // --- Table 6 → Prescriptions ---
        result.Prescriptions = thuocRows.Select((t, idx) => new Prescription
        {
            Id = idx + 1,
            Name = t.ten_thuoc ?? "",
            Generic = t.ham_luong ?? "",
            Quantity = t.so_luong?.ToString("0.##") ?? "",
            Unit = t.donvi_tinh ?? "",
            Usage = t.cach_dung ?? "",
            Doctor = t.bacsy_kedon ?? "",
            Date = t.ngay_kedon?.ToString("dd/MM/yyyy") ?? "",
        }).ToList();

        if (thuocRows.Count > 0)
        {
            result.PrescriptionDoctor = thuocRows[0].bacsy_kedon ?? result.PrescriptionDoctor;
            result.PrescriptionDate = thuocRows[0].ngay_kedon?.ToString("dd/MM/yyyy") ?? result.PrescriptionDate;
        }

        // --- Table 4 + Table 7 → Files (merged, deduplicated by id_file) ---
        var allFiles = new List<(SpFileRow row, string category)>();
        foreach (var f in fileXNRows)
            allFiles.Add((f, "Xét nghiệm"));
        foreach (var f in fileDTRows)
            allFiles.Add((f, "Đơn thuốc / Bảng kê"));

        var seen = new HashSet<int>();
        result.Files = allFiles
            .Where(x => x.row.id_file == null || seen.Add(x.row.id_file.Value))
            .Select((x, idx) => new ResultFile
            {
                Id = x.row.id_file ?? (1000 + idx),
                Name = x.row.ten_file ?? x.row.report_name ?? "Tài liệu",
                Type = "pdf",
                Size = "",
                DuongDan = x.row.duong_dan ?? "",
                DuongDanDaKy = x.row.duongdan_daky ?? "",
                DaKy = x.row.da_ky ?? false,
                ReportCode = x.row.report_code ?? "",
                MaPhieu = x.row.ma_phieu ?? "",
                Category = x.category,
            }).ToList();

        return result;
    }

    public async Task<string?> GetFileContentAsync(string maLuotKham, int fileId, CancellationToken ct = default)
    {
        var result = GetByMaLuotKham(maLuotKham);
        var file = result?.Files.FirstOrDefault(f => f.Id == fileId);
        if (file == null) return null;

        var path = file.DaKy && !string.IsNullOrEmpty(file.DuongDanDaKy)
            ? file.DuongDanDaKy
            : file.DuongDan;
        if (string.IsNullOrEmpty(path)) return null;

        var fileketqua = await GetFileFromApiAsync(path, path, file.MaPhieu, ct);
        if (string.IsNullOrEmpty(fileketqua)) return null;

        var responseFile = JsonConvert.DeserializeObject<ResponseFile>(fileketqua);
        if (responseFile?.data == null || !responseFile.IsSuccess) return null;

        var dataJson = responseFile.data as Newtonsoft.Json.Linq.JObject
                       ?? Newtonsoft.Json.Linq.JObject.FromObject(responseFile.data);
        var fileDetail = dataJson.ToObject<FileDetail>();
        if (fileDetail?.fileByte == null || fileDetail.fileByte.Length == 0) return null;

        return Convert.ToBase64String(fileDetail.fileByte, Base64FormattingOptions.None);
    }

    private async Task<string?> GetFileFromApiAsync(string filePath, string? fileName, string? fileGroup, CancellationToken ct)
    {
        try
        {
            var client = _httpClientFactory.CreateClient("FileApi");

            var requestBody = new
            {
                filePath,
                fileName = fileName ?? "",
                fileGroup = fileGroup ?? "",
                fileBase64 = ""
            };

            var json = System.Text.Json.JsonSerializer.Serialize(requestBody);
            using var content = new StringContent(json, Encoding.UTF8, "application/json");

            using var response = await client.PostAsync(_appSettings.Link_File, content, ct);
            if (!response.IsSuccessStatusCode) return null;

            var body = await response.Content.ReadAsStringAsync(ct);
            if (string.IsNullOrWhiteSpace(body)) return null;

            body = body.Trim().Trim('"');
            var commaIndex = body.IndexOf(',');
            if (body.StartsWith("data:") && commaIndex > 0)
                body = body.Substring(commaIndex + 1);

            return body;
        }
        catch
        {
            return null;
        }
    }
    // ========== Imaging files (kcb_hinhanh_file) ==========
    public List<ImagingFile> GetImagingFilesByChitiet(long idChitietChidinh)
    {
        var files = new List<ImagingFile>();
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        using var cmd = new SqlCommand(
            @"SELECT id_file, id_chitietchidinh, file_path, file_name, file_type,
                     link_url, nguoi_tao, ngay_tao
              FROM kcb_hinhanh_file
              WHERE id_chitietchidinh = @id
              ORDER BY id_file", conn);
        cmd.Parameters.Add("@id", SqlDbType.BigInt).Value = idChitietChidinh;

        using var reader = cmd.ExecuteReader();
        while (reader.Read())
        {
            files.Add(MapImagingFile(reader));
        }
        return files;
    }

    public ImagingFile? GetImagingFileById(long idFile)
    {
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        using var cmd = new SqlCommand(
            @"SELECT id_file, id_chitietchidinh, file_path, file_name, file_type,
                     link_url, nguoi_tao, ngay_tao
              FROM kcb_hinhanh_file
              WHERE id_file = @id", conn);
        cmd.Parameters.Add("@id", SqlDbType.BigInt).Value = idFile;

        using var reader = cmd.ExecuteReader();
        return reader.Read() ? MapImagingFile(reader) : null;
    }

    public async Task<(byte[]? Bytes, string ContentType)> GetImagingFileContentAsync(ImagingFile file, CancellationToken ct = default)
    {
        if (string.IsNullOrEmpty(file.FilePath))
            return (null, "application/octet-stream");

        var contentType = ResolveContentType(file.FileName, file.FileType);

        var response = await GetFileFromApiAsync(file.FilePath, file.FileName, "CDHA", ct);
        if (string.IsNullOrEmpty(response)) return (null, contentType);

        var responseFile = JsonConvert.DeserializeObject<ResponseFile>(response);
        if (responseFile?.data == null || !responseFile.IsSuccess) return (null, contentType);

        var dataJson = responseFile.data as Newtonsoft.Json.Linq.JObject
                       ?? Newtonsoft.Json.Linq.JObject.FromObject(responseFile.data);
        var fileDetail = dataJson.ToObject<FileDetail>();
        if (fileDetail?.fileByte == null || fileDetail.fileByte.Length == 0)
            return (null, contentType);

        return (fileDetail.fileByte, contentType);
    }

    private static ImagingFile MapImagingFile(SqlDataReader reader)
    {
        var filePath = GetStrNull(reader, "file_path") ?? "";
        var fileName = GetStrNull(reader, "file_name") ?? "";
        var fileType = GetStrNull(reader, "file_type") ?? "";
        var linkUrl = GetStrNull(reader, "link_url") ?? "";

        return new ImagingFile
        {
            Id = GetLong(reader, "id_file"),
            IdChitietChidinh = GetLong(reader, "id_chitietchidinh"),
            FilePath = filePath,
            FileName = !string.IsNullOrWhiteSpace(fileName) ? fileName : Path.GetFileName(filePath),
            FileType = fileType,
            LinkUrl = linkUrl,
            NguoiTao = GetStrNull(reader, "nguoi_tao") ?? "",
            NgayTao = GetDateNull(reader, "ngay_tao")?.ToString("dd/MM/yyyy HH:mm") ?? "",
            Kind = ResolveKind(fileName, filePath, fileType, linkUrl),
        };
    }

    private static string ResolveKind(string fileName, string filePath, string fileType, string linkUrl)
    {
        var ext = GetExt(fileName, filePath, fileType);
        if (ext == "pdf") return "pdf";
        if (ext is "jpg" or "jpeg" or "png" or "gif" or "bmp" or "webp") return "image";
        if (ext is "mp4" or "webm" or "mov" or "avi" or "mkv" or "m4v") return "video";
        if (!string.IsNullOrWhiteSpace(linkUrl)) return "link";
        return "other";
    }

    private static string ResolveContentType(string fileName, string fileType)
    {
        var ext = GetExt(fileName, "", fileType);
        return ext switch
        {
            "pdf" => "application/pdf",
            "jpg" or "jpeg" => "image/jpeg",
            "png" => "image/png",
            "gif" => "image/gif",
            "bmp" => "image/bmp",
            "webp" => "image/webp",
            "mp4" => "video/mp4",
            "webm" => "video/webm",
            "mov" => "video/quicktime",
            "avi" => "video/x-msvideo",
            "mkv" => "video/x-matroska",
            "m4v" => "video/x-m4v",
            _ => "application/octet-stream"
        };
    }

    private static string GetExt(string fileName, string filePath, string fileType)
    {
        string Clean(string s) => (s ?? "").Trim().TrimStart('.').ToLowerInvariant();

        var fromType = Clean(fileType);
        if (!string.IsNullOrEmpty(fromType) && fromType.Length <= 5) return fromType;

        var fromName = Path.GetExtension(fileName);
        if (!string.IsNullOrEmpty(fromName)) return Clean(fromName);

        var fromPath = Path.GetExtension(filePath);
        if (!string.IsNullOrEmpty(fromPath)) return Clean(fromPath);

        return "";
    }

    // ========== Helpers ==========
    private static SpFileRow ReadFileRow(SqlDataReader reader) => new()
    {
        id_file = GetIntNull(reader, "id_file"),
        id_benhnhan = GetLong(reader, "id_benhnhan"),
        duong_dan = GetStrNull(reader, "duong_dan"),
        duongdan_daky = GetStrNull(reader, "duongdan_daky"),
        da_ky = HasColumn(reader, "da_ky") && !reader.IsDBNull(reader.GetOrdinal("da_ky"))
            ? Convert.ToBoolean(reader.GetValue(reader.GetOrdinal("da_ky")))
            : false,
        report_code = GetStrNull(reader, "report_code"),
        report_name = GetStrNull(reader, "report_name"),
        ten_file = GetStrNull(reader, "ten_file"),
        ma_luotkham = GetStrNull(reader, "ma_luotkham"),
        id_phieu = GetStrNull(reader, "id_phieu"),
    };

    private static PatientInfo MapPatient(SpBenhNhanRow bn) => new()
    {
        IdBenhNhan = bn.id_benhnhan,
        MaLuotKham = bn.ma_luotkham,
        Name = bn.ten_benhnhan,
        Dob = bn.ngay_sinh?.ToString("dd/MM/yyyy") ?? (bn.nam_sinh?.ToString() ?? ""),
        Gender = bn.gioi_tinh ?? "",
        Pid = bn.ma_luotkham,
        Phone = bn.dien_thoai ?? "",
        Address = bn.dia_chi ?? "",
        Insurance = bn.mathe_bhyt ?? "",
        DoiTuongKcb = bn.ten_doituong_kcb ?? "",
        SoCccd = bn.so_cccd ?? "",
        SoBenhAn = bn.so_benh_an ?? "",
        NgayKham = bn.ngay_kham?.ToString("dd/MM/yyyy HH:mm") ?? "",
    };

    private static string CalcBmiStatus(string? bmiStr)
    {
        if (!double.TryParse(bmiStr, out var bmi)) return "";
        return bmi switch
        {
            < 18.5 => "Gầy",
            < 23 => "Bình thường",
            < 25 => "Thừa cân",
            < 30 => "Béo phì độ I",
            _ => "Béo phì độ II+"
        };
    }

    /// <summary>
    /// So sánh kết quả xét nghiệm với khoảng tham chiếu
    /// Hỗ trợ dạng "min - max", "< max", "> min", "Âm tính/Dương tính"
    /// </summary>
    private static string EvalLabStatus(string? value, string? range)
    {
        if (string.IsNullOrWhiteSpace(value) || string.IsNullOrWhiteSpace(range))
            return "normal";

        // Text-based results
        var valLower = value.Trim().ToLower();
        if (valLower == "âm tính" || valLower == "negative" || valLower == "(-)")
            return "normal";
        if (valLower == "dương tính" || valLower == "positive" || valLower == "(+)")
            return "high";

        if (!double.TryParse(value.Trim(), out var numVal))
            return "normal";

        var rangeTrimmed = range.Trim();

        // "min - max" format
        if (rangeTrimmed.Contains('-'))
        {
            var parts = rangeTrimmed.Split('-');
            if (parts.Length == 2
                && double.TryParse(parts[0].Trim(), out var min)
                && double.TryParse(parts[1].Trim(), out var max))
            {
                if (numVal < min) return "low";
                if (numVal > max) return "high";
                return "normal";
            }
        }

        // "< max" format
        if (rangeTrimmed.StartsWith("<") || rangeTrimmed.StartsWith("≤"))
        {
            var numPart = rangeTrimmed.TrimStart('<', '≤', ' ');
            if (double.TryParse(numPart, out var max))
                return numVal > max ? "high" : "normal";
        }

        // "> min" format
        if (rangeTrimmed.StartsWith(">") || rangeTrimmed.StartsWith("≥"))
        {
            var numPart = rangeTrimmed.TrimStart('>', '≥', ' ');
            if (double.TryParse(numPart, out var min))
                return numVal < min ? "low" : "normal";
        }

        return "normal";
    }

    private static long GetLong(SqlDataReader r, string col)
    {
        var ord = r.GetOrdinal(col);
        if (r.IsDBNull(ord)) return 0;
        var val = r.GetValue(ord);
        return Convert.ToInt64(val);
    }

    private static long? GetLongNull(SqlDataReader r, string col)
    {
        if (!HasColumn(r, col)) return null;
        var ord = r.GetOrdinal(col);
        if (r.IsDBNull(ord)) return null;
        return Convert.ToInt64(r.GetValue(ord));
    }

    private static string GetStr(SqlDataReader r, string col)
    {
        var ord = r.GetOrdinal(col);
        return r.IsDBNull(ord) ? "" : r.GetValue(ord)?.ToString() ?? "";
    }

    private static string? GetStrNull(SqlDataReader r, string col)
    {
        if (!HasColumn(r, col)) return null;
        var ord = r.GetOrdinal(col);
        return r.IsDBNull(ord) ? null : r.GetValue(ord)?.ToString();
    }

    private static int? GetIntNull(SqlDataReader r, string col)
    {
        if (!HasColumn(r, col)) return null;
        var ord = r.GetOrdinal(col);
        if (r.IsDBNull(ord)) return null;
        return Convert.ToInt32(r.GetValue(ord));
    }

    private static decimal? GetDecimalNull(SqlDataReader r, string col)
    {
        if (!HasColumn(r, col)) return null;
        var ord = r.GetOrdinal(col);
        if (r.IsDBNull(ord)) return null;
        return Convert.ToDecimal(r.GetValue(ord));
    }

    private static DateTime? GetDateNull(SqlDataReader r, string col)
    {
        if (!HasColumn(r, col)) return null;
        var ord = r.GetOrdinal(col);
        return r.IsDBNull(ord) ? null : r.GetDateTime(ord);
    }

    private static bool HasColumn(SqlDataReader r, string col)
    {
        try
        {
            r.GetOrdinal(col);
            return true;
        }
        catch
        {
            return false;
        }
    }
}
