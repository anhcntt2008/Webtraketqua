using HealthResultPortal.Api.Models;
using HealthResultPortal.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthResultPortal.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Đăng nhập qua số điện thoại + mật khẩu (bảng web_xacthuc)
    /// </summary>
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.DienThoai) || string.IsNullOrWhiteSpace(request.MatKhau))
            return BadRequest(new { message = "Vui lòng nhập đầy đủ số điện thoại và mật khẩu" });

        var result = _authService.Authenticate(request);
        if (result == null)
            return Unauthorized(new { message = "Số điện thoại hoặc mật khẩu không chính xác" });

        return Ok(result);
    }

    /// <summary>
    /// Người dùng tự đổi mật khẩu (yêu cầu mật khẩu hiện tại)
    /// </summary>
    [HttpPost("change-password")]
    [Authorize]
    public IActionResult ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.OldPassword) || string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Vui lòng nhập đầy đủ mật khẩu cũ và mới" });

        var dienThoai = User.FindFirst("dien_thoai")?.Value;
        if (string.IsNullOrEmpty(dienThoai)) return Unauthorized();

        try
        {
            var ok = _authService.ChangePassword(dienThoai, request.OldPassword, request.NewPassword);
            if (!ok) return BadRequest(new { message = "Mật khẩu hiện tại không đúng" });
            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
