using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class CreateAssignmentDto
    {
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public decimal MaximumMarks { get; set; }
        public int SubjectId { get; set; }
    }
}
