# Interview Results Testing - Quick Start Guide

A step-by-step guide to test the interview results storage and processing system.

## 📋 What Was Fixed?

The interview results processing had several bugs that have been fixed:

1. ✅ **Q&A Storage**: Questions and answers now stored with proper ordering and timestamps
2. ✅ **Duration Tracking**: Interview duration now calculated and stored
3. ✅ **Score Storage**: Overall performance score now reflected in interview record
4. ✅ **Complete Feedback**: Performance reports include detailed metrics
5. ✅ **Error Handling**: Better error messages and graceful degradation
6. ✅ **Audit Logging**: All operations logged with context

## 🚀 Quick Start (5 minutes)

### Step 1: Verify Database Connection
```bash
# Test database without starting the app
node test-database-operations.js
```

**Expected Output**: ✅ All database tests pass

---

### Step 2: Start the Application
```bash
npm run dev
# App starts on http://localhost:3000
```

**Wait for**: "VITE v..." and "Local: http://localhost:3000"

---

### Step 3: Run Interview Flow Tests
```bash
# In a new terminal
node test-interview-flow.js
```

**Expected Output**:
- ✅ Homepage loads
- ✅ Interview setup form accessible
- ✅ Interview questions visible
- ✅ Review screen accessible
- ✅ Database tables validated

---

### Step 4: Check Test Results
```bash
# Look at generated screenshots and logs
ls test-results/
# Should show:
# - interview-01-homepage.png
# - interview-02-setup-screen.png
# - interview-03-form-filled.png
# - interview-04-interview-screen.png
# - interview-05-completion.png
# - videos/
```

---

## 🧪 Running All Tests

### Option 1: Run All Tests Automatically
```bash
node run-all-tests.js
```

This will:
1. ✅ Test database connectivity and schema
2. ✅ Test interview UI flow end-to-end
3. ✅ Generate screenshots and videos
4. ✅ Create final summary report

**Total Time**: ~3-5 minutes

### Option 2: Run Tests with npm
```bash
npm run test:db          # Database only
npm run test:interview   # Interview flow only
npm run test:all         # All tests
```

---

## 🔍 Understanding Test Results

### Database Test (test-database-operations.js)

**What it checks**:
- ✅ Supabase connection works
- ✅ All tables accessible
- ✅ Required columns present
- ✅ Sample data retrievable
- ✅ Foreign key relationships intact
- ✅ Audit logs functional

**If it fails**:
- Check Supabase credentials in supabaseService.ts
- Verify database migrations are applied
- Check network connectivity

---

### Interview Flow Test (test-interview-flow.js)

**What it tests**:
1. Navigate to homepage
2. Fill interview setup form
3. Select interview options
4. Proceed to interview screen
5. Submit answers
6. Complete interview
7. View review/feedback

**If it fails**:
- Ensure app is running on localhost:3000
- Check browser console for errors
- Verify form elements are rendered
- Check that Gemini API is configured

---

## 📊 Test Results Location

All test results saved in `test-results/`:

```
test-results/
├── videos/                          # Browser recordings
│   └── [timestamp]-video.webm      # Full interview flow recording
├── interview-01-homepage.png        # Homepage screenshot
├── interview-02-setup-screen.png    # Setup form
├── interview-03-form-filled.png     # Completed form
├── interview-04-interview-screen.png # Interview in progress
└── interview-05-completion.png      # Completion view
```

---

## ✅ Validation Checklist

After running tests, verify:

- [ ] Database tests show ✅ all passed
- [ ] Interview flow tests show ✅ all passed
- [ ] Screenshots exist for all steps
- [ ] Video recording captures full flow
- [ ] No error messages in console

---

## 🐛 Troubleshooting

### Issue: "Cannot find module 'playwright'"
```bash
npm install playwright
```

### Issue: "Database connection failed"
Check that:
- Supabase URL is correct (in supabaseService.ts:7)
- Anon key is valid (in supabaseService.ts:8)
- Database is running and accessible
- Network allows Supabase access

### Issue: "Port 3000 already in use"
```bash
# Kill existing process
# Linux/Mac:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: "Cannot find login button"
- App may auto-login
- Try navigating directly to /interview
- Check if you need to create a test account first

### Issue: "Test times out waiting for elements"
- App may be loading slowly
- Increase timeout in test files (change 5000 to 10000)
- Check browser console for errors
- Verify Gemini API is working

---

## 📈 Expected Results

### Database Tests ✅
```
✓ Database connection established
✓ Interviews table structure valid
✓ Interview questions table accessible
✓ Interview answers table accessible
✓ Performance reports accessible
✓ Audit logging functional
✓ Storage bucket configured

PASSED: 7/7
```

### Interview Flow Tests ✅
```
✓ Homepage loaded successfully
✓ Start Interview button visible
✓ Candidate name field filled
✓ Position field filled
✓ Job description filled
✓ Difficulty level selected
✓ Successfully navigated to interview screen
✓ Interview questions visible
✓ Answer input field works
✓ Answer submission works
✓ Interview completion flow accessible
✓ Review screen accessible

PASSED: 12/12
```

---

## 🎯 What Each Test File Does

### test-database-operations.js
- **Duration**: ~30 seconds
- **Requires**: Running Supabase (no app needed)
- **Tests**: 8 database-related checks
- **Output**: Pass/fail for each operation

### test-interview-flow.js
- **Duration**: ~2-3 minutes
- **Requires**: App running on localhost:3000
- **Tests**: UI flow + database schema
- **Output**: Screenshots + database validation

### run-all-tests.js
- **Duration**: ~3-5 minutes
- **Requires**: App running on localhost:3000
- **Tests**: All tests in sequence
- **Output**: Combined summary report

---

## 🔄 Next Steps After Testing

1. **View Results**: Check test-results/ directory
2. **Review Logs**: Look at console output
3. **Check Database**: Query interview results:
   ```sql
   SELECT * FROM interviews ORDER BY created_at DESC LIMIT 5;
   SELECT * FROM interview_questions LIMIT 5;
   SELECT * FROM interview_answers LIMIT 5;
   SELECT * FROM performance_reports ORDER BY created_at DESC LIMIT 5;
   ```
4. **Test Live**: Create a real interview and verify data is stored
5. **Monitor Logs**: Check audit_logs table for all operations

---

## 💡 Tips for Success

1. **Start with database tests** (faster, no UI)
2. **Check browser console** while tests run (helps debug)
3. **Watch the Playwright video** if tests fail (shows exact interaction)
4. **Run tests multiple times** to verify consistency
5. **Check database directly** if tests pass but data isn't there

---

## 📞 Need Help?

1. Read [INTERVIEW_FIXES_AND_TESTS.md](./INTERVIEW_FIXES_AND_TESTS.md) for detailed information
2. Check test console output for specific error messages
3. Review video recordings in test-results/videos/ to see exact steps
4. Check browser console (F12) for JavaScript errors
5. Verify all environment variables are set correctly

---

## 📝 Quick Commands Reference

```bash
# Test database only
node test-database-operations.js

# Test interview flow
node test-interview-flow.js

# Run all tests
node run-all-tests.js

# Start dev server
npm run dev

# Clean test results
rm -rf test-results/
```

---

**Status**: ✅ Ready to Test
**Last Updated**: 2025-11-02
**Test Version**: 1.0
