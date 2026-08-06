using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class StudentDashboardDto
    {
        public int MySubjects { get; set; }
        public int MyAssignments { get; set; }
        public int SubmissionStatus { get; set; }
    }
}
