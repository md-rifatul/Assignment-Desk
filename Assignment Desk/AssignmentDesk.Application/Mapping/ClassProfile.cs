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
    public class ClassProfile : Profile
    {
        public ClassProfile()
        {
            CreateMap<CreateClassDto, Class>();

            CreateMap<Class, ClassResponseDto>();
        }
    }
}
