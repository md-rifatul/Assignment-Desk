using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Domain.Entities
{
    public class Subject
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public int ClassId { get; set; }

        public Class Class { get; set; }

        public ICollection<TeacherSubject> TeacherSubjects { get; set; }

        public ICollection<Assignment> Assignments { get; set; }
    }
}
