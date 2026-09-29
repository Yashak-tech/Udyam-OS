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

print('=== VALIDATING PHASE 6.4: BUILDER ARTIFACT PREVIEW ===')

# 1. Fresh session
res = post(f'{BASE}/sessions', {'founder_name': 'Founder', 'device_id': 'iqoo_phone'})
sess_id = res['session_id']
print('1. Created fresh session:', sess_id)

# 2. Submit goal
goal_text = 'I want to launch an AI appointment-reminder SaaS for small clinics.'
res = post(f'{BASE}/sessions/{sess_id}/goals', {'raw_intent': goal_text})
print('2. Goal submitted. Pipeline completed.')

# 3. Check status
sess = get(f'{BASE}/sessions/{sess_id}')
print('3. Session status:', sess['status'])
assert sess['status'] == 'AWAITING_APPROVAL'

# 4. Check all agent tasks are COMPLETED
print('4. Checking agent states:')
for t in sess['tasks']:
    print(f"   - {t['agent_name']}: {t['status']}")
    assert t['status'] == 'COMPLETED'

# 5. Check Landing Page HTML Artifact
res = get(f'{BASE}/sessions/{sess_id}/artifacts/art_landing_page')
html = res['content']
print('5. Landing Page content fetched. Length:', len(html))

# Validate self-contained styling
assert '<style>' in html, 'Missing embedded <style> block!'
assert '#F8FAFC' in html or '#FFFFFF' in html, 'Missing light background styling!'
assert '#0F172A' in html, 'Missing high-contrast text color!'
assert 'name="viewport"' in html, 'Missing responsive viewport!'
assert 'The Problem' in html, 'Missing Problem section!'
assert 'The Solution' in html, 'Missing Solution section!'
assert 'How It Works' in html, 'Missing How It Works section!'
assert 'Practice Data Confidentiality' in html, 'Missing trust banner!'
print('   ✓ Verified self-contained design system (embedded <style>)')
print('   ✓ Verified high contrast (#0F172A text on #F8FAFC / #FFFFFF background)')
print('   ✓ Verified all required customer sections present')

# 6. Founder approves
res = post(f'{BASE}/sessions/{sess_id}/approval', {'decision': 'APPROVED', 'founder_notes': 'Launch package authorized.'})
print('6. Approved! New status:', res['status'])

# 7. Check Launch Ready
launch_sess = get(f'{BASE}/sessions/{sess_id}')
assert launch_sess['status'] == 'LAUNCH_READY'
print('7. Confirmed LAUNCH_READY state')
for t in launch_sess['tasks']:
    assert t['status'] == 'COMPLETED'
print('8. Confirmed all 4 agents remain strictly COMPLETED in LAUNCH_READY state')

print('=== PHASE 6.4 VALIDATION PASSED COMPLETELY! ===')
