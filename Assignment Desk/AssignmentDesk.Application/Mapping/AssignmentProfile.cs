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
    public class AssignmentProfile : Profile
    {
        public AssignmentProfile()
        {
            CreateMap<CreateAssignmentDto, Assignment>();

            CreateMap<UpdateAssignmentDto, Assignment>();

            CreateMap<Assignment, AssignmentResponseDto>();
        }
    }
}
