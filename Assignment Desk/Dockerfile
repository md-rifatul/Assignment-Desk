# Stage 1: Build Stage
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copy the solution and project files first to restore dependencies (for caching advantages)
COPY ["Assignment Desk.sln", "./"]
COPY ["Assignment Desk/AssignmentDesk.Api.csproj", "Assignment Desk/"]
COPY ["AssignmentDesk.Application/AssignmentDesk.Application.csproj", "AssignmentDesk.Application/"]
COPY ["AssignmentDesk.Domain/AssignmentDesk.Domain.csproj", "AssignmentDesk.Domain/"]
COPY ["AssignmentDesk.Infrastructure/AssignmentDesk.Infrastructure.csproj", "AssignmentDesk.Infrastructure/"]

# Restore NuGet packages
RUN dotnet restore "Assignment Desk/AssignmentDesk.Api.csproj"

# Copy the remaining source files
COPY . .

# Build and publish the API project in Release mode
WORKDIR "/src/Assignment Desk"
RUN dotnet publish "AssignmentDesk.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Stage 2: Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app
COPY --from=build /app/publish .

# Expose port 8080 (ASP.NET Core 8.0 default port)
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Bypass inotify limits on shared hosting (Render)
ENV DOTNET_USE_POLLING_FILE_WATCHER=true
ENV ASPNETCORE_hostBuilder__reloadConfigOnChange=false

ENTRYPOINT ["dotnet", "AssignmentDesk.Api.dll"]
