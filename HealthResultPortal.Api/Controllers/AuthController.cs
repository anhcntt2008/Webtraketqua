using HealthResultPortal.Api.Models;
using HealthResultPortal.Api.Services;
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
}
