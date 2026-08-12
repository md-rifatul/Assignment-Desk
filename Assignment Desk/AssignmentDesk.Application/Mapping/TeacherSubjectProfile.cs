using AssignmentDesk.Application.Auth.DTOs;
using AssignmentDesk.Domain.Entities;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace AssignmentDesk.Application.Mapping
{
    public class TeacherSubjectProfile : Profile
    {
        public TeacherSubjectProfile()
        {
            CreateMap<AssignTeacherSubjectDto, TeacherSubject>();

            CreateMap<TeacherSubject, TeacherSubjectResponseDto>()
                .ForMember(d => d.SubjectId,
                    o => o.MapFrom(s => s.SubjectId))
                .ForMember(d => d.SubjectName,
                    o => o.MapFrom(s => s.Subject.Name));
        }
    }
}
