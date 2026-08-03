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
    public class TeacherSubjectRepository : Repository<TeacherSubject>, ITeacherSubjectRepository
    {
        public TeacherSubjectRepository(ApplicationDbContext context) : base(context)
        {
        }

        public Task<IEnumerable<Subject>> SearchAsync(string search)
        {
            throw new NotImplementedException();
        }
    }
}
