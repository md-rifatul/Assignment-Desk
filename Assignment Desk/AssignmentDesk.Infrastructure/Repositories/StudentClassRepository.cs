using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories.Common;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories
{
    public class StudentClassRepository : Repository<StudentClass>, IStudentClassRepository
    {
        public StudentClassRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<IEnumerable<StudentClass>> SearchAsync(string search)
        {
            throw new NotImplementedException();
        }
    }
}
