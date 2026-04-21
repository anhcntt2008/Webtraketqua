using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HealthResultPortal.Api.Models;
using Microsoft.Data.SqlClient;
using Microsoft.IdentityModel.Tokens;

namespace HealthResultPortal.Api.Services;

public interface IAuthService
{
    LoginResponse? Authenticate(LoginRequest request);
    ClaimsPrincipal? ValidateToken(string token);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly string _connStr;

    public AuthService(IConfiguration config)
    {
        _config = config;
        _connStr = config.GetConnectionString("HISConnection")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:HISConnection in appsettings.json");
    }

    public LoginResponse? Authenticate(LoginRequest request)
    {
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        // Lấy record đầu tiên khớp (1 SĐT có thể có nhiều lượt khám, chỉ cần xác thực)
        using var cmd = new SqlCommand(@"
            SELECT TOP 1
                   wx.dien_thoai,
                   wx.id_benhnhan,
                   kdb.ten_benhnhan
            FROM web_xacthuc wx
            INNER JOIN kcb_danhsach_benhnhan kdb ON kdb.id_benhnhan = wx.id_benhnhan
            WHERE wx.dien_thoai = @dien_thoai AND wx.mat_khau = @mat_khau
        ", conn);

        cmd.Parameters.Add("@dien_thoai", SqlDbType.NVarChar, 20).Value = request.DienThoai;
        cmd.Parameters.Add("@mat_khau", SqlDbType.NVarChar, 50).Value = request.MatKhau;

        using var reader = cmd.ExecuteReader();
        if (!reader.Read())
            return null;

        var dienThoai = reader.GetString(0);
        var idBenhNhan = reader.GetInt64(1);
        var tenBenhNhan = reader.IsDBNull(2) ? dienThoai : reader.GetString(2);

        var token = GenerateJwtToken(dienThoai, idBenhNhan, tenBenhNhan);
        var user = new UserInfo(dienThoai, tenBenhNhan, "", idBenhNhan);
        return new LoginResponse(token, user);
    }

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var key = Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "HealthResultPortal_SuperSecretKey_2026!@#$%");
        var handler = new JwtSecurityTokenHandler();

        try
        {
            return handler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidIssuer = _config["Jwt:Issuer"] ?? "HealthResultPortal",
                ValidateAudience = true,
                ValidAudience = _config["Jwt:Audience"] ?? "HealthResultPortalClient",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out _);
        }
        catch
        {
            return null;
        }
    }

    private string GenerateJwtToken(string dienThoai, long idBenhNhan, string tenBenhNhan)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "HealthResultPortal_SuperSecretKey_2026!@#$%"));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, dienThoai),
            new(ClaimTypes.Name, tenBenhNhan),
            new("dien_thoai", dienThoai),
            new("id_benhnhan", idBenhNhan.ToString()),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "HealthResultPortal",
            audience: _config["Jwt:Audience"] ?? "HealthResultPortalClient",
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
