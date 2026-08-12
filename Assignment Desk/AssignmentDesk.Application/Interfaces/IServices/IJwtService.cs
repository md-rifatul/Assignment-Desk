using AssignmentDesk.Domain.Entities;
using System.Security.Claims;

namespace AssignmentDesk.Application.Interfaces.IServices
{
    public interface IJwtService
    {
        string GenerateToken(User user);
        string GenerateRefreshToken();
        ClaimsPrincipal GetPrincipalFromExpiredToken(string token);
    }
}
