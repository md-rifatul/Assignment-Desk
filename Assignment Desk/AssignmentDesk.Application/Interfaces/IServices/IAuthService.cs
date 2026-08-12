using AssignmentDesk.Application.Auth.DTOs;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IAuthService
    {
        Task ForgotPassword(ForgotPasswordDto dto);
        Task ResetPassword(ResetPasswordDto dto);
        Task ActivateAccount(ActivateAccountDto dto);
    }
}
