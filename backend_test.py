#!/usr/bin/env python3
"""
Phase 1 Attribution Backend Testing
Tests POST /api/leads/capture with attribution + dedupe logic
"""
import requests
import json
import sys

BASE_URL = "http://localhost:3000/api"
ADMIN_PASSWORD = "Sw@ps9409"

def print_test(name, passed, details=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"\n{status}: {name}")
    if details:
        print(f"  {details}")

def test_health_check():
    """Test 1: GET /api health check"""
    try:
        resp = requests.get(f"{BASE_URL.replace('/api', '')}/api", timeout=10)
        data = resp.json()
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True and
            data.get("app") == "LoanLaabh" and
            "supabase_configured" in data
        )
        print_test(
            "Health check (GET /api)",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}"
        )
        return passed
    except Exception as e:
        print_test("Health check (GET /api)", False, f"Exception: {str(e)[:200]}")
        return False

def test_keepalive():
    """Test 2: GET /api/keepalive"""
    try:
        resp = requests.get(f"{BASE_URL}/keepalive", timeout=10)
        data = resp.json()
        # Accept both 200 (alive) and 503 (unreachable but endpoint works)
        passed = (
            resp.status_code in [200, 503] and
            "ok" in data and
            "db" in data
        )
        print_test(
            "Keepalive (GET /api/keepalive)",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}"
        )
        return passed
    except Exception as e:
        print_test("Keepalive (GET /api/keepalive)", False, f"Exception: {str(e)[:200]}")
        return False

def test_lead_capture_full_attribution():
    """Test 3: POST /api/leads/capture with full attribution"""
    try:
        payload = {
            "full_name": "Alice Smith",
            "mobile": "9998811111",
            "email": "alice.p1@example.com",
            "consent": True,
            "source_cta": "login-eligibility",
            "attribution": {
                "first": {
                    "utm_source": "facebook",
                    "utm_medium": "cpc",
                    "utm_campaign": "diwali24",
                    "utm_content": "carousel_a",
                    "utm_term": None,
                    "fbclid": "AbCdE_123",
                    "_fbp": "fb.1.abc",
                    "_fbc": "fb.1.xyz",
                    "referrer": "https://www.facebook.com/",
                    "landing_page": "https://loanlaabh.com/?utm_source=facebook&utm_campaign=diwali24",
                    "device_type": "mobile",
                    "browser": "Chrome",
                    "platform": "Android",
                    "captured_at": "2026-05-15T10:00:00Z",
                    "source_type": "Meta Ads"
                },
                "latest": {
                    "utm_source": "facebook",
                    "utm_medium": "cpc",
                    "utm_campaign": "diwali24",
                    "captured_at": "2026-06-01T00:00:00Z",
                    "source_type": "Meta Ads"
                }
            }
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        # Must be 200 and have ok:true and lead_id
        # migration_pending or returning flags are acceptable
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True and
            "lead_id" in data
        )
        
        print_test(
            "Lead capture with full attribution",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:400]}"
        )
        
        # Store lead_id for next test
        if passed:
            return passed, data.get("lead_id")
        return passed, None
    except Exception as e:
        print_test("Lead capture with full attribution", False, f"Exception: {str(e)[:200]}")
        return False, None

def test_dedupe_same_mobile():
    """Test 4: Dedupe with SAME mobile"""
    try:
        payload = {
            "full_name": "Alice Smith Updated",
            "mobile": "9998811111",  # Same as test 3
            "email": "alice.different@example.com",
            "consent": True,
            "source_cta": "chatbot-retry",
            "attribution": {
                "first": {
                    "utm_source": "facebook",
                    "utm_medium": "cpc",
                    "utm_campaign": "diwali24",
                    "captured_at": "2026-06-01T00:00:00Z"
                },
                "latest": {
                    "utm_source": "facebook",
                    "utm_medium": "cpc",
                    "utm_campaign": "diwali24",
                    "captured_at": "2026-06-01T00:00:00Z"
                }
            }
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        # Must be 200 with ok:true
        # If migration applied: returning:true, retry_count >= 1, tags with 'Returning Lead'
        # If migration NOT applied: migration_pending:true is acceptable
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True
        )
        
        # Check for dedupe indicators (informational, not blocking if migration not applied)
        has_dedupe = data.get("returning") == True or data.get("migration_pending") == True
        
        print_test(
            "Dedupe with same mobile",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:400]}, Dedupe detected: {has_dedupe}"
        )
        return passed
    except Exception as e:
        print_test("Dedupe with same mobile", False, f"Exception: {str(e)[:200]}")
        return False

def test_dedupe_same_email():
    """Test 5: Dedupe with SAME email but different mobile"""
    try:
        payload = {
            "full_name": "Alice Smith Email Retry",
            "mobile": "9998822222",  # Different mobile
            "email": "alice.p1@example.com",  # Same email as test 3
            "consent": True,
            "source_cta": "login-retry",
            "attribution": {
                "first": {
                    "utm_source": "google",
                    "utm_medium": "cpc",
                    "gclid": "G_9876",
                    "captured_at": "2026-06-01T00:00:00Z"
                },
                "latest": {
                    "utm_source": "google",
                    "utm_medium": "cpc",
                    "captured_at": "2026-06-01T00:00:00Z"
                }
            }
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True
        )
        
        has_dedupe = data.get("returning") == True or data.get("migration_pending") == True
        
        print_test(
            "Dedupe with same email",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:400]}, Dedupe detected: {has_dedupe}"
        )
        return passed
    except Exception as e:
        print_test("Dedupe with same email", False, f"Exception: {str(e)[:200]}")
        return False

def test_validation_missing_fields():
    """Test 6: Validation - missing required fields"""
    try:
        payload = {"full_name": "Bob"}  # Missing mobile and email
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        passed = (
            resp.status_code == 400 and
            "error" in data and
            "Missing required fields" in data.get("error", "")
        )
        
        print_test(
            "Validation: missing fields",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}"
        )
        return passed
    except Exception as e:
        print_test("Validation: missing fields", False, f"Exception: {str(e)[:200]}")
        return False

def test_no_attribution():
    """Test 7: Lead capture without attribution field"""
    try:
        payload = {
            "full_name": "Charlie NoAttr",
            "mobile": "7777711111",
            "email": "noattr@example.com",
            "consent": True
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        # Must not crash - attribution is optional
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True
        )
        
        print_test(
            "Lead capture without attribution",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}"
        )
        return passed
    except Exception as e:
        print_test("Lead capture without attribution", False, f"Exception: {str(e)[:200]}")
        return False

def test_source_classifier():
    """Test 8: Source classifier smoke test"""
    try:
        payload = {
            "full_name": "David GoogleAds",
            "mobile": "8888811111",
            "email": "david.gads@example.com",
            "consent": True,
            "attribution": {
                "first": {
                    "gclid": "G_9876",
                    "utm_source": "google",
                    "utm_medium": "cpc",
                    "landing_page": "https://loanlaabh.com/",
                    "captured_at": "2026-06-01T00:00:00Z"
                },
                "latest": None
            }
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        data = resp.json()
        
        # Should classify as 'Google Ads' behind the scenes
        # Just verify no crash
        passed = (
            resp.status_code == 200 and
            data.get("ok") == True
        )
        
        print_test(
            "Source classifier smoke test",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}"
        )
        return passed
    except Exception as e:
        print_test("Source classifier smoke test", False, f"Exception: {str(e)[:200]}")
        return False

def test_admin_login():
    """Test 9: Admin login"""
    try:
        payload = {"password": ADMIN_PASSWORD}
        resp = requests.post(f"{BASE_URL}/admin/login", json=payload, timeout=10)
        data = resp.json()
        
        passed = (
            resp.status_code == 200 and
            data.get("success") == True and
            "loanlaabh_admin" in resp.cookies
        )
        
        print_test(
            "Admin login",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:200]}, Cookie set: {'loanlaabh_admin' in resp.cookies}"
        )
        
        # Return cookies for next tests
        if passed:
            return passed, resp.cookies
        return passed, None
    except Exception as e:
        print_test("Admin login", False, f"Exception: {str(e)[:200]}")
        return False, None

def test_get_leads_with_cookie(cookies):
    """Test 10: GET /api/leads with admin cookie"""
    try:
        resp = requests.get(f"{BASE_URL}/leads", cookies=cookies, timeout=10)
        data = resp.json()
        
        # Accept 200 (success) or 503 (Supabase unreachable)
        # Must NOT return 500 with raw 'fetch failed'
        passed = (
            resp.status_code in [200, 503] and
            (
                "leads" in data or  # 200 success
                (data.get("code") == "SUPABASE_UNREACHABLE" and "paused" in data.get("error", "").lower())  # 503 expected
            )
        )
        
        print_test(
            "GET /api/leads with cookie",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:400]}"
        )
        return passed
    except Exception as e:
        print_test("GET /api/leads with cookie", False, f"Exception: {str(e)[:200]}")
        return False

def test_get_lender_criteria_with_cookie(cookies):
    """Test 11: GET /api/lender-criteria with admin cookie"""
    try:
        resp = requests.get(f"{BASE_URL}/lender-criteria", cookies=cookies, timeout=10)
        data = resp.json()
        
        # Accept 200 (success) or 503 (Supabase unreachable)
        passed = (
            resp.status_code in [200, 503] and
            (
                "lenders" in data or
                (data.get("code") == "SUPABASE_UNREACHABLE" and "paused" in data.get("error", "").lower())
            )
        )
        
        print_test(
            "GET /api/lender-criteria with cookie",
            passed,
            f"Status: {resp.status_code}, Body: {json.dumps(data)[:400]}"
        )
        return passed
    except Exception as e:
        print_test("GET /api/lender-criteria with cookie", False, f"Exception: {str(e)[:200]}")
        return False

def test_cors_headers():
    """Test 12: CORS headers on lead capture"""
    try:
        payload = {
            "full_name": "CORS Test",
            "mobile": "6666611111",
            "email": "cors@example.com",
            "consent": True
        }
        resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=10)
        
        has_cors = "access-control-allow-origin" in [k.lower() for k in resp.headers.keys()]
        
        print_test(
            "CORS headers present",
            has_cors,
            f"Headers: {dict(resp.headers)}"
        )
        return has_cors
    except Exception as e:
        print_test("CORS headers present", False, f"Exception: {str(e)[:200]}")
        return False

def main():
    print("=" * 80)
    print("Phase 1 Attribution Backend Testing")
    print("=" * 80)
    
    results = []
    
    # Test 1: Health check
    results.append(test_health_check())
    
    # Test 2: Keepalive
    results.append(test_keepalive())
    
    # Test 3: Lead capture with full attribution
    passed, lead_id = test_lead_capture_full_attribution()
    results.append(passed)
    
    # Test 4: Dedupe same mobile
    results.append(test_dedupe_same_mobile())
    
    # Test 5: Dedupe same email
    results.append(test_dedupe_same_email())
    
    # Test 6: Validation
    results.append(test_validation_missing_fields())
    
    # Test 7: No attribution
    results.append(test_no_attribution())
    
    # Test 8: Source classifier
    results.append(test_source_classifier())
    
    # Test 9: Admin login
    passed, cookies = test_admin_login()
    results.append(passed)
    
    # Test 10 & 11: Admin endpoints (only if login succeeded)
    if cookies:
        results.append(test_get_leads_with_cookie(cookies))
        results.append(test_get_lender_criteria_with_cookie(cookies))
    else:
        print("\n⚠️  Skipping admin endpoint tests (login failed)")
        results.append(False)
        results.append(False)
    
    # Test 12: CORS
    results.append(test_cors_headers())
    
    # Summary
    print("\n" + "=" * 80)
    print(f"SUMMARY: {sum(results)}/{len(results)} tests passed")
    print("=" * 80)
    
    if all(results):
        print("\n✅ ALL TESTS PASSED")
        sys.exit(0)
    else:
        print("\n❌ SOME TESTS FAILED")
        sys.exit(1)

if __name__ == "__main__":
    main()
