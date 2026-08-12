using AssignmentDesk.Domain.Enums;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Domain.Entities
{
    public class Assignment
    {
        public int Id { get; set; }

        public string Title { get; set; }

        public string Description { get; set; }

        public DateTime Deadline { get; set; }

        public decimal MaximumMarks { get; set; }

        public AssignmentStatus Status { get; set; }

        public int ClassId { get; set; }
        public Class Class { get; set; }

        public int SubjectId { get; set; }

        public Subject Subject { get; set; }

        public int TeacherId { get; set; }

        public User Teacher { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
