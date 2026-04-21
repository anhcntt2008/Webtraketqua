using HealthResultPortal.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace HealthResultPortal.Api.Controllers
{

    [ApiController]
    [Route("api/[controller]")]

    public class FileController : ControllerBase
    { 

        public IConfiguration Configuration { get; set; }
        public AppSettings _appSettings; 
        public FileController(IConfiguration configuration, IWebHostEnvironment env, IOptions<AppSettings> appIdentitySettingsAccessor)
        {
            Configuration = configuration;
            _appSettings = appIdentitySettingsAccessor.Value;
        }


        /// <summary>
        ///  Hàm thực hiện lấy File trên server
        /// </summary>
        /// <param name="Filepath"></param>
        /// <returns></returns>
        [HttpPost("GetFileResult")]
        public async Task<ActionResult<string>> GetFileResult([FromBody] FileData objFile)
        {
            ResponseFile responseFile = new ResponseFile();
            try
            {
                string FileGroup = "";
                FileGroup = objFile.FileGroup;
                string path = "";
                switch (FileGroup)
                {
                    case "XN":
                        path = _appSettings.Path_XN;
                        break;
                    case "CDHA":
                        path = _appSettings.Path_CDHA;
                        break;
                    case "FILE":
                        path = _appSettings.Path_FILE;
                        break;
                    default:
                        path =  _appSettings.Path_FILE;
                        break;
                }
                byte[] _byte = null;
                FileDetail audio = new FileDetail();

                if (!System.IO.File.Exists(path + objFile.FilePath))
                {
                    responseFile.IsSuccess = false;
                    responseFile.Messge = "Không tồn tại File Results";
                    objFile.FilePath = objFile.FilePath.Replace("_signed", "");
                    if (!System.IO.File.Exists(path + objFile.FilePath))
                    {
                        responseFile.IsSuccess = false;
                        responseFile.Messge = "Không tồn tại File Results";
                    }
                    else
                    {
                        _byte = System.IO.File.ReadAllBytes(path + objFile.FilePath);
                        responseFile.IsSuccess = true;
                        responseFile.Messge = "";
                    }

                }
                else
                {
                    _byte = System.IO.File.ReadAllBytes(path + objFile.FilePath);
                    responseFile.IsSuccess = true;
                    responseFile.Messge = "";
                }
                audio.fileName = path + objFile.FilePath;
                audio.fileByte = _byte;
                string aaa = Convert.ToBase64String(_byte, Base64FormattingOptions.None);
                responseFile.data = audio;
            }
            catch (Exception exception)
            {
                responseFile.IsSuccess = false;
                responseFile.Messge = exception.Message;
                responseFile.data = new FileDetail();
            }
            return new JsonResult(responseFile);
        }
    }
}
