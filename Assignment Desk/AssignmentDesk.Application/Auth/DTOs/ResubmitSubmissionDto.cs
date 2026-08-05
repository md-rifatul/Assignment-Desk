using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class ResubmitSubmissionDto
    {
        public IFormFile PdfFile { get; set; }
    }
}
