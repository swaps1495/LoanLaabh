#!/usr/bin/env python3
"""
Backend test for admin lead-captures endpoint bug fix verification
Tests the new GET /api/lead-captures endpoint and related functionality
"""

import requests
import json
import time
from datetime import datetime

# Base URL from .env
BASE_URL = "https://loan-match-hub-2.preview.emergentagent.com/api"
ADMIN_PASSWORD = "Sw@ps9409"

def print_test(name, passed, details=""):
    """Print test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  Details: {details}")

def test_admin_login():
    """Test 1: Sanity — admin login"""
    print("\n" + "="*80)
    print("TEST 1: Admin Login Sanity Check")
    print("="*80)
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        
        status_ok = response.status_code == 200
        body = response.json()
        success_field = body.get("success") == True
        has_cookie = "loanlaabh_admin" in response.cookies
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Body: {json.dumps(body, indent=2)}")
        print(f"Cookie Set: {has_cookie}")
        
        passed = status_ok and success_field
        print_test("Admin login with correct password", passed, 
                   f"Expected 200 + success:true, got {response.status_code} + {body}")
        
        # Return cookie for subsequent tests
        return response.cookies if passed else None
        
    except Exception as e:
        print_test("Admin login", False, f"Exception: {str(e)}")
        return None

def test_lead_captures_with_auth(cookies):
    """Test 2: The main fix — GET /api/lead-captures WITH admin cookie"""
    print("\n" + "="*80)
    print("TEST 2: GET /api/lead-captures WITH Admin Cookie (Main Fix)")
    print("="*80)
    
    if not cookies:
        print_test("GET /api/lead-captures with auth", False, "No admin cookie available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/lead-captures",
            cookies=cookies,
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        
        if response.status_code != 200:
            print(f"Response Body: {response.text[:500]}")
            print_test("GET /api/lead-captures returns 200", False, 
                       f"Expected 200, got {response.status_code}")
            return False
        
        body = response.json()
        print(f"Response Keys: {list(body.keys())}")
        
        # Check for lead_captures key
        has_lead_captures_key = "lead_captures" in body
        if not has_lead_captures_key:
            print_test("Response has lead_captures key", False, 
                       f"Expected 'lead_captures' key, got keys: {list(body.keys())}")
            return False
        
        lead_captures = body.get("lead_captures", [])
        is_array = isinstance(lead_captures, list)
        
        print(f"lead_captures is array: {is_array}")
        print(f"Number of rows: {len(lead_captures)}")
        
        if len(lead_captures) > 0:
            first_row = lead_captures[0]
            print(f"\nFirst row keys: {list(first_row.keys())}")
            print(f"First row sample: {json.dumps({k: first_row.get(k) for k in ['id', 'full_name', 'mobile', 'email', 'created_at', 'original_source_type', 'retry_count', 'tags']}, indent=2)}")
            
            # Check required fields
            required_fields = ['id', 'full_name', 'mobile', 'email', 'created_at']
            has_required = all(field in first_row for field in required_fields)
            
            if not has_required:
                missing = [f for f in required_fields if f not in first_row]
                print_test("Row has required fields", False, f"Missing fields: {missing}")
                return False
            
            # Check optional attribution fields (may be null)
            optional_fields = ['original_source_type', 'original_utm_source', 'original_utm_campaign', 
                             'retry_count', 'tags', 'first_visit_at', 'last_activity_at',
                             'original_device_type', 'original_browser', 'original_platform']
            present_optional = [f for f in optional_fields if f in first_row]
            print(f"Optional attribution fields present: {present_optional}")
        
        # Check CORS headers
        has_cors = "access-control-allow-origin" in response.headers
        print(f"CORS header present: {has_cors}")
        
        passed = is_array and response.status_code == 200
        print_test("GET /api/lead-captures with auth", passed, 
                   f"Returns 200 with lead_captures array containing {len(lead_captures)} rows")
        
        return passed
        
    except Exception as e:
        print_test("GET /api/lead-captures with auth", False, f"Exception: {str(e)}")
        return False

def test_lead_captures_without_auth():
    """Test 3: Auth guard — GET /api/lead-captures WITHOUT cookie"""
    print("\n" + "="*80)
    print("TEST 3: GET /api/lead-captures WITHOUT Cookie (Auth Guard)")
    print("="*80)
    
    try:
        response = requests.get(
            f"{BASE_URL}/lead-captures",
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        body = response.json()
        print(f"Response Body: {json.dumps(body, indent=2)}")
        
        is_401 = response.status_code == 401
        has_error = "error" in body
        
        passed = is_401 and has_error
        print_test("GET /api/lead-captures without auth returns 401", passed,
                   f"Expected 401 with error, got {response.status_code}")
        
        return passed
        
    except Exception as e:
        print_test("GET /api/lead-captures without auth", False, f"Exception: {str(e)}")
        return False

def test_end_to_end_capture_and_list(cookies):
    """Test 4: End-to-end: capture + list with attribution"""
    print("\n" + "="*80)
    print("TEST 4: End-to-End Capture + List with Attribution")
    print("="*80)
    
    if not cookies:
        print_test("E2E capture + list", False, "No admin cookie available")
        return None
    
    # Generate unique test data
    timestamp = int(time.time())
    test_mobile = f"9990{timestamp % 1000000:06d}"  # 9990XXXXXX format
    test_email = f"test-e2e-{timestamp}@example.com"
    
    print(f"Test Mobile: {test_mobile}")
    print(f"Test Email: {test_email}")
    
    # Step 1: Capture lead with full attribution
    capture_payload = {
        "full_name": "E2E Test User",
        "mobile": test_mobile,
        "email": test_email,
        "consent": True,
        "source_cta": "test-e2e",
        "attribution": {
            "first": {
                "utm_source": "facebook",
                "utm_medium": "cpc",
                "utm_campaign": "e2e-test",
                "fbclid": "E2E_123",
                "referrer": "https://www.facebook.com/",
                "landing_page": "https://loanlaabh.com/?utm_source=facebook",
                "device_type": "mobile",
                "browser": "Chrome",
                "platform": "Android",
                "captured_at": "2026-06-01T00:00:00Z"
            },
            "latest": {
                "utm_source": "facebook",
                "utm_medium": "cpc",
                "utm_campaign": "e2e-test",
                "captured_at": "2026-06-01T00:00:00Z"
            }
        }
    }
    
    try:
        print("\nStep 1: POST /api/leads/capture with full attribution")
        capture_response = requests.post(
            f"{BASE_URL}/leads/capture",
            json=capture_payload,
            timeout=10
        )
        
        print(f"Capture Status: {capture_response.status_code}")
        capture_body = capture_response.json()
        print(f"Capture Response: {json.dumps(capture_body, indent=2)}")
        
        if capture_response.status_code != 200:
            print_test("Lead capture", False, f"Expected 200, got {capture_response.status_code}")
            return None
        
        if not capture_body.get("ok"):
            print_test("Lead capture", False, f"Expected ok:true, got {capture_body}")
            return None
        
        lead_id = capture_body.get("lead_id")
        print(f"Lead ID: {lead_id}")
        
        # Wait a moment for DB to settle
        time.sleep(1)
        
        # Step 2: Login as admin (refresh cookie)
        print("\nStep 2: POST /api/admin/login")
        login_response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        
        if login_response.status_code != 200:
            print_test("Admin login for E2E", False, f"Login failed: {login_response.status_code}")
            return None
        
        admin_cookies = login_response.cookies
        
        # Step 3: GET /api/lead-captures and verify the new lead appears
        print("\nStep 3: GET /api/lead-captures")
        list_response = requests.get(
            f"{BASE_URL}/lead-captures",
            cookies=admin_cookies,
            timeout=10
        )
        
        print(f"List Status: {list_response.status_code}")
        
        if list_response.status_code != 200:
            print_test("GET lead-captures in E2E", False, f"Expected 200, got {list_response.status_code}")
            return None
        
        list_body = list_response.json()
        lead_captures = list_body.get("lead_captures", [])
        
        print(f"Total lead_captures: {len(lead_captures)}")
        
        # Find our test lead by mobile or email
        found_lead = None
        for lead in lead_captures:
            if lead.get("mobile") == test_mobile or lead.get("email") == test_email:
                found_lead = lead
                break
        
        if not found_lead:
            print_test("New lead appears in list", False, 
                       f"Lead with mobile {test_mobile} or email {test_email} not found in response")
            return None
        
        print(f"\nFound lead: {json.dumps(found_lead, indent=2)}")
        
        # Verify attribution fields
        checks = []
        
        # Check original_source_type is "Meta Ads" (fbclid was present)
        original_source = found_lead.get("original_source_type")
        checks.append(("original_source_type is 'Meta Ads'", original_source == "Meta Ads", 
                      f"Expected 'Meta Ads', got '{original_source}'"))
        
        # Check retry_count is 0 (new lead)
        retry_count = found_lead.get("retry_count")
        checks.append(("retry_count is 0", retry_count == 0, 
                      f"Expected 0, got {retry_count}"))
        
        # Check tags array contains "New Lead"
        tags = found_lead.get("tags", [])
        has_new_lead_tag = "New Lead" in tags
        checks.append(("tags contains 'New Lead'", has_new_lead_tag, 
                      f"Expected 'New Lead' in tags, got {tags}"))
        
        # Print all checks
        all_passed = True
        for check_name, check_passed, check_detail in checks:
            print_test(check_name, check_passed, check_detail)
            all_passed = all_passed and check_passed
        
        if all_passed:
            print_test("E2E capture + list with attribution", True, 
                       f"Lead captured and appears in list with correct attribution")
        
        return test_mobile if all_passed else None
        
    except Exception as e:
        print_test("E2E capture + list", False, f"Exception: {str(e)}")
        return None

def test_dedupe_and_retry(test_mobile, cookies):
    """Test 5: Dedupe + retry visibility"""
    print("\n" + "="*80)
    print("TEST 5: Dedupe + Retry Visibility")
    print("="*80)
    
    if not test_mobile:
        print_test("Dedupe + retry", False, "No test mobile from previous test")
        return False
    
    if not cookies:
        print_test("Dedupe + retry", False, "No admin cookie available")
        return False
    
    # Capture again with same mobile but different source (Google Ads)
    retry_payload = {
        "full_name": "E2E Test User Retry",
        "mobile": test_mobile,
        "email": f"retry-{int(time.time())}@example.com",  # Different email
        "consent": True,
        "source_cta": "test-retry",
        "attribution": {
            "first": {
                "utm_source": "google",
                "utm_medium": "cpc",
                "gclid": "G_456",
                "referrer": "https://www.google.com/",
                "landing_page": "https://loanlaabh.com/?utm_source=google",
                "device_type": "desktop",
                "browser": "Chrome",
                "platform": "Windows",
                "captured_at": "2026-06-02T00:00:00Z"
            },
            "latest": {
                "utm_source": "google",
                "utm_medium": "cpc",
                "captured_at": "2026-06-02T00:00:00Z"
            }
        }
    }
    
    try:
        print(f"\nStep 1: POST /api/leads/capture with same mobile {test_mobile} but different source")
        retry_response = requests.post(
            f"{BASE_URL}/leads/capture",
            json=retry_payload,
            timeout=10
        )
        
        print(f"Retry Capture Status: {retry_response.status_code}")
        retry_body = retry_response.json()
        print(f"Retry Response: {json.dumps(retry_body, indent=2)}")
        
        if retry_response.status_code != 200:
            print_test("Retry capture", False, f"Expected 200, got {retry_response.status_code}")
            return False
        
        # Wait for DB
        time.sleep(1)
        
        # Step 2: GET /api/lead-captures and verify updates
        print("\nStep 2: GET /api/lead-captures")
        list_response = requests.get(
            f"{BASE_URL}/lead-captures",
            cookies=cookies,
            timeout=10
        )
        
        if list_response.status_code != 200:
            print_test("GET lead-captures after retry", False, f"Expected 200, got {list_response.status_code}")
            return False
        
        list_body = list_response.json()
        lead_captures = list_body.get("lead_captures", [])
        
        # Find the lead by mobile
        found_lead = None
        for lead in lead_captures:
            if lead.get("mobile") == test_mobile:
                found_lead = lead
                break
        
        if not found_lead:
            print_test("Lead found after retry", False, f"Lead with mobile {test_mobile} not found")
            return False
        
        print(f"\nUpdated lead: {json.dumps(found_lead, indent=2)}")
        
        # Verify dedupe and retry behavior
        checks = []
        
        # Check no duplicate created (same row updated)
        leads_with_mobile = [l for l in lead_captures if l.get("mobile") == test_mobile]
        checks.append(("No duplicate created", len(leads_with_mobile) == 1, 
                      f"Expected 1 row, found {len(leads_with_mobile)}"))
        
        # Check retry_count incremented to 1
        retry_count = found_lead.get("retry_count")
        checks.append(("retry_count incremented to 1", retry_count == 1, 
                      f"Expected 1, got {retry_count}"))
        
        # Check tags contains "Returning Lead"
        tags = found_lead.get("tags", [])
        has_returning = "Returning Lead" in tags
        checks.append(("tags contains 'Returning Lead'", has_returning, 
                      f"Expected 'Returning Lead' in tags, got {tags}"))
        
        # Check original_source_type is UNCHANGED (still Meta Ads)
        original_source = found_lead.get("original_source_type")
        checks.append(("original_source_type unchanged (Meta Ads)", original_source == "Meta Ads", 
                      f"Expected 'Meta Ads' (preserved), got '{original_source}'"))
        
        # Check latest_source_type or latest_utm_source updated to Google
        latest_source_type = found_lead.get("latest_source_type")
        latest_utm_source = found_lead.get("latest_utm_source")
        is_google = latest_source_type == "Google Ads" or latest_utm_source == "google"
        checks.append(("latest source updated to Google", is_google, 
                      f"Expected Google Ads or google, got latest_source_type='{latest_source_type}', latest_utm_source='{latest_utm_source}'"))
        
        # Print all checks
        all_passed = True
        for check_name, check_passed, check_detail in checks:
            print_test(check_name, check_passed, check_detail)
            all_passed = all_passed and check_passed
        
        if all_passed:
            print_test("Dedupe + retry visibility", True, 
                       "Lead updated correctly with retry_count, tags, and preserved original attribution")
        
        return all_passed
        
    except Exception as e:
        print_test("Dedupe + retry", False, f"Exception: {str(e)}")
        return False

def test_cors_headers(cookies):
    """Test 6: CORS headers"""
    print("\n" + "="*80)
    print("TEST 6: CORS Headers")
    print("="*80)
    
    if not cookies:
        print_test("CORS headers", False, "No admin cookie available")
        return False
    
    try:
        response = requests.get(
            f"{BASE_URL}/lead-captures",
            cookies=cookies,
            timeout=10
        )
        
        cors_header = response.headers.get("access-control-allow-origin")
        print(f"access-control-allow-origin: {cors_header}")
        
        has_cors = cors_header is not None
        print_test("CORS header present", has_cors, 
                   f"Expected access-control-allow-origin header, got: {cors_header}")
        
        return has_cors
        
    except Exception as e:
        print_test("CORS headers", False, f"Exception: {str(e)}")
        return False

def test_existing_endpoints_smoke(cookies):
    """Test 7: Existing endpoints unaffected (smoke test)"""
    print("\n" + "="*80)
    print("TEST 7: Existing Endpoints Smoke Test")
    print("="*80)
    
    if not cookies:
        print_test("Existing endpoints smoke", False, "No admin cookie available")
        return False
    
    tests_passed = []
    
    # Test GET /api/leads
    try:
        print("\nTesting GET /api/leads")
        response = requests.get(f"{BASE_URL}/leads", cookies=cookies, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            body = response.json()
            has_leads_key = "leads" in body
            print(f"Has 'leads' key: {has_leads_key}")
            print_test("GET /api/leads", has_leads_key, f"Returns 200 with leads array")
            tests_passed.append(has_leads_key)
        else:
            print_test("GET /api/leads", False, f"Expected 200, got {response.status_code}")
            tests_passed.append(False)
    except Exception as e:
        print_test("GET /api/leads", False, f"Exception: {str(e)}")
        tests_passed.append(False)
    
    # Test GET /api/lender-criteria
    try:
        print("\nTesting GET /api/lender-criteria")
        response = requests.get(f"{BASE_URL}/lender-criteria", cookies=cookies, timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            body = response.json()
            has_lenders_key = "lenders" in body
            print(f"Has 'lenders' key: {has_lenders_key}")
            print_test("GET /api/lender-criteria", has_lenders_key, f"Returns 200 with lenders array")
            tests_passed.append(has_lenders_key)
        else:
            print_test("GET /api/lender-criteria", False, f"Expected 200, got {response.status_code}")
            tests_passed.append(False)
    except Exception as e:
        print_test("GET /api/lender-criteria", False, f"Exception: {str(e)}")
        tests_passed.append(False)
    
    # Test GET /api/keepalive
    try:
        print("\nTesting GET /api/keepalive")
        response = requests.get(f"{BASE_URL}/keepalive", timeout=10)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            body = response.json()
            db_alive = body.get("db") == "alive"
            print(f"DB alive: {db_alive}")
            print_test("GET /api/keepalive", db_alive, f"Returns 200 with db:alive")
            tests_passed.append(db_alive)
        else:
            print_test("GET /api/keepalive", False, f"Expected 200, got {response.status_code}")
            tests_passed.append(False)
    except Exception as e:
        print_test("GET /api/keepalive", False, f"Exception: {str(e)}")
        tests_passed.append(False)
    
    all_passed = all(tests_passed)
    if all_passed:
        print_test("Existing endpoints smoke test", True, "All existing endpoints working")
    
    return all_passed

def main():
    """Run all tests"""
    print("\n" + "="*80)
    print("BACKEND TEST: Admin Lead Captures Bug Fix Verification")
    print("="*80)
    print(f"Base URL: {BASE_URL}")
    print(f"Admin Password: {ADMIN_PASSWORD}")
    
    results = {}
    
    # Test 1: Admin login
    admin_cookies = test_admin_login()
    results["admin_login"] = admin_cookies is not None
    
    # Test 2: GET /api/lead-captures with auth (main fix)
    results["lead_captures_with_auth"] = test_lead_captures_with_auth(admin_cookies)
    
    # Test 3: GET /api/lead-captures without auth
    results["lead_captures_without_auth"] = test_lead_captures_without_auth()
    
    # Test 4: E2E capture + list
    test_mobile = test_end_to_end_capture_and_list(admin_cookies)
    results["e2e_capture_list"] = test_mobile is not None
    
    # Test 5: Dedupe + retry
    results["dedupe_retry"] = test_dedupe_and_retry(test_mobile, admin_cookies)
    
    # Test 6: CORS headers
    results["cors_headers"] = test_cors_headers(admin_cookies)
    
    # Test 7: Existing endpoints smoke test
    results["existing_endpoints"] = test_existing_endpoints_smoke(admin_cookies)
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    for test_name, passed in results.items():
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    total = len(results)
    passed = sum(1 for p in results.values() if p)
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! The bug fix is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the details above.")
        return 1

if __name__ == "__main__":
    exit(main())
