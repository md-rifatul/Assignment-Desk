using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Domain.Entities
{
    public class Submission
    {
        public int Id { get; set; }

        public int AssignmentId { get; set; }

        public Assignment Assignment { get; set; }

        public int StudentId { get; set; }

        public User Student { get; set; }

        public string FileUrl { get; set; }

        public decimal? Marks { get; set; }

        public string? Feedback { get; set; }

        public SubmissionStatus Status { get; set; }

        public DateTime SubmittedAt { get; set; }
    }
}
