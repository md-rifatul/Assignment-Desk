using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IEmailService
    {
        Task SendPasswordResetEmailAsync(string email, string resetLink);
        Task SendAccountActivationEmailAsync(string email,string fullName,string activationLink);
    }
}
  