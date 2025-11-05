@echo off
echo ====================================
echo JD Labs Database Migration Tool
echo ====================================
echo.

REM Check if service role key is set
findstr /C:"NEW_SUPABASE_SERVICE_ROLE_KEY=" .env | findstr /V /C:"NEW_SUPABASE_SERVICE_ROLE_KEY=$" >nul
if %errorlevel% neq 0 (
    echo ERROR: NEW_SUPABASE_SERVICE_ROLE_KEY not found in .env file
    echo.
    echo Please follow these steps:
    echo 1. Go to: https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/settings/api
    echo 2. Copy the "service_role" key
    echo 3. Add it to your .env file:
    echo    NEW_SUPABASE_SERVICE_ROLE_KEY=your_key_here
    echo.
    pause
    exit /b 1
)

echo Checking dependencies...
call npm list @supabase/supabase-js >nul 2>&1
if %errorlevel% neq 0 (
    echo Installing required dependencies...
    call npm install @supabase/supabase-js dotenv
)

echo.
echo Starting migration...
echo.
echo This will:
echo   1. Test connections to both databases
echo   2. Export schema to schema-migration.sql
echo   3. Export auth users to auth-users-export.json
echo   4. Wait for you to apply schema in SQL Editor
echo   5. Migrate all data tables
echo.
echo Press Ctrl+C to cancel, or
pause

node migrate-database.js

if %errorlevel% equ 0 (
    echo.
    echo ====================================
    echo Migration completed successfully!
    echo ====================================
    echo.
    echo Next steps:
    echo 1. Review migration summary above
    echo 2. Test the application: npm start
    echo 3. Verify all features are working
    echo.
) else (
    echo.
    echo ====================================
    echo Migration failed!
    echo ====================================
    echo.
    echo Please check the error messages above
    echo Review MIGRATION-GUIDE.md for troubleshooting
    echo.
)

pause
