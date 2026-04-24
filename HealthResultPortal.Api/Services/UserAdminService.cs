using System.Data;
using HealthResultPortal.Api.Models;
using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Options;

namespace HealthResultPortal.Api.Services;

public interface IUserAdminService
{
    PagedUsers List(string? search, int page, int pageSize);
    bool ResetPassword(string dienThoai, string newPassword);
}

public class UserAdminService : IUserAdminService
{
    private readonly string _connStr;
    private readonly HashSet<string> _adminPhones;

    public UserAdminService(IConfiguration config, IOptions<AppSettings> appSettings)
    {
        _connStr = config.GetConnectionString("HISConnection")
            ?? throw new InvalidOperationException("Missing ConnectionStrings:HISConnection");
        _adminPhones = new HashSet<string>(
            appSettings.Value.Admins?.Where(x => !string.IsNullOrWhiteSpace(x)) ?? Array.Empty<string>(),
            StringComparer.OrdinalIgnoreCase);
    }

    public PagedUsers List(string? search, int page, int pageSize)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        using var conn = new SqlConnection(_connStr);
        conn.Open();

        var where = "";
        if (!string.IsNullOrWhiteSpace(search))
            where = "WHERE wx.dien_thoai LIKE @q OR kdb.ten_benhnhan LIKE @q";

        using var countCmd = new SqlCommand($@"
            SELECT COUNT(*)
            FROM web_xacthuc wx
            INNER JOIN kcb_danhsach_benhnhan kdb ON kdb.id_benhnhan = wx.id_benhnhan 
            
            {where} and  wx.dien_thoai != ''
        ", conn);
        if (!string.IsNullOrWhiteSpace(search))
            countCmd.Parameters.Add("@q", SqlDbType.NVarChar, 200).Value = $"%{search.Trim()}%";
        var total = Convert.ToInt32(countCmd.ExecuteScalar());

        using var listCmd = new SqlCommand($@"
            SELECT distinct wx.dien_thoai, wx.id_benhnhan, kdb.ten_benhnhan, kdb.nam_sinh, kdb.gioi_tinh, wx.mat_khau
            FROM web_xacthuc wx
            INNER JOIN kcb_danhsach_benhnhan kdb ON kdb.id_benhnhan = wx.id_benhnhan
            {where} and  wx.dien_thoai != ''
            ORDER BY wx.dien_thoai
            OFFSET @skip ROWS FETCH NEXT @take ROWS ONLY
        ", conn);
        if (!string.IsNullOrWhiteSpace(search))
            listCmd.Parameters.Add("@q", SqlDbType.NVarChar, 200).Value = $"%{search.Trim()}%";
        listCmd.Parameters.Add("@skip", SqlDbType.Int).Value = (page - 1) * pageSize;
        listCmd.Parameters.Add("@take", SqlDbType.Int).Value = pageSize;
        var items = new List<UserSummary>();

        using var reader = listCmd.ExecuteReader();
        while (reader.Read())
        {
            var phone = reader.IsDBNull(0) ? "" : reader.GetString(0);

            items.Add(new UserSummary(
                reader.IsDBNull(1) ? 0 : reader.GetInt64(1),
                phone,
                reader.IsDBNull(2) ? "" : reader.GetString(2),
                reader.IsDBNull(3) ? "" : reader[3].ToString(),
                reader.IsDBNull(4) ? "" : reader.GetString(4),
                reader.IsDBNull(5) ? "" : reader.GetString(5),
                _adminPhones.Contains(phone?.Trim())
            ));
        }
        return new PagedUsers(items, total);
    }

    public bool ResetPassword(string dienThoai, string newPassword)
    {
        if (string.IsNullOrWhiteSpace(dienThoai)) return false;
        if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            throw new ArgumentException("Mật khẩu mới phải có ít nhất 6 ký tự");

        var hash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        using var conn = new SqlConnection(_connStr);
        conn.Open();
        using var cmd = new SqlCommand(
            "UPDATE web_xacthuc SET mat_khau = @h WHERE dien_thoai = @p", conn);
        cmd.Parameters.Add("@h", SqlDbType.NVarChar, 200).Value = hash;
        cmd.Parameters.Add("@p", SqlDbType.NVarChar, 20).Value = dienThoai;
        return cmd.ExecuteNonQuery() > 0;
    }
}
