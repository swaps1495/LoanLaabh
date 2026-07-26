#!/usr/bin/env python3
"""
Backend API tests for LoanLaabh - Supabase unreachability error handling
Tests the graceful degradation when Supabase is paused/unreachable
"""

import requests
import json

BASE_URL = "http://localhost:3000/api"
ADMIN_PASSWORD = "Sw@ps9409"

def print_test_header(test_name):
    print(f"\n{'='*80}")
    print(f"TEST: {test_name}")
    print('='*80)

def print_result(passed, message):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status}: {message}")

def test_admin_login_success():
    """Test 1: POST /api/admin/login with correct password"""
    print_test_header("Admin Login - Correct Password")
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": ADMIN_PASSWORD},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        # Check status code
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return None
        
        # Check response body
        data = response.json()
        if data.get("success") != True:
            print_result(False, f"Expected success:true, got {data}")
            return None
        
        # Check cookie
        cookie = response.cookies.get("loanlaabh_admin")
        if not cookie:
            print_result(False, "No loanlaabh_admin cookie set")
            return None
        
        print(f"Cookie set: loanlaabh_admin={cookie}")
        print_result(True, "Admin login successful with correct password")
        return cookie
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return None

def test_admin_login_failure():
    """Test 2: POST /api/admin/login with wrong password"""
    print_test_header("Admin Login - Wrong Password")
    
    try:
        response = requests.post(
            f"{BASE_URL}/admin/login",
            json={"password": "wrongpassword123"},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        # Check status code
        if response.status_code != 401:
            print_result(False, f"Expected status 401, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        if "error" not in data or "Invalid password" not in data["error"]:
            print_result(False, f"Expected 'Invalid password' error, got {data}")
            return False
        
        print_result(True, "Correctly rejected wrong password with 401")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_leads_with_auth_supabase_down(admin_cookie):
    """Test 3: GET /api/leads WITH admin cookie - should return 503 SUPABASE_UNREACHABLE"""
    print_test_header("GET /api/leads with Auth (Supabase Down)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/leads",
            cookies={"loanlaabh_admin": admin_cookie},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        # Check status code
        if response.status_code != 503:
            print_result(False, f"Expected status 503, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        
        # Check for SUPABASE_UNREACHABLE code
        if data.get("code") != "SUPABASE_UNREACHABLE":
            print_result(False, f"Expected code 'SUPABASE_UNREACHABLE', got {data.get('code')}")
            return False
        
        # Check error message contains actionable info
        error_msg = data.get("error", "").lower()
        if "paused" not in error_msg or "supabase.com" not in error_msg:
            print_result(False, f"Error message missing 'paused' or 'supabase.com': {data.get('error')}")
            return False
        
        # Verify it's NOT the raw "fetch failed" error
        if data.get("error") == "fetch failed":
            print_result(False, "Got raw 'fetch failed' error instead of friendly message")
            return False
        
        print_result(True, "Correctly returned 503 with SUPABASE_UNREACHABLE and actionable message")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_lender_criteria_with_auth_supabase_down(admin_cookie):
    """Test 4: GET /api/lender-criteria WITH admin cookie - should return 503 SUPABASE_UNREACHABLE"""
    print_test_header("GET /api/lender-criteria with Auth (Supabase Down)")
    
    try:
        response = requests.get(
            f"{BASE_URL}/lender-criteria",
            cookies={"loanlaabh_admin": admin_cookie},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:500]}")
        
        # Check status code
        if response.status_code != 503:
            print_result(False, f"Expected status 503, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        
        # Check for SUPABASE_UNREACHABLE code
        if data.get("code") != "SUPABASE_UNREACHABLE":
            print_result(False, f"Expected code 'SUPABASE_UNREACHABLE', got {data.get('code')}")
            return False
        
        # Check error message contains actionable info
        error_msg = data.get("error", "").lower()
        if "paused" not in error_msg or "supabase.com" not in error_msg:
            print_result(False, f"Error message missing 'paused' or 'supabase.com': {data.get('error')}")
            return False
        
        # Verify it's NOT the raw "fetch failed" error
        if data.get("error") == "fetch failed":
            print_result(False, "Got raw 'fetch failed' error instead of friendly message")
            return False
        
        print_result(True, "Correctly returned 503 with SUPABASE_UNREACHABLE and actionable message")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_leads_without_auth():
    """Test 5: GET /api/leads WITHOUT admin cookie - should return 401"""
    print_test_header("GET /api/leads without Auth")
    
    try:
        response = requests.get(
            f"{BASE_URL}/leads",
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        # Check status code
        if response.status_code != 401:
            print_result(False, f"Expected status 401, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        if "error" not in data or "Unauthorized" not in data["error"]:
            print_result(False, f"Expected 'Unauthorized' error, got {data}")
            return False
        
        print_result(True, "Correctly returned 401 Unauthorized without auth")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_health_check():
    """Test 6: GET /api or /api/ - health check (doesn't hit Supabase)"""
    print_test_header("GET /api - Health Check")
    
    try:
        response = requests.get(
            f"{BASE_URL}/",
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        # Check status code
        if response.status_code != 200:
            print_result(False, f"Expected status 200, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        if data.get("ok") != True or data.get("app") != "LoanLaabh":
            print_result(False, f"Expected ok:true and app:LoanLaabh, got {data}")
            return False
        
        print_result(True, "Health check endpoint working correctly")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_nonexistent_route(admin_cookie):
    """Test 7: GET /api/nonexistent-route with admin cookie - should return 404"""
    print_test_header("GET /api/nonexistent-route - 404 Test")
    
    try:
        response = requests.get(
            f"{BASE_URL}/nonexistent-route",
            cookies={"loanlaabh_admin": admin_cookie},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text[:300]}")
        
        # Check status code
        if response.status_code != 404:
            print_result(False, f"Expected status 404, got {response.status_code}")
            return False
        
        # Check response body
        data = response.json()
        if "error" not in data or "not found" not in data["error"].lower():
            print_result(False, f"Expected 'not found' error, got {data}")
            return False
        
        print_result(True, "Correctly returned 404 for nonexistent route")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def test_cors_headers(admin_cookie):
    """Test 8: Verify CORS headers on 503 response"""
    print_test_header("CORS Headers on 503 Response")
    
    try:
        response = requests.get(
            f"{BASE_URL}/leads",
            cookies={"loanlaabh_admin": admin_cookie},
            timeout=10
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response Headers: {dict(response.headers)}")
        
        # Check for CORS header
        cors_header = response.headers.get("Access-Control-Allow-Origin")
        if not cors_header:
            print_result(False, "Missing Access-Control-Allow-Origin header")
            return False
        
        print(f"CORS Header: {cors_header}")
        print_result(True, f"CORS headers present on 503 response")
        return True
        
    except Exception as e:
        print_result(False, f"Exception: {str(e)}")
        return False

def main():
    print("\n" + "="*80)
    print("LOANLAABH BACKEND API TESTS - SUPABASE UNREACHABILITY ERROR HANDLING")
    print("="*80)
    
    results = {}
    
    # Test 1: Admin login success
    admin_cookie = test_admin_login_success()
    results["admin_login_success"] = admin_cookie is not None
    
    # Test 2: Admin login failure
    results["admin_login_failure"] = test_admin_login_failure()
    
    # Only proceed with authenticated tests if login succeeded
    if admin_cookie:
        # Test 3: GET /api/leads with auth (Supabase down)
        results["leads_with_auth_503"] = test_leads_with_auth_supabase_down(admin_cookie)
        
        # Test 4: GET /api/lender-criteria with auth (Supabase down)
        results["lender_criteria_with_auth_503"] = test_lender_criteria_with_auth_supabase_down(admin_cookie)
        
        # Test 7: Nonexistent route
        results["nonexistent_route_404"] = test_nonexistent_route(admin_cookie)
        
        # Test 8: CORS headers
        results["cors_headers"] = test_cors_headers(admin_cookie)
    else:
        print("\n⚠️  Skipping authenticated tests due to login failure")
    
    # Test 5: GET /api/leads without auth
    results["leads_without_auth_401"] = test_leads_without_auth()
    
    # Test 6: Health check
    results["health_check"] = test_health_check()
    
    # Summary
    print("\n" + "="*80)
    print("TEST SUMMARY")
    print("="*80)
    
    passed = sum(1 for v in results.values() if v)
    total = len(results)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n🎉 ALL TESTS PASSED! The Supabase unreachability error handling is working correctly.")
        return 0
    else:
        print(f"\n⚠️  {total - passed} test(s) failed. Please review the output above.")
        return 1

if __name__ == "__main__":
    exit(main())
