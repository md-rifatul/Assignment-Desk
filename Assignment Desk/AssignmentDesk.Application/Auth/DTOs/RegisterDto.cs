using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class RegisterDto
    {
        public string FullName { get; set; }

        public string Email { get; set; }

        public UserRole Role { get; set; }
    }
}
