using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Auth.DTOs
{
    public class SubmissionResponseDto
    {
        public int Id { get; set; }
        public int AssignmentId { get; set; }
        public string FileUrl { get; set; }
        public DateTime SubmittedAt { get; set; }
        public AssignmentStatus Status { get; set; }
        public decimal? Marks { get; set; }
        public string? Feedback { get; set; }
    }
}
