using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;
using AssignmentDesk.Domain.Exceptions;

namespace Assignment_Desk.Middleware
{
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<GlobalExceptionMiddleware> _logger;

        public GlobalExceptionMiddleware(RequestDelegate next, ILogger<GlobalExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);

                // Handle status code responses that didn't throw exceptions (e.g. 401 from JWT Auth, 404 for missing routes)
                if (!context.Response.HasStarted && (context.Response.StatusCode == 401 || context.Response.StatusCode == 403 || context.Response.StatusCode == 404))
                {
                    await HandleStatusCodeOnlyAsync(context);
                }
            }
            catch (Exception ex)
            {
                await HandleExceptionAsync(context, ex);
            }
        }

        private async Task HandleStatusCodeOnlyAsync(HttpContext context)
        {
            var statusCode = context.Response.StatusCode;
            var message = statusCode switch
            {
                StatusCodes.Status401Unauthorized => "Unauthorized access.",
                StatusCodes.Status403Forbidden => "Forbidden access.",
                StatusCodes.Status404NotFound => "Resource not found.",
                _ => "An error occurred."
            };

            context.Response.ContentType = "application/json";

            var response = new
            {
                success = false,
                message = message,
                statusCode = statusCode
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception exception)
        {
            var statusCode = StatusCodes.Status500InternalServerError;
            var message = "An unexpected error occurred.";

            switch (exception)
            {
                case NotFoundException notFoundEx:
                    statusCode = StatusCodes.Status404NotFound;
                    message = notFoundEx.Message;
                    break;

                case BadRequestException badRequestEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = badRequestEx.Message;
                    break;

                case UnauthorizedException unauthorizedEx:
                    statusCode = StatusCodes.Status401Unauthorized;
                    message = unauthorizedEx.Message;
                    break;

                case ForbiddenException forbiddenEx:
                    statusCode = StatusCodes.Status403Forbidden;
                    message = forbiddenEx.Message;
                    break;

                case KeyNotFoundException keyNotFoundEx:
                    statusCode = StatusCodes.Status404NotFound;
                    message = keyNotFoundEx.Message;
                    break;

                case ArgumentNullException argNullEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = argNullEx.Message;
                    break;

                case ArgumentException argEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = argEx.Message;
                    break;

                case InvalidOperationException invOpEx:
                    statusCode = StatusCodes.Status400BadRequest;
                    message = invOpEx.Message;
                    break;

                default:
                    // Log unexpected exception on server side
                    _logger.LogError(exception, "An unhandled exception occurred: {Message}", exception.Message);
                    break;
            }

            context.Response.ContentType = "application/json";
            context.Response.StatusCode = statusCode;

            var response = new
            {
                success = false,
                message = message,
                statusCode = statusCode
            };

            var json = JsonSerializer.Serialize(response);
            await context.Response.WriteAsync(json);
        }
    }
}
