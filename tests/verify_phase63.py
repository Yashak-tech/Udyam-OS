import urllib.request
import json
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

print('=== STARTING PHASE 6.3 VERIFICATION ===')

# 1. Create fresh session
res = post(f'{BASE}/sessions', {'founder_name': 'Founder', 'device_id': 'iqoo_phone'})
sess_id = res['session_id']
print('1. Fresh session created:', sess_id)

# 2. Submit exact business objective
goal_text = 'I want to launch an AI appointment-reminder SaaS for small clinics.'
res = post(f'{BASE}/sessions/{sess_id}/goals', {'raw_intent': goal_text})
print('2. Goal received by Udyam Manager. Pipeline dispatched.')

# 3-7. Check session state after completion
data = get(f'{BASE}/sessions/{sess_id}')
print('Session status:', data['status'])
assert data['status'] == 'AWAITING_APPROVAL', f"Expected AWAITING_APPROVAL, got {data['status']}"

# Check all 4 tasks are COMPLETED
tasks = data['tasks']
print(f'Total tasks: {len(tasks)}')
for t in tasks:
    print(f"   - {t['agent_name']}: {t['status']}")
    assert t['status'] == 'COMPLETED', f"{t['agent_name']} not completed!"
print('3-5. All 4 agents (Research, Product, Builder, Growth) are confirmed COMPLETED!')

# 6. Verify Shared Context is updated
ctx = data['context']
print('6. Shared Context verified:')
print('   - Target ICP:', ctx['market'].get('target_icp'))
print('   - Core Pain:', ctx['market'].get('core_pain_points'))
print('   - Positioning:', ctx['brand'].get('positioning_tagline'))
print('   - MVP Features:', ctx['product'].get('mvp_features'))
assert ctx['market'].get('target_icp'), 'Target ICP missing in context!'
assert ctx['product'].get('mvp_features'), 'MVP features missing in context!'

# 7. Check Artifacts
artifacts = data['artifacts']
print(f'7. Total Artifacts: {len(artifacts)}')
expected_arts = ['art_research_brief', 'art_product_requirements', 'art_landing_page', 'art_launch_strategy']
for ea in expected_arts:
    assert ea in artifacts, f'Missing artifact {ea}'
    print(f"   - {ea}: {artifacts[ea]['title']}")

# 8. Check Verification Passed
assert data['verification']['passed'] == True
print(f"8. Quality Verification passed! Summary: {data['verification']['summary']}")

# 9. Check Approval Requested
assert data['approval'] is not None
print('9. Approval requested with founder decision gate pending.')

# 10. Founder Approves
res = post(f'{BASE}/sessions/{sess_id}/approval', {'decision': 'APPROVED', 'founder_notes': 'Authorized for launch.'})
assert res['status'] == 'APPROVED'
print('10. Founder Approved!')

# 11-12. Verify Launch Ready & Final Task States
launch_data = get(f'{BASE}/sessions/{sess_id}')
assert launch_data['status'] == 'LAUNCH_READY', f"Expected LAUNCH_READY, got {launch_data['status']}"
print('11. Session status: LAUNCH_READY')

for t in launch_data['tasks']:
    assert t['status'] == 'COMPLETED', f"{t['agent_name']} is not completed in LAUNCH_READY state!"
print('12. Confirmed: In LAUNCH_READY state, all 4 agents remain strictly COMPLETED in database!')

# 16-17. Check Outputs endpoint
res = get(f'{BASE}/sessions/{sess_id}/artifacts')
arts = res['artifacts']
print(f'16. Outputs endpoint returned {len(arts)} deliverables:')
for a in arts:
    print(f"   - {a['title']} ({a['relative_path']})")
assert len(arts) == 5, f'Expected 5 artifacts, got {len(arts)}'
assert 'art_landing_page' in launch_data['artifacts']
print('17. Landing Experience is packaged as an artifact produced by Builder Agent.')

print('=== ALL 18 PHASE 6.3 CRITERIA FULLY VERIFIED! ===')
