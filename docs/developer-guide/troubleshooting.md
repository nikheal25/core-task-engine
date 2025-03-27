# Troubleshooting

This guide provides solutions for common issues you may encounter when working with the Core Task Engine project.

## Common Issues

### Application Won't Start

#### Issue: Port Already in Use

**Symptoms:**
- Error message: `EADDRINUSE: address already in use :::3000`

**Solutions:**
1. Find the process using the port:
   ```bash
   lsof -i :3000
   # or on Windows
   netstat -ano | findstr :3000
   ```

2. Kill the process:
   ```bash
   kill -9 <PID>
   # or on Windows
   taskkill /PID <PID> /F
   ```

3. Use a different port by setting the `PORT` environment variable:
   ```bash
   PORT=3001 pnpm run start:dev
   ```

#### Issue: Missing Dependencies

**Symptoms:**
- Error message: `Cannot find module '...'`

**Solutions:**
1. Reinstall dependencies:
   ```bash
   pnpm install
   ```

2. Clear pnpm cache:
   ```bash
   pnpm store prune
   pnpm install
   ```

### Docker Issues

#### Issue: Docker Container Fails to Start

**Symptoms:**
- Container exits immediately after starting
- Error in Docker logs

**Solutions:**
1. Check the logs:
   ```bash
   docker-compose logs
   ```

2. Ensure the environment variables are set correctly:
   ```bash
   cat .env.development
   ```

3. Try rebuilding the image:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

### Database Connection Issues

**Symptoms:**
- Error messages about database connection failures

**Solutions:**
1. Check database connection string in your environment file
2. Ensure database service is running (if using Docker)
3. Check network connectivity to the database

### Swagger Documentation Not Loading

**Symptoms:**
- Swagger UI doesn't load at `/api/docs`
- Blank page or 404 error

**Solutions:**
1. Ensure the application is running
2. Check that `SWAGGER_ENABLED` is set to `true` in your environment file
3. Verify there are no syntax errors in your controller decorators

### TypeScript Compilation Errors

**Symptoms:**
- Build fails with TypeScript errors

**Solutions:**
1. Check the error message and fix the reported issue
2. For missing types, install the required type packages:
   ```bash
   pnpm add -D @types/package-name
   ```
3. Ensure your tsconfig.json is correctly configured

### Test Failures

**Symptoms:**
- Unit tests or e2e tests failing

**Solutions:**
1. Run tests with more detailed logging:
   ```bash
   pnpm run test -- --verbose
   ```
2. Update test to match new implementation if the code was intentionally changed
3. Make sure your test environment has all required services mocked or available

## Debugging Tips

### Using NestJS Debug Mode

```bash
pnpm run start:debug
```

Then attach your debugger to the process (e.g., using VSCode's debugger).

### Logging

The application uses different log levels:

- `error`: For errors that need attention
- `warn`: For potentially harmful situations
- `log`: For general application info
- `debug`: For detailed debugging information
- `verbose`: For even more detailed information

You can increase log verbosity by modifying the logger configuration in `main.ts`.

### Docker Container Inspection

```bash
# Get a shell inside the container
docker-compose exec api sh

# Check environment variables
env | grep NODE

# Check installed packages
ls -la node_modules
```

## Getting Additional Help

If you can't resolve the issue using this troubleshooting guide:

1. Check the project's internal documentation on the company wiki
2. Contact the development team via the internal chat channel
3. Create an issue in the internal issue tracker with detailed information:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Logs and error messages
   - Environment details (OS, Node.js version, etc.) 