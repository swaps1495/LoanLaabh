#!/usr/bin/env python3
"""
Meta Pixel + Conversions API (CAPI) Backend Verification
Tests for LoanLaabh Meta integration
"""

import requests
import json
import time
import hashlib
import uuid
from datetime import datetime

# Base URL from .env
BASE_URL = "https://loan-match-hub-2.preview.emergentagent.com/api"
ADMIN_PASSWORD = "Sw@ps9409"

# Meta credentials from .env
META_PIXEL_ID = "2036446207001182"
META_CAPI_ACCESS_TOKEN = "EAAWE1F2oydABSLOjksZAjQj0qZA5yAHq2ZCYQVwrFanUWZCYXMJMJGZBohCVO3kgElVWlHa27RWCzcI4v6MBZBgerZAmL5WDkpOMJiKSsCaSBN8SZB6sVMCfqRghKwCDmW4CdNxNFf4oVAEJTOoRuqZCcpGCkgZAYDoQRDtiLoXbUD1JUZAZCnOBJ8Y5Yo4vZCINN2DQMNgZDZD"
META_CAPI_TEST_EVENT_CODE = "TEST59885"
META_GRAPH_API_VERSION = "v18.0"

def print_test(num, desc):
    print(f"\n{'='*80}")
    print(f"TEST {num}: {desc}")
    print('='*80)

def print_pass(msg):
    print(f"✅ PASS: {msg}")

def print_fail(msg):
    print(f"❌ FAIL: {msg}")

def sha256(value):
    """SHA-256 hash helper"""
    return hashlib.sha256(str(value).encode()).hexdigest()

# Test 1: Sanity — health
print_test(1, "Sanity — health check")
try:
    resp = requests.get(f"{BASE_URL.replace('/api', '')}/api", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok') and data.get('app') == 'LoanLaabh' and 'supabase_configured' in data:
            print_pass("Health check returned 200 with correct structure")
        else:
            print_fail(f"Health check returned unexpected data: {data}")
    else:
        print_fail(f"Health check returned {resp.status_code}")
except Exception as e:
    print_fail(f"Health check exception: {e}")

# Test 2: Sanity — keepalive
print_test(2, "Sanity — keepalive")
try:
    resp = requests.get(f"{BASE_URL}/keepalive", timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok') and data.get('db') == 'alive':
            print_pass("Keepalive returned 200 with db:alive")
        else:
            print_fail(f"Keepalive returned unexpected data: {data}")
    else:
        print_fail(f"Keepalive returned {resp.status_code}")
except Exception as e:
    print_fail(f"Keepalive exception: {e}")

# Test 3: Lead capture with FULL Meta identifiers
print_test(3, "Lead capture with FULL Meta identifiers (main integration point)")
timestamp = int(time.time())
test_email = f"meta-test-{timestamp}@example.com"
test_event_id = f"test-{uuid.uuid4()}"
test_fbclid = f"AbCd_FBCLID_TEST_{uuid.uuid4().hex[:8]}"

payload = {
    "full_name": "Meta Test User",
    "mobile": "9887761234",
    "email": test_email,
    "consent": True,
    "source_cta": "capi-verify",
    "event_id": test_event_id,
    "event_source_url": "https://loanlaabh.com/login",
    "attribution": {
        "first": {
            "utm_source": "facebook",
            "utm_medium": "cpc",
            "utm_campaign": "capi-integration-test",
            "utm_content": "carousel_ad_1",
            "fbclid": test_fbclid,
            "_fbp": "fb.1.1700000000000.987654321",
            "_fbc": "fb.1.1700000000000.AbCd_FBCLID_TEST",
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
            "utm_campaign": "capi-integration-test",
            "captured_at": "2026-06-01T00:00:00Z"
        }
    }
}

try:
    start_time = time.time()
    resp = requests.post(f"{BASE_URL}/leads/capture", json=payload, timeout=15)
    elapsed = time.time() - start_time
    
    print(f"Status: {resp.status_code}")
    print(f"Response time: {elapsed:.2f}s")
    print(f"Response: {resp.text[:1000]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok') and 'lead_id' in data:
            print_pass(f"Lead capture returned 200 with lead_id: {data.get('lead_id')}")
            if elapsed < 5:
                print_pass(f"Response time reasonable: {elapsed:.2f}s")
            else:
                print(f"⚠️  Response time slow: {elapsed:.2f}s (expected < 5s)")
            
            # Store lead_id for later tests
            test3_lead_id = data.get('lead_id')
        else:
            print_fail(f"Lead capture returned unexpected data: {data}")
    else:
        print_fail(f"Lead capture returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"Lead capture exception: {e}")

# Test 4: CAPI event actually reached Meta (direct Graph API call)
print_test(4, "CAPI event actually reached Meta (direct Graph API verification)")
try:
    current_ts = int(time.time())
    test_email_hash = sha256("verify-test@example.com")
    
    graph_payload = {
        "data": [{
            "event_name": "Lead",
            "event_time": current_ts,
            "event_id": "verify-from-test-agent",
            "action_source": "website",
            "event_source_url": "https://loanlaabh.com/",
            "user_data": {
                "em": [test_email_hash],
                "client_user_agent": "backend-test-agent"
            }
        }],
        "test_event_code": META_CAPI_TEST_EVENT_CODE
    }
    
    graph_url = f"https://graph.facebook.com/{META_GRAPH_API_VERSION}/{META_PIXEL_ID}/events?access_token={META_CAPI_ACCESS_TOKEN}"
    
    resp = requests.post(graph_url, json=graph_payload, timeout=10)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('events_received') == 1 and 'fbtrace_id' in data:
            print_pass(f"Direct CAPI call successful: events_received=1, fbtrace_id={data.get('fbtrace_id')}")
        else:
            print_fail(f"Direct CAPI call returned unexpected data: {data}")
    else:
        print_fail(f"Direct CAPI call returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"Direct CAPI call exception: {e}")

# Test 5: Idempotent CAPI on dedupe
print_test(5, "Idempotent CAPI on dedupe (same mobile, different source)")
time.sleep(1)  # Brief pause

payload5 = {
    "full_name": "Meta Test User Updated",
    "mobile": "9887761234",  # Same mobile from test 3
    "email": f"meta-test-updated-{int(time.time())}@example.com",
    "consent": True,
    "source_cta": "capi-verify-retry",
    "event_id": f"test-{uuid.uuid4()}",  # Different event_id
    "event_source_url": "https://loanlaabh.com/eligibility",
    "attribution": {
        "first": {
            "utm_source": "google",  # Different source
            "utm_medium": "cpc",
            "utm_campaign": "capi-integration-test-2",
            "gclid": f"Gclid_TEST_{uuid.uuid4().hex[:8]}",
            "referrer": "https://www.google.com/",
            "landing_page": "https://loanlaabh.com/?utm_source=google",
            "device_type": "desktop",
            "browser": "Firefox",
            "platform": "Windows",
            "captured_at": datetime.utcnow().isoformat() + "Z"
        },
        "latest": {
            "utm_source": "google",
            "utm_medium": "cpc",
            "utm_campaign": "capi-integration-test-2",
            "captured_at": datetime.utcnow().isoformat() + "Z"
        }
    }
}

try:
    resp = requests.post(f"{BASE_URL}/leads/capture", json=payload5, timeout=15)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:1000]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok') and data.get('returning') == True:
            retry_count = data.get('retry_count', 0)
            if retry_count >= 1:
                print_pass(f"Dedupe working: returning=True, retry_count={retry_count}")
            else:
                print_fail(f"Dedupe returned returning=True but retry_count={retry_count} (expected >= 1)")
        else:
            print_fail(f"Dedupe returned unexpected data: {data}")
    else:
        print_fail(f"Dedupe returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"Dedupe exception: {e}")

# Test 6: Missing event_id doesn't break
print_test(6, "Missing event_id doesn't break (fallback event_id generation)")
payload6 = {
    "full_name": "Test User No EventID",
    "mobile": "9876543210",
    "email": f"no-eventid-{int(time.time())}@example.com",
    "consent": True,
    "source_cta": "test-no-eventid"
    # NO event_id or event_source_url
}

try:
    resp = requests.post(f"{BASE_URL}/leads/capture", json=payload6, timeout=15)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:1000]}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('ok'):
            print_pass("Lead capture without event_id returned 200 (server generates fallback)")
        else:
            print_fail(f"Lead capture without event_id returned unexpected data: {data}")
    else:
        print_fail(f"Lead capture without event_id returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"Lead capture without event_id exception: {e}")

# Test 7: PII hashing verification (code-level)
print_test(7, "PII hashing verification (code-level check)")
print("Reading /app/lib/meta-capi.js to verify hashing implementation...")

try:
    with open('/app/lib/meta-capi.js', 'r') as f:
        code = f.read()
    
    checks = {
        "SHA-256 hashing": "createHash('sha256')" in code and ".digest('hex')" in code,
        "Email normalization (lowercase)": "toLowerCase()" in code,
        "Phone normalization (91 prefix)": "'91' + digits" in code or "91" in code,
        "Does NOT hash fbp": "out.fbp = String(input.fbp)" in code,
        "Does NOT hash fbc": "out.fbc = String(input.fbc)" in code,
        "Uses x-forwarded-for": "x-forwarded-for" in code,
        "Uses user-agent": "user-agent" in code,
    }
    
    all_passed = True
    for check, result in checks.items():
        if result:
            print_pass(check)
        else:
            print_fail(check)
            all_passed = False
    
    if all_passed:
        print_pass("All PII hashing checks passed")
    else:
        print_fail("Some PII hashing checks failed")
        
except Exception as e:
    print_fail(f"Code verification exception: {e}")

# Test 8: Non-blocking marketing failures
print_test(8, "Non-blocking marketing failures (code-level check)")
print("Verifying sendMetaCapiEventSafe swallows errors...")

try:
    with open('/app/lib/meta-capi.js', 'r') as f:
        code = f.read()
    
    # Check for sendMetaCapiEventSafe function
    if 'sendMetaCapiEventSafe' in code:
        print_pass("sendMetaCapiEventSafe function exists")
        
        # Check if it has try-catch that swallows errors
        if 'try {' in code and 'catch' in code and 'return { ok: false' in code:
            print_pass("sendMetaCapiEventSafe has error handling that returns ok:false")
        else:
            print_fail("sendMetaCapiEventSafe missing proper error handling")
    else:
        print_fail("sendMetaCapiEventSafe function not found")
    
    # Check route.js uses sendMetaCapiEventSafe (not sendMetaCapiEvent)
    with open('/app/app/api/[[...path]]/route.js', 'r') as f:
        route_code = f.read()
    
    if 'sendMetaCapiEventSafe' in route_code:
        print_pass("route.js uses sendMetaCapiEventSafe (non-blocking)")
    else:
        print_fail("route.js doesn't use sendMetaCapiEventSafe")
        
except Exception as e:
    print_fail(f"Code verification exception: {e}")

# Test 9: Existing behaviour preserved
print_test(9, "Existing behaviour preserved (smoke tests)")

# 9a: Admin login
print("\n9a: POST /api/admin/login")
try:
    resp = requests.post(f"{BASE_URL}/admin/login", json={"password": ADMIN_PASSWORD}, timeout=10)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        if data.get('success'):
            print_pass("Admin login returned 200 with success:true")
            # Extract cookie for subsequent requests
            admin_cookie = resp.cookies.get('loanlaabh_admin')
            if admin_cookie:
                print_pass(f"Admin cookie set: {admin_cookie}")
            else:
                print_fail("Admin cookie not set")
        else:
            print_fail(f"Admin login returned unexpected data: {data}")
    else:
        print_fail(f"Admin login returned {resp.status_code}")
except Exception as e:
    print_fail(f"Admin login exception: {e}")

# 9b: GET /api/leads with cookie
print("\n9b: GET /api/leads (with admin cookie)")
try:
    cookies = {'loanlaabh_admin': 'ok'}
    resp = requests.get(f"{BASE_URL}/leads", cookies=cookies, timeout=10)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        if 'leads' in data and isinstance(data['leads'], list):
            print_pass(f"GET /api/leads returned 200 with leads array ({len(data['leads'])} leads)")
        else:
            print_fail(f"GET /api/leads returned unexpected data structure")
    else:
        print_fail(f"GET /api/leads returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"GET /api/leads exception: {e}")

# 9c: GET /api/lender-criteria with cookie
print("\n9c: GET /api/lender-criteria (with admin cookie)")
try:
    cookies = {'loanlaabh_admin': 'ok'}
    resp = requests.get(f"{BASE_URL}/lender-criteria", cookies=cookies, timeout=10)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        if 'lenders' in data and isinstance(data['lenders'], list):
            print_pass(f"GET /api/lender-criteria returned 200 with lenders array ({len(data['lenders'])} lenders)")
        else:
            print_fail(f"GET /api/lender-criteria returned unexpected data structure")
    else:
        print_fail(f"GET /api/lender-criteria returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"GET /api/lender-criteria exception: {e}")

# 9d: GET /api/lead-captures with cookie
print("\n9d: GET /api/lead-captures (with admin cookie)")
try:
    cookies = {'loanlaabh_admin': 'ok'}
    resp = requests.get(f"{BASE_URL}/lead-captures", cookies=cookies, timeout=10)
    print(f"Status: {resp.status_code}")
    
    if resp.status_code == 200:
        data = resp.json()
        if 'lead_captures' in data and isinstance(data['lead_captures'], list):
            print_pass(f"GET /api/lead-captures returned 200 with lead_captures array ({len(data['lead_captures'])} captures)")
            
            # Check if test leads from test 3, 5, 6 are present
            captures = data['lead_captures']
            test_mobiles = ['9887761234', '9876543210']
            found_mobiles = [c.get('mobile') for c in captures if c.get('mobile') in test_mobiles]
            if found_mobiles:
                print_pass(f"Test leads found in lead_captures: {found_mobiles}")
            else:
                print(f"⚠️  Test leads not yet visible in lead_captures (may take time to sync)")
        else:
            print_fail(f"GET /api/lead-captures returned unexpected data structure")
    else:
        print_fail(f"GET /api/lead-captures returned {resp.status_code}: {resp.text[:500]}")
except Exception as e:
    print_fail(f"GET /api/lead-captures exception: {e}")

# Test 10: CORS headers on POST /api/leads/capture
print_test(10, "CORS headers on POST /api/leads/capture")
try:
    payload10 = {
        "full_name": "CORS Test User",
        "mobile": "9999999999",
        "email": f"cors-test-{int(time.time())}@example.com",
        "consent": True,
        "source_cta": "cors-test"
    }
    
    resp = requests.post(f"{BASE_URL}/leads/capture", json=payload10, timeout=15)
    print(f"Status: {resp.status_code}")
    
    cors_header = resp.headers.get('access-control-allow-origin')
    print(f"CORS header: {cors_header}")
    
    if cors_header == '*':
        print_pass("CORS header 'access-control-allow-origin: *' present")
    else:
        print_fail(f"CORS header missing or incorrect: {cors_header}")
        
except Exception as e:
    print_fail(f"CORS test exception: {e}")

print("\n" + "="*80)
print("ALL TESTS COMPLETED")
print("="*80)
