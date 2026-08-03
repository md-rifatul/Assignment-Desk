using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Domain.Entities
{
    public class TeacherSubject
    {
        public int Id { get; set; }
        public int TeacherId { get; set; }

        public User Teacher { get; set; }

        public int SubjectId { get; set; }

        public Subject Subject { get; set; }
    }
}
