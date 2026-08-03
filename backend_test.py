#!/usr/bin/env python3
"""
Backend verification for User Profile feature
Tests all profile endpoints + regression tests + code review
"""
import requests
import json
import sys

BASE_URL = "http://localhost:3000/api"
ADMIN_PASSWORD = "Sw@ps9409"

def test_health_check():
    """Test 1: Sanity — health check"""
    print("\n=== Test 1: Health Check ===")
    try:
        r = requests.get(f"{BASE_URL.replace('/api', '')}/api", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert data.get('ok') == True, "Expected ok:true"
        assert data.get('app') == 'LoanLaabh', "Expected app:LoanLaabh"
        print("✅ PASS: Health check working")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_keepalive():
    """Test 2: Sanity — keepalive"""
    print("\n=== Test 2: Keepalive ===")
    try:
        r = requests.get(f"{BASE_URL}/keepalive", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 200, f"Expected 200, got {r.status_code}"
        assert data.get('db') == 'alive', "Expected db:alive"
        print("✅ PASS: Keepalive working, Supabase is alive")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_profile_get_auth_guard():
    """Test 3: Auth guard on GET /api/profile"""
    print("\n=== Test 3: GET /api/profile WITHOUT auth ===")
    try:
        r = requests.get(f"{BASE_URL}/profile", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        assert data.get('error') == 'Unauthorized', "Expected error:Unauthorized"
        print("✅ PASS: Auth guard working on GET /api/profile")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_profile_patch_auth_guard():
    """Test 4: Auth guard on PATCH /api/profile"""
    print("\n=== Test 4: PATCH /api/profile WITHOUT auth ===")
    try:
        r = requests.patch(f"{BASE_URL}/profile", json={"full_name": "Test"}, timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        assert data.get('error') == 'Unauthorized', "Expected error:Unauthorized"
        print("✅ PASS: Auth guard working on PATCH /api/profile")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_profile_delete_request_auth_guard():
    """Test 5: Auth guard on POST /api/profile/delete-request"""
    print("\n=== Test 5: POST /api/profile/delete-request WITHOUT auth ===")
    try:
        r = requests.post(f"{BASE_URL}/profile/delete-request", timeout=10)
        print(f"Status: {r.status_code}")
        data = r.json()
        print(f"Response: {json.dumps(data, indent=2)}")
        
        assert r.status_code == 401, f"Expected 401, got {r.status_code}"
        assert data.get('error') == 'Unauthorized', "Expected error:Unauthorized"
        print("✅ PASS: Auth guard working on POST /api/profile/delete-request")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_code_review_merged_profile():
    """Test 6: Code review of merged profile logic"""
    print("\n=== Test 6: Code Review — Merged Profile Logic ===")
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            code = f.read()
        
        # Find GET /api/profile handler
        if "route === '/profile' && method === 'GET'" not in code:
            print("❌ FAIL: GET /api/profile handler not found")
            return False
        
        checks = [
            ("id: user.id", "Returns id from user session"),
            ("email: user.email", "Returns email from user session"),
            ("full_name: profile?.full_name || latestLead?.full_name", "full_name fallback to lead"),
            ("phone: profile?.phone || latestLead?.mobile", "phone fallback to lead mobile"),
            ("dob: profile?.dob || latestLead?.dob", "dob fallback to lead"),
            ("gender: profile?.gender || latestLead?.gender", "gender fallback to lead"),
            ("pan: profile?.pan || latestLead?.pan", "pan fallback to lead"),
            ("city: profile?.city || latestLead?.city", "city fallback to lead"),
            ("pin_code: profile?.pin_code || latestLead?.pin_code", "pin_code fallback to lead"),
            ("occupation_type: profile?.occupation_type || latestLead?.employment_type", "occupation_type fallback to employment_type"),
            ("employer_name: profile?.employer_name || latestLead?.salary_account_bank", "employer_name fallback to salary_account_bank"),
            ("total_experience_years: profile?.total_experience_years ?? latestLead?.total_experience_years", "total_experience_years fallback"),
            ("notif_sms: profile?.notif_sms ?? true", "notif_sms defaults to true"),
            ("notif_email: profile?.notif_email ?? true", "notif_email defaults to true"),
            ("notif_whatsapp: profile?.notif_whatsapp ?? true", "notif_whatsapp defaults to true"),
            ("deletion_requested_at: profile?.deletion_requested_at", "deletion_requested_at returned"),
        ]
        
        all_passed = True
        for check_str, desc in checks:
            if check_str in code:
                print(f"  ✅ {desc}")
            else:
                print(f"  ❌ MISSING: {desc}")
                all_passed = False
        
        if all_passed:
            print("✅ PASS: Merged profile logic verified")
            return True
        else:
            print("❌ FAIL: Some checks failed")
            return False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_code_review_patch_normalization():
    """Test 7: Code review of PATCH /api/profile normalization"""
    print("\n=== Test 7: Code Review — PATCH Normalization ===")
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            code = f.read()
        
        # Find PATCH /api/profile handler
        if "route === '/profile' && method === 'PATCH'" not in code:
            print("❌ FAIL: PATCH /api/profile handler not found")
            return False
        
        checks = [
            ("const allowed = ['full_name','phone','dob','gender','pan','address','city','pin_code',", "Allow-list defined"),
            ("'occupation_type','employer_name','work_email','office_number','work_address',", "Work fields in allow-list"),
            ("'total_experience_years','notif_sms','notif_email','notif_whatsapp']", "Notification prefs in allow-list"),
            ("patch.phone = String(patch.phone).replace(/\\D/g, '').slice(0, 10)", "phone normalized to digits, max 10"),
            ("patch.pan = String(patch.pan).toUpperCase().slice(0, 10)", "pan uppercased, max 10"),
            ("patch.pin_code = String(patch.pin_code).replace(/\\D/g, '').slice(0, 6)", "pin_code digits only, max 6"),
            ("patch.work_email = String(patch.work_email).toLowerCase().trim()", "work_email lowercased + trimmed"),
            ("patch.gender = String(patch.gender).toLowerCase().trim()", "gender lowercased"),
            ("if (patch.dob === '') patch.dob = null", "Empty dob becomes null"),
            ("if (k in patch) patch[k] = !!patch[k]", "notif_* coerced to booleans"),
            ("upsert(upsertRow, { onConflict: 'id' })", "Uses upsert with onConflict:id"),
            ("while (error && /column .* does not exist|schema cache/i.test", "Auto-heal loop for missing columns"),
        ]
        
        all_passed = True
        for check_str, desc in checks:
            if check_str in code:
                print(f"  ✅ {desc}")
            else:
                print(f"  ❌ MISSING: {desc}")
                all_passed = False
        
        # Check that email is NOT in allowed list
        if "'email'" not in code[code.find("const allowed = ["):code.find("const allowed = [") + 300]:
            print(f"  ✅ email NOT in allow-list (locked)")
        else:
            print(f"  ❌ email should NOT be in allow-list")
            all_passed = False
        
        if all_passed:
            print("✅ PASS: PATCH normalization logic verified")
            return True
        else:
            print("❌ FAIL: Some checks failed")
            return False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_code_review_delete_request():
    """Test 8: Code review of delete-request"""
    print("\n=== Test 8: Code Review — Delete Request ===")
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            code = f.read()
        
        # Find POST /api/profile/delete-request handler
        if "route === '/profile/delete-request' && method === 'POST'" not in code:
            print("❌ FAIL: POST /api/profile/delete-request handler not found")
            return False
        
        checks = [
            ("deletion_requested_at: new Date().toISOString()", "Sets deletion_requested_at timestamp"),
            ("upsert({ id: user.id, email: user.email, deletion_requested_at", "Uses upsert (soft delete)"),
            ("return cors(NextResponse.json({ ok: true, requested_at:", "Returns ok:true with requested_at"),
        ]
        
        all_passed = True
        for check_str, desc in checks:
            if check_str in code:
                print(f"  ✅ {desc}")
            else:
                print(f"  ❌ MISSING: {desc}")
                all_passed = False
        
        # Verify it does NOT actually delete
        delete_section = code[code.find("route === '/profile/delete-request'"):code.find("route === '/profile/delete-request'") + 1000]
        if ".delete()" not in delete_section:
            print(f"  ✅ Does NOT actually delete data (soft delete)")
        else:
            print(f"  ❌ Should NOT use .delete() — soft delete only")
            all_passed = False
        
        if all_passed:
            print("✅ PASS: Delete-request logic verified")
            return True
        else:
            print("❌ FAIL: Some checks failed")
            return False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_regression_existing_endpoints():
    """Test 9: Regression — existing endpoints unaffected"""
    print("\n=== Test 9: Regression Tests ===")
    try:
        # Admin login
        print("  Testing admin login...")
        r = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
        assert r.status_code == 200, f"Admin login failed: {r.status_code}"
        cookie = r.cookies.get('loanlaabh_admin')
        assert cookie == 'ok', "Admin cookie not set"
        print(f"  ✅ Admin login working")
        
        # GET /api/leads
        print("  Testing GET /api/leads...")
        r = requests.get(f"{BASE_URL}/leads", cookies={'loanlaabh_admin': 'ok'}, timeout=10)
        assert r.status_code == 200, f"GET /api/leads failed: {r.status_code}"
        data = r.json()
        assert 'leads' in data, "Expected leads array"
        print(f"  ✅ GET /api/leads working ({len(data['leads'])} leads)")
        
        # GET /api/lender-criteria
        print("  Testing GET /api/lender-criteria...")
        r = requests.get(f"{BASE_URL}/lender-criteria", cookies={'loanlaabh_admin': 'ok'}, timeout=10)
        assert r.status_code == 200, f"GET /api/lender-criteria failed: {r.status_code}"
        data = r.json()
        assert 'lenders' in data, "Expected lenders array"
        print(f"  ✅ GET /api/lender-criteria working ({len(data['lenders'])} lenders)")
        
        # GET /api/lead-captures
        print("  Testing GET /api/lead-captures...")
        r = requests.get(f"{BASE_URL}/lead-captures", cookies={'loanlaabh_admin': 'ok'}, timeout=10)
        assert r.status_code == 200, f"GET /api/lead-captures failed: {r.status_code}"
        data = r.json()
        assert 'lead_captures' in data, "Expected lead_captures array"
        print(f"  ✅ GET /api/lead-captures working ({len(data['lead_captures'])} captures)")
        
        # POST /api/leads/capture (public)
        print("  Testing POST /api/leads/capture...")
        r = requests.post(f"{BASE_URL}/leads/capture", json={
            "full_name": "Test User Profile",
            "mobile": "9999888877",
            "email": "testprofile@example.com",
            "consent": True,
            "source_cta": "test_profile_regression"
        }, timeout=10)
        assert r.status_code == 200, f"POST /api/leads/capture failed: {r.status_code}"
        data = r.json()
        assert data.get('ok') == True, "Expected ok:true"
        print(f"  ✅ POST /api/leads/capture working (lead_id: {data.get('lead_id')})")
        
        print("✅ PASS: All regression tests passed")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_code_review_eligibility_form_new_fields():
    """Test 10: Code review — eligibility form now accepts dob, gender, pin_code"""
    print("\n=== Test 10: Code Review — Eligibility Form New Fields ===")
    try:
        with open('/app/app/api/[[...path]]/route.js', 'r') as f:
            code = f.read()
        
        # Find POST /api/leads handler
        if "route === '/leads' && method === 'POST'" not in code:
            print("❌ FAIL: POST /api/leads handler not found")
            return False
        
        checks = [
            ("dob: b.dob || null", "dob field added to lead object"),
            ("gender: b.gender ? String(b.gender).toLowerCase() : null", "gender field added with normalization"),
            ("pin_code: b.pin_code ? String(b.pin_code).replace(/\\D/g, '').slice(0, 6) : null", "pin_code field added with normalization"),
            ("while (e1 && /column .* does not exist|schema cache/i.test", "Auto-heal loop present (Attempt 3 pattern)"),
            ("pan: lead.pan, dob: lead.dob, gender: lead.gender, pin_code: lead.pin_code", "Profile upsert includes new fields"),
            ("occupation_type: lead.employment_type", "Profile upsert includes occupation_type"),
            ("employer_name: lead.salary_account_bank", "Profile upsert includes employer_name"),
            ("total_experience_years: lead.total_experience_years", "Profile upsert includes total_experience_years"),
        ]
        
        all_passed = True
        for check_str, desc in checks:
            if check_str in code:
                print(f"  ✅ {desc}")
            else:
                print(f"  ❌ MISSING: {desc}")
                all_passed = False
        
        # Check profile upsert has its own auto-heal loop
        profile_section = code[code.find("const profileRow = {"):code.find("const profileRow = {") + 2000]
        if "while (pe && /column .* does not exist|schema cache/i.test" in profile_section:
            print(f"  ✅ Profile upsert has its own auto-heal loop")
        else:
            print(f"  ❌ MISSING: Profile upsert auto-heal loop")
            all_passed = False
        
        if all_passed:
            print("✅ PASS: Eligibility form new fields verified")
            return True
        else:
            print("❌ FAIL: Some checks failed")
            return False
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def test_cors_headers():
    """Test 11: CORS headers on profile endpoints"""
    print("\n=== Test 11: CORS Headers ===")
    try:
        # Test on 401 response (GET /api/profile without auth)
        r = requests.get(f"{BASE_URL}/profile", timeout=10)
        cors_header = r.headers.get('access-control-allow-origin')
        print(f"  GET /api/profile (401): access-control-allow-origin = {cors_header}")
        assert cors_header == '*', f"Expected *, got {cors_header}"
        print(f"  ✅ CORS headers present on 401 response")
        
        # Test on 200 response (health check)
        r = requests.get(f"{BASE_URL.replace('/api', '')}/api", timeout=10)
        cors_header = r.headers.get('access-control-allow-origin')
        print(f"  GET /api (200): access-control-allow-origin = {cors_header}")
        assert cors_header == '*', f"Expected *, got {cors_header}"
        print(f"  ✅ CORS headers present on 200 response")
        
        print("✅ PASS: CORS headers verified")
        return True
    except Exception as e:
        print(f"❌ FAIL: {e}")
        return False

def main():
    print("=" * 80)
    print("USER PROFILE BACKEND VERIFICATION")
    print("=" * 80)
    
    results = []
    
    # Run all tests
    results.append(("Health Check", test_health_check()))
    results.append(("Keepalive", test_keepalive()))
    results.append(("GET /api/profile auth guard", test_profile_get_auth_guard()))
    results.append(("PATCH /api/profile auth guard", test_profile_patch_auth_guard()))
    results.append(("POST /api/profile/delete-request auth guard", test_profile_delete_request_auth_guard()))
    results.append(("Code Review: Merged Profile", test_code_review_merged_profile()))
    results.append(("Code Review: PATCH Normalization", test_code_review_patch_normalization()))
    results.append(("Code Review: Delete Request", test_code_review_delete_request()))
    results.append(("Regression Tests", test_regression_existing_endpoints()))
    results.append(("Code Review: Eligibility Form New Fields", test_code_review_eligibility_form_new_fields()))
    results.append(("CORS Headers", test_cors_headers()))
    
    # Summary
    print("\n" + "=" * 80)
    print("SUMMARY")
    print("=" * 80)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED — User Profile feature working correctly")
        sys.exit(0)
    else:
        print(f"\n⚠️  {total - passed} test(s) failed")
        sys.exit(1)

if __name__ == '__main__':
    main()
