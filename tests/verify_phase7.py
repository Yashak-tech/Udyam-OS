import urllib.request
import urllib.error
import json
import time
import sys

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE = 'http://localhost:8000/api/v1'

def post(url, data):
    req = urllib.request.Request(
        url,
        data=json.dumps(data).encode(),
        headers={'Content-Type': 'application/json'}
    )
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def get(url):
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as resp:
        return json.loads(resp.read().decode())

def run_phase7_verification():
    print("==================================================")
    print("UDYAM OS — PHASE 7 FINAL VERIFICATION SUITE")
    print("==================================================")

    # 1. Fresh Venture Session Creation
    print("\n[Step 1] Creating Fresh Venture Session...")
    res = post(f'{BASE}/sessions', {
        'founder_name': 'Dr. Yash',
        'device_id': 'iqoo_phone'
    })
    session_id = res['session_id']
    print(f"✓ Session Created: {session_id} (Status: {res['status']})")
    assert res['status'] == 'CREATED'

    # 2. Test Validation Failures (Section 23)
    print("\n[Step 2] Testing System Failure Modes...")
    # Empty / short goal (Requirement 23F)
    try:
        post(f'{BASE}/sessions/{session_id}/goals', {'raw_intent': 'hi'})
        print("✗ Empty goal validation failed to trigger")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 422
        print(f"✓ Validation Error for short/empty goal correctly returned 422")

    # Invalid approval before workforce runs (Requirement 23E)
    try:
        post(f'{BASE}/sessions/{session_id}/approval', {'decision': 'APPROVED'})
        print("✗ State conflict validation failed to trigger")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 409
        print(f"✓ State Conflict for premature approval correctly returned 409")

    # 3. Submit Founder Objective Goal (Section 4)
    goal_intent = "I want to launch an AI appointment-reminder SaaS for small clinics."
    print(f"\n[Step 3] Submitting Founder Objective:")
    print(f'   "{goal_intent}"')
    post(f'{BASE}/sessions/{session_id}/goals', {
        'raw_intent': goal_intent,
        'modality': 'text'
    })

    # 4. Wait for Autonomous Workforce Execution
    print("\n[Step 4] Monitoring Autonomous Workforce Execution...")
    start_time = time.time()
    while time.time() - start_time < 15.0:
        sess = get(f'{BASE}/sessions/{session_id}')
        if sess['status'] in ['AWAITING_APPROVAL', 'FAILED']:
            break
        time.sleep(0.3)

    sess = get(f'{BASE}/sessions/{session_id}')
    assert sess['status'] == 'AWAITING_APPROVAL', f"Expected AWAITING_APPROVAL, got {sess['status']}"
    print(f"✓ Workforce completed execution pipeline. Session status: {sess['status']}")

    # 5. Verify All 4 Specialists Are Completed (Section 3)
    print("\n[Step 5] Checking Specialist States:")
    for task in sess['tasks']:
        print(f"   - {task['agent_name']}: ✓ {task['status']}")
        assert task['status'] == 'COMPLETED'

    # 6. Verify Shared Company Context (Section 9, 10, 11)
    print("\n[Step 6] Verifying Shared Company Context:")
    ctx = sess['context']
    print(f"   - Project: {ctx['product']['product_name']}")
    print(f"   - Target ICP: {ctx['market']['target_icp']}")
    print(f"   - Positioning: {ctx['growth']['positioning_statement']}")
    assert ctx['market']['target_icp'] != ""
    assert len(ctx['product']['mvp_features']) >= 1
    assert len(ctx['growth']['launch_channels']) >= 1

    # 7. Verify 12/12 Automated Quality Checks (Section 13)
    print("\n[Step 7] Checking Quality Control Audit:")
    verification = sess['verification']
    assert verification['passed'] is True
    print(f"   - Audit Result: {verification['summary']}")
    assert len(verification['checks']) == 12
    for check in verification['checks']:
        assert check['passed'] is True
    print(f"   - All 12/12 quality checks PASSED.")

    # 8. Test Revision Flow (Section 15)
    print("\n[Step 8] Testing Revision Flow (REQUEST REVISION)...")
    rev_res = post(f'{BASE}/sessions/{session_id}/feedback', {
        'target_agent': 'BuilderAgent',
        'critique_text': 'Improve the landing page positioning for small clinic owners.',
        'target_artifact': 'art_landing_page'
    })
    assert rev_res['status'] == 'REVISION_REQUESTED'
    print(f"✓ Revision requested successfully ({rev_res['status']}). Waiting for re-run...")

    # Wait for bounded revision to complete and re-verify
    start_time = time.time()
    while time.time() - start_time < 15.0:
        sess = get(f'{BASE}/sessions/{session_id}')
        if sess['status'] in ['AWAITING_APPROVAL', 'FAILED']:
            break
        time.sleep(0.3)

    sess = get(f'{BASE}/sessions/{session_id}')
    assert sess['status'] == 'AWAITING_APPROVAL'
    assert sess['verification']['passed'] is True
    print("✓ Bounded revision re-executed BuilderAgent, re-verified, and returned to AWAITING_APPROVAL.")

    # 9. Founder Approval (Section 14)
    print("\n[Step 9] Founder Approval Gate (APPROVE)...")
    app_res = post(f'{BASE}/sessions/{session_id}/approval', {
        'decision': 'APPROVED',
        'founder_notes': 'Launch authorized from iQOO phone command center.'
    })
    assert app_res['status'] == 'APPROVED'
    print(f"✓ Approval accepted. Finalizing launch package...")

    # 10. Verify LAUNCH_READY State (Section 3 & 14)
    final_sess = get(f'{BASE}/sessions/{session_id}')
    assert final_sess['status'] == 'LAUNCH_READY'
    print(f"✓ Session State: {final_sess['status']}")
    print(f"✓ Launch Package: {final_sess['launch_package']['package_id']} (Launch Ready: True)")

    # 11. Artifact Integrity Verification (Section 7 & 8)
    print("\n[Step 11] Verifying Artifact Integrity (Company Outputs):")
    art_res = get(f'{BASE}/sessions/{session_id}/artifacts')
    artifacts = art_res['artifacts']
    print(f"   - Total Artifacts Found: {len(artifacts)}")
    assert len(artifacts) >= 5
    for a in artifacts:
        print(f"     * {a['title']} ({a['relative_path']}) — {a['metadata']['file_size_bytes']} bytes")

    # 12. Office Kit Truthful Status (Section 22)
    print("\n[Step 12] Verifying Office Kit Desktop Bridge Status:")
    try:
        post(f'{BASE}/office-kit/sync', {'session_id': session_id})
        print("✗ Office Kit unexpectedly succeeded without desktop daemon")
        sys.exit(1)
    except urllib.error.HTTPError as e:
        assert e.code == 501
        print("✓ Office Kit truthfully returned 501 Not Implemented (Desktop bridge offline).")

    # 13. Session Reload / Reconstruct (Section 25)
    print("\n[Step 13] Verifying Reload / Reconstruct Consistency:")
    reloaded = get(f'{BASE}/sessions/{session_id}')
    assert reloaded['session_id'] == session_id
    assert reloaded['status'] == 'LAUNCH_READY'
    assert reloaded['approval']['status'] == 'APPROVED'
    for task in reloaded['tasks']:
        assert task['status'] == 'COMPLETED'
    print("✓ UI / Backend state successfully reconstructed on reload without desync.")

    print("\n==================================================")
    print("✓ ALL PHASE 7 INTEGRATION CHECKS PASSED PERFECTLY!")
    print("==================================================")

if __name__ == '__main__':
    run_phase7_verification()
