using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class AssignmentResponseDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime Deadline { get; set; }
        public decimal MaximumMarks { get; set; }
        public AssignmentStatus Status { get; set; }
        public string ClassName { get; set; }
        public int ClassId { get; set; }
        public string TeacherName { get; set; }
        public string SubjectName { get; set; }
        public int SubjectId { get; set; }
        public int TeacherId { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
