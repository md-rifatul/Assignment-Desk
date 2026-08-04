using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class CreateSubmissionDto
    {
        public int AssignmentId { get; set; }
        public IFormFile PdfFile { get; set; }
    }
}
