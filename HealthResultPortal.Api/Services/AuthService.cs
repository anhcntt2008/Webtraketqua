using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using HealthResultPortal.Api.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HealthResultPortal.Api.Services;

public interface IAuthService
{
    LoginResponse? Authenticate(LoginRequest request);
    ClaimsPrincipal? ValidateToken(string token);
    bool ChangePassword(string dienThoai, string oldPassword, string newPassword);
}

public class AuthService : IAuthService
{
    private readonly IConfiguration _config;
    private readonly string _connStr;
    private readonly HashSet<string> _adminPhones;

    public AuthService(IConfiguration config, IOptions<AppSettings> appSettings)
    {
        _config = config;
        _connStr = config.GetConnectionString("HISConnection")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:HISConnection");
        _adminPhones = new HashSet<string>(
            appSettings.Value.Admins?.Where(x => !string.IsNullOrWhiteSpace(x)) ?? Array.Empty<string>(),
            StringComparer.OrdinalIgnoreCase);
    }

    public bool IsAdmin(string dienThoai) =>
        !string.IsNullOrWhiteSpace(dienThoai) && _adminPhones.Contains(dienThoai);

    public LoginResponse? Authenticate(LoginRequest request)
    {
        using var conn = new SqlConnection(_connStr);
        conn.Open();

        // Fetch hash (or legacy cleartext) + patient name
        using var cmd = new SqlCommand(@"
            SELECT TOP 1
                   wx.dien_thoai,
                   wx.id_benhnhan,
                   wx.mat_khau,
                   kdb.ten_benhnhan
            FROM web_xacthuc wx
            INNER JOIN kcb_danhsach_benhnhan kdb ON kdb.id_benhnhan = wx.id_benhnhan
            WHERE wx.dien_thoai = @dien_thoai
        ", conn);
        cmd.Parameters.Add("@dien_thoai", SqlDbType.NVarChar, 20).Value = request.DienThoai;

        string dienThoai; long idBenhNhan; string storedPwd; string tenBenhNhan;
        using (var reader = cmd.ExecuteReader())
        {
            if (!reader.Read()) return null;
            dienThoai = reader.GetString(0);
            idBenhNhan = reader.GetInt64(1);
            storedPwd = reader.IsDBNull(2) ? "" : reader.GetString(2);
            tenBenhNhan = reader.IsDBNull(3) ? dienThoai : reader.GetString(3);
        }

        if (!VerifyPassword(request.MatKhau, storedPwd)) return null;

        // Lazy-upgrade legacy cleartext → hash
        if (!LooksHashed(storedPwd))
        {
            var newHash = BCrypt.Net.BCrypt.HashPassword(request.MatKhau);
            using var upd = new SqlCommand(
                "UPDATE web_xacthuc SET mat_khau = @h WHERE dien_thoai = @p", conn);
            upd.Parameters.Add("@h", SqlDbType.NVarChar, 200).Value = newHash;
            upd.Parameters.Add("@p", SqlDbType.NVarChar, 20).Value = dienThoai;
            try { upd.ExecuteNonQuery(); } catch { /* upgrade best-effort */ }
        }

        var isAdmin = IsAdmin(dienThoai);
        var token = GenerateJwtToken(dienThoai, idBenhNhan, tenBenhNhan, isAdmin);
        var user = new UserInfo(dienThoai, tenBenhNhan, "", idBenhNhan, isAdmin);
        return new LoginResponse(token, user);
    }

    public bool ChangePassword(string dienThoai, string oldPassword, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            throw new ArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");

        using var conn = new SqlConnection(_connStr);
        conn.Open();

        using var get = new SqlCommand(
            "SELECT TOP 1 mat_khau FROM web_xacthuc WHERE dien_thoai = @p", conn);
        get.Parameters.Add("@p", SqlDbType.NVarChar, 20).Value = dienThoai;
        var current = get.ExecuteScalar() as string ?? "";
        if (!VerifyPassword(oldPassword, current)) return false;

        var hash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        using var upd = new SqlCommand(
            "UPDATE web_xacthuc SET mat_khau = @h WHERE dien_thoai = @p", conn);
        upd.Parameters.Add("@h", SqlDbType.NVarChar, 200).Value = hash;
        upd.Parameters.Add("@p", SqlDbType.NVarChar, 20).Value = dienThoai;
        return upd.ExecuteNonQuery() > 0;
    }

    private static bool VerifyPassword(string plain, string stored)
    {
        if (string.IsNullOrEmpty(stored)) return false;
        if (LooksHashed(stored))
        {
            try { return BCrypt.Net.BCrypt.Verify(plain, stored); }
            catch { return false; }
        }
        return string.Equals(plain, stored, StringComparison.Ordinal);
    }

    private static bool LooksHashed(string s) =>
        !string.IsNullOrEmpty(s) &&
        (s.StartsWith("$2a$") || s.StartsWith("$2b$") || s.StartsWith("$2y$"));

    public ClaimsPrincipal? ValidateToken(string token)
    {
        var secret = _config["Jwt:Secret"]
            ?? throw new InvalidOperationException("Jwt:Secret not configured");
        var key = Encoding.UTF8.GetBytes(secret);
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

    private string GenerateJwtToken(string dienThoai, long idBenhNhan, string tenBenhNhan, bool isAdmin)
    {
        var secret = _config["Jwt:Secret"]
            ?? throw new InvalidOperationException("Jwt:Secret not configured");
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, dienThoai),
            new(ClaimTypes.Name, tenBenhNhan),
            new("dien_thoai", dienThoai),
            new("id_benhnhan", idBenhNhan.ToString()),
            new("is_admin", isAdmin ? "true" : "false"),
        };
        if (isAdmin) claims.Add(new Claim(ClaimTypes.Role, "Admin"));

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
