using HealthResultPortal.Api.Models;
using HealthResultPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthResultPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Policy = "AdminOnly")]
public class UsersController : ControllerBase
{
    private readonly IUserAdminService _svc;

    public UsersController(IUserAdminService svc)
    {
        _svc = svc;
    }

    /// <summary>
    /// Danh sách người dùng (admin). Hỗ trợ search theo SĐT / tên.
    /// </summary>
    [HttpGet]
    public ActionResult<PagedUsers> List([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var result = _svc.List(search, page, pageSize);
        return Ok(result);
    }

    /// <summary>
    /// Admin reset mật khẩu cho user bất kỳ.
    /// </summary>
    [HttpPost("reset-password")]
    public IActionResult ResetPassword([FromBody] AdminResetPasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DienThoai) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Thiếu số điện thoại hoặc mật khẩu mới" });

        try
        {
            var ok = _svc.ResetPassword(request.DienThoai, request.NewPassword);
            if (!ok) return NotFound(new { message = "Không tìm thấy tài khoản" });
            return Ok(new { message = "Reset mật khẩu thành công" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
