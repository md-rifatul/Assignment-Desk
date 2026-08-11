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
    public class SubmissionProfile : Profile
    {
        public SubmissionProfile()
        {
            CreateMap<CreateSubmissionDto, Submission>()
                .ForMember(dest => dest.Id, opt => opt.Ignore())
                .ForMember(dest => dest.StudentId, opt => opt.Ignore())
                .ForMember(dest => dest.Student, opt => opt.Ignore())
                .ForMember(dest => dest.Assignment, opt => opt.Ignore())
                .ForMember(dest => dest.FileUrl, opt => opt.Ignore())
                .ForMember(dest => dest.SubmittedAt, opt => opt.Ignore())
                .ForMember(dest => dest.Status, opt => opt.Ignore())
                .ForMember(dest => dest.Marks, opt => opt.Ignore())
                .ForMember(dest => dest.Feedback, opt => opt.Ignore());


            CreateMap<Submission, SubmissionResponseDto>()
                .ForMember(d => d.StudentName,
                    o => o.MapFrom(s => s.Student.FullName))

                .ForMember(d => d.AssignmentTitle,
                    o => o.MapFrom(s => s.Assignment.Title))

                .ForMember(d => d.SubjectName,
                    o => o.MapFrom(s => s.Assignment.Subject.Name))
                .ForMember(d => d.ClassName,
                    o => o.MapFrom(s => s.Assignment.Class.Name));
        }
    }
}
