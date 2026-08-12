using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Domain.Entities
{
    public class StudentClass
    {
        public int Id { get; set; }
        public int StudentId { get; set; }

        public User Student { get; set; }

        public int ClassId { get; set; }

        public Class Class { get; set; }
    }
}
