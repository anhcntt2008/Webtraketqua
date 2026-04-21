using HealthResultPortal.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;

namespace HealthResultPortal.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileController : ControllerBase
    {
        private readonly AppSettings _appSettings;

        public FileController(IOptions<AppSettings> appIdentitySettingsAccessor)
        {
            _appSettings = appIdentitySettingsAccessor.Value;
        }

        /// <summary>
        ///  Hàm thực hiện lấy File trên server
        /// </summary>
        [HttpPost("GetFileResult")]
        public ActionResult<ResponseFile> GetFileResult([FromBody] FileData objFile)
        {
            if (objFile == null || string.IsNullOrWhiteSpace(objFile.FilePath))
                return BadRequest(new ResponseFile { IsSuccess = false, Messge = "FilePath is required" });

            var baseDir = objFile.FileGroup switch
            {
                "XN" => _appSettings.Path_XN,
                "CDHA" => _appSettings.Path_CDHA,
                _ => _appSettings.Path_FILE,
            };
            if (string.IsNullOrEmpty(baseDir))
                return NotFound(new ResponseFile { IsSuccess = false, Messge = "File root not configured" });

            // Resolve & validate path stays inside the configured base dir.
            if (!TryResolveInside(baseDir, objFile.FilePath, out var fullPath))
                return BadRequest(new ResponseFile { IsSuccess = false, Messge = "Invalid file path" });

            if (!System.IO.File.Exists(fullPath))
            {
                // Fallback: try the unsigned variant.
                var unsignedRel = objFile.FilePath.Replace("_signed", "");
                if (!TryResolveInside(baseDir, unsignedRel, out fullPath) || !System.IO.File.Exists(fullPath))
                    return NotFound(new ResponseFile { IsSuccess = false, Messge = "Không tồn tại File Results" });
            }

            try
            {
                var bytes = System.IO.File.ReadAllBytes(fullPath);
                return Ok(new ResponseFile
                {
                    IsSuccess = true,
                    Messge = "",
                    data = new FileDetail { fileByte = bytes, fileName = fullPath },
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new ResponseFile { IsSuccess = false, Messge = ex.Message });
            }
        }

        private static bool TryResolveInside(string baseDir, string relative, out string resolved)
        {
            resolved = "";
            try
            {
                var root = Path.GetFullPath(baseDir);
                var candidate = Path.GetFullPath(Path.Combine(root, relative.TrimStart('/', '\\')));
                if (!candidate.StartsWith(root, StringComparison.OrdinalIgnoreCase)) return false;
                resolved = candidate;
                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
