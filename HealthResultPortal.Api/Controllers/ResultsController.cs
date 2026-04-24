using HealthResultPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace HealthResultPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ResultsController : ControllerBase
{
    private readonly IHealthResultService _resultService;

    public ResultsController(IHealthResultService resultService)
    {
        _resultService = resultService;
    }

    /// <summary>
    /// Lấy danh sách lượt khám theo id_benhnhan (SP Web_laydanhsach_luotkham)
    /// </summary>
    [HttpGet("visits/{idBenhNhan:long}")]
    public IActionResult GetVisits(long idBenhNhan)
    {
        // Kiểm tra quyền: chỉ xem lượt khám của chính mình
        var claimId = User.FindFirst("id_benhnhan")?.Value;
        if (!string.Equals(claimId, idBenhNhan.ToString()))
            return Forbid();

        var visits = _resultService.GetVisitsByBenhNhan(idBenhNhan);
        return Ok(visits);
    }

    /// <summary>
    /// Lấy toàn bộ kết quả khám theo mã lượt khám (SP web_laythongtin_kham)
    /// </summary>
    [HttpGet("{maLuotKham}")]
    public IActionResult GetResult(string maLuotKham)
    {
        // Bất kỳ user đã login đều có thể xem kết quả nếu lượt khám thuộc id_benhnhan của họ
        var result = _resultService.GetByMaLuotKham(maLuotKham);
        if (result == null)
            return NotFound(new { message = "Không tìm thấy kết quả khám" });

        // Kiểm tra quyền: id_benhnhan trong kết quả phải khớp claim
        var claimId = User.FindFirst("id_benhnhan")?.Value;
        if (!string.Equals(claimId, result.Patient.IdBenhNhan.ToString()))
            return Forbid();

        return Ok(result);
    }

    /// <summary>
    /// Download file kết quả (đơn thuốc, bảng kê, file khác)
    /// </summary>
    [HttpGet("{maLuotKham}/files/{fileId}")]
    public async Task<IActionResult> DownloadFile(string maLuotKham, int fileId, CancellationToken ct)
    {
        var result = _resultService.GetByMaLuotKham(maLuotKham);
        if (result == null)
            return NotFound(new { message = "Không tìm thấy kết quả" });

        var claimId = User.FindFirst("id_benhnhan")?.Value;
        if (!string.Equals(claimId, result.Patient.IdBenhNhan.ToString()))
            return Forbid();

        var base64Content = await _resultService.GetFileContentAsync(maLuotKham, fileId, ct);
        if (string.IsNullOrEmpty(base64Content))
            return NotFound(new { message = "Không tìm thấy file" });

        var file = result.Files.FirstOrDefault(f => f.Id == fileId);
        var fileName = !string.IsNullOrWhiteSpace(file?.Name) ? file!.Name : $"file_{fileId}.pdf";
        if (!fileName.EndsWith(".pdf", StringComparison.OrdinalIgnoreCase))
            fileName += ".pdf";

        // Xử lý prefix nếu có (vd: "data:application/pdf;base64,...")
        var commaIndex = base64Content.IndexOf(',');
        if (base64Content.StartsWith("data:") && commaIndex > 0)
            base64Content = base64Content.Substring(commaIndex + 1);

        try
        {
            var bytes = Convert.FromBase64String(base64Content);
            return File(bytes, "application/pdf", fileName);
        }
        catch (FormatException)
        {
            return BadRequest(new { message = "File content không hợp lệ" });
        }
        //var result = _resultService.GetByMaLuotKham(maLuotKham);
        //if (result == null)
        //    return NotFound(new { message = "Không tìm thấy kết quả" });

        //var claimId = User.FindFirst("id_benhnhan")?.Value;
        //if (!string.Equals(claimId, result.Patient.IdBenhNhan.ToString()))
        //    return Forbid();

        //var content = _resultService.GetFileContent(maLuotKham, fileId);
        //if (string.IsNullOrEmpty(content))
        //    return NotFound(new { message = "Không tìm thấy file" });

        //var file = result.Files.FirstOrDefault(f => f.Id == fileId);
        //var fileName = file?.Name ?? $"file_{fileId}.pdf";

        //return File(content, "application/pdf", fileName);
    }

    /// <summary>
    /// Danh sách file của một dịch vụ CĐHA (kcb_hinhanh_file theo id_chitietchidinh).
    /// </summary>
    [HttpGet("{maLuotKham}/imaging/{idChitietChidinh:long}/files")]
    public IActionResult GetImagingFiles(string maLuotKham, long idChitietChidinh)
    {
        var result = _resultService.GetByMaLuotKham(maLuotKham);
        if (result == null)
            return NotFound(new { message = "Không tìm thấy kết quả" });

        var claimId = User.FindFirst("id_benhnhan")?.Value;
        if (!string.Equals(claimId, result.Patient.IdBenhNhan.ToString()))
            return Forbid();

        // Chỉ cho phép truy cập idChitietChidinh thuộc về lượt khám hiện tại
        if (!result.ImagingResults.Any(r => r.IdChitietChidinh == idChitietChidinh))
            return Forbid();

        var files = _resultService.GetImagingFilesByChitiet(idChitietChidinh);
        return Ok(files);
    }

    /// <summary>
    /// Trả về nội dung file CĐHA (pdf / ảnh / video) inline.
    /// </summary>
    [HttpGet("{maLuotKham}/imaging/files/{idFile:long}")]
    public async Task<IActionResult> GetImagingFileContent(string maLuotKham, long idFile, CancellationToken ct)
    {
        var result = _resultService.GetByMaLuotKham(maLuotKham);
        if (result == null)
            return NotFound(new { message = "Không tìm thấy kết quả" });

        var claimId = User.FindFirst("id_benhnhan")?.Value;
        if (!string.Equals(claimId, result.Patient.IdBenhNhan.ToString()))
            return Forbid();

        var file = _resultService.GetImagingFileById(idFile);
        if (file == null)
            return NotFound(new { message = "Không tìm thấy file" });

        // File phải thuộc một dịch vụ CĐHA của chính lượt khám này
        if (!result.ImagingResults.Any(r => r.IdChitietChidinh == file.IdChitietChidinh))
            return Forbid();

        var (bytes, contentType) = await _resultService.GetImagingFileContentAsync(file, ct);
        if (bytes == null || bytes.Length == 0)
            return NotFound(new { message = "Không đọc được nội dung file" });

        var downloadName = !string.IsNullOrWhiteSpace(file.FileName) ? file.FileName : $"file_{idFile}";
        Response.Headers["Content-Disposition"] = $"inline; filename=\"{Uri.EscapeDataString(downloadName)}\"";
        return File(bytes, contentType);
    }
}
