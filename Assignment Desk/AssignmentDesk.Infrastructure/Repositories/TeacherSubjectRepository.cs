using AssignmentDesk.Application.Interfaces.IRepository;
using AssignmentDesk.Domain.Entities;
using AssignmentDesk.Infrastructure.Data;
using AssignmentDesk.Infrastructure.Repositories.Common;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Infrastructure.Repositories
{
    public class TeacherSubjectRepository : Repository<TeacherSubject>, ITeacherSubjectRepository
    {
        private readonly ApplicationDbContext _context;
        public TeacherSubjectRepository(ApplicationDbContext context) : base(context)
        {
            _context = context;
        }

        public async Task<int> GetSubjectCountByTeacherIdAsync(int teacherId)
        {
            return await _context.TeacherSubjects.CountAsync(x=>x.TeacherId == teacherId);
        }

        public Task<IEnumerable<Subject>> SearchAsync(string search)
        {
            throw new NotImplementedException();
        }
    }
}
