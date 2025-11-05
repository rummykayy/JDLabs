@echo off
cls
echo.
echo ============================================================
echo    JD Labs Database Setup - Quick Start
echo ============================================================
echo.
echo This script will help you complete the database setup.
echo.
echo Current Status:
echo   [X] TypeScript types fixed
echo   [X] Configuration files updated
echo   [X] Migration scripts created
echo   [X] Storage and RLS scripts created
echo   [X] Test scripts created
echo.
echo What's Next:
echo   [ ] Apply storage and RLS setup (Step 1)
echo   [ ] Test database (Step 2)
echo   [ ] Build and test application (Step 3)
echo.
echo ============================================================
echo.

:menu
echo Please choose an option:
echo.
echo   1 - View instructions for applying storage/RLS setup
echo   2 - Run database tests
echo   3 - Build application
echo   4 - Start application
echo   5 - Run all tests and start application
echo   6 - View troubleshooting guide
echo   0 - Exit
echo.
set /p choice="Enter your choice (0-6): "

if "%choice%"=="0" goto :end
if "%choice%"=="1" goto :show_sql_instructions
if "%choice%"=="2" goto :run_tests
if "%choice%"=="3" goto :build_app
if "%choice%"=="4" goto :start_app
if "%choice%"=="5" goto :run_all
if "%choice%"=="6" goto :show_troubleshooting

echo Invalid choice. Please try again.
echo.
goto :menu

:show_sql_instructions
cls
echo.
echo ============================================================
echo    STEP 1: Apply Storage and RLS Setup
echo ============================================================
echo.
echo CRITICAL: This step fixes the language loading issue!
echo.
echo Instructions:
echo.
echo   1. Open Supabase SQL Editor in your browser:
echo      https://supabase.com/dashboard/project/vwlfkdlabssnildaztvo/sql/new
echo.
echo   2. Open the file: setup-storage-and-rls.sql
echo.
echo   3. Copy the ENTIRE contents of the file
echo.
echo   4. Paste into the SQL Editor
echo.
echo   5. Click the "Run" button
echo.
echo   6. Wait for completion (should take 2-5 seconds)
echo.
echo   7. Verify you see "Success. No rows returned"
echo.
echo This creates:
echo   - Storage buckets for interview recordings
echo   - RLS policies for all tables
echo   - Fixes language dropdown loading
echo.
echo ============================================================
echo.
pause
goto :menu

:run_tests
cls
echo.
echo ============================================================
echo    Running Database Tests
echo ============================================================
echo.

REM Check if node_modules exists
if not exist node_modules (
    echo Installing dependencies...
    call npm install @supabase/supabase-js dotenv
    echo.
)

echo Running test suite...
echo.
node test-database-setup.js

echo.
echo ============================================================
pause
goto :menu

:build_app
cls
echo.
echo ============================================================
echo    Building Application
echo ============================================================
echo.

call npm run build

echo.
echo ============================================================
pause
goto :menu

:start_app
cls
echo.
echo ============================================================
echo    Starting Application
echo ============================================================
echo.
echo Server will start on http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ============================================================
echo.

call npm start

pause
goto :menu

:run_all
cls
echo.
echo ============================================================
echo    Running Complete Setup Verification
echo ============================================================
echo.

echo Step 1: Installing dependencies...
call npm install @supabase/supabase-js dotenv
echo.

echo Step 2: Running database tests...
node test-database-setup.js
echo.

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo WARNING: Some tests failed!
    echo ========================================
    echo.
    echo Please review the test output above.
    echo Make sure you've run setup-storage-and-rls.sql first.
    echo.
    pause
    goto :menu
)

echo Step 3: Building application...
call npm run build
echo.

if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo ERROR: Build failed!
    echo ========================================
    echo.
    pause
    goto :menu
)

echo.
echo ============================================================
echo    ALL TESTS PASSED!
echo ============================================================
echo.
echo Your database is set up correctly.
echo.
echo Starting application...
echo Server will be available at http://localhost:3000
echo.
echo Press Ctrl+C to stop the server
echo.
pause

call npm start

pause
goto :menu

:show_troubleshooting
cls
echo.
echo ============================================================
echo    Troubleshooting Guide
echo ============================================================
echo.
echo Problem: Languages not loading
echo Solution: Make sure you ran setup-storage-and-rls.sql
echo           This adds the RLS policy for public access to languages
echo.
echo Problem: Storage bucket errors
echo Solution: Run setup-storage-and-rls.sql to create buckets
echo.
echo Problem: Database connection errors
echo Solution: Check .env file has correct credentials
echo           SUPABASE_URL and SUPABASE_ANON_KEY
echo.
echo Problem: Cannot create interviews
echo Solution: Make sure user is logged in
echo           Run database tests to verify setup
echo.
echo For detailed troubleshooting, see:
echo   DATABASE-SETUP-COMPLETE.md
echo.
echo ============================================================
pause
goto :menu

:end
echo.
echo Thank you for using JD Labs Database Setup!
echo.
echo For complete documentation, see:
echo   - DATABASE-SETUP-COMPLETE.md
echo   - MIGRATION-GUIDE.md
echo.
pause
exit /b 0
