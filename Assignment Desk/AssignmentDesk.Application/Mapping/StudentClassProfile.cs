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
    public class StudentClassProfile : Profile
    {
        public StudentClassProfile()
        {
            CreateMap<CreateStudentClassDto, StudentClass>();

            CreateMap<StudentClass, StudentClassResponseDto>()
                .ForMember(d => d.StudentId,
                    o => o.MapFrom(s => s.StudentId))
                .ForMember(d => d.StudentName,
                    o => o.MapFrom(s => s.Student.FullName))
                                .ForMember(d => d.ClassName,
                    o => o.MapFrom(s => s.Class.Name));
        }
    }
}
