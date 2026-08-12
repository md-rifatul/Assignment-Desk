using AssignmentDesk.Domain.Entities;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IJwtService
    {
        string GenerateToken(User user);
    }
}
