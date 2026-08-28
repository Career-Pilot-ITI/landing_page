// Career Pilot Employer Dashboard Logic
function switchTab(tabId) {
  const tabs = ['overview', 'new-interview', 'candidates', 'report'];
  tabs.forEach(t => {
    const el = document.getElementById(`tab-${t}`);
    const btn = document.getElementById(`tab-btn-${t}`);
    if (el) el.style.display = (t === tabId) ? 'block' : 'none';
    if (btn) {
      if (t === tabId) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });
}

function addQuestionField() {
  const container = document.getElementById('questionsContainer');
  if (!container) return;
  const count = container.children.length + 1;
  const div = document.createElement('div');
  div.className = 'pillar-card';
  div.style.borderColor = 'var(--line)';
  div.innerHTML = `
    <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
      <span class="kicker" style="margin:0;">Question #${count}</span>
      <span style="font-size: 12px; font-weight: 700; color: var(--muted);">90s Spoken Limit · 1x Weight</span>
    </div>
    <div class="form-group">
      <label>Spoken Question</label>
      <input type="text" class="form-control" placeholder="Type question for candidate to speak..." required />
    </div>
    <div class="rubric-box">
      <label style="color: var(--primary);"><svg style="width:14px;height:14px;display:inline-block;vertical-align:-2px;"><use href="#i-spark"/></svg> What You Want to Hear (AI Scoring Rubric)</label>
      <textarea class="form-control" rows="2" style="background:#fff; margin-top:6px;" placeholder="Describe required concepts, keywords, or patterns..."></textarea>
    </div>
  `;
  container.appendChild(div);
}

function handleCreateInterview(e) {
  e.preventDefault();
  const title = document.getElementById('intTitle')?.value;
  alert(`Assessment "${title}" created and published! Now add your candidates.`);
  switchTab('candidates');
}

function addCandidateRow() {
  const name = document.getElementById('newCandName')?.value;
  const email = document.getElementById('newCandEmail')?.value;
  if (!email) {
    alert('Please enter candidate email');
    return;
  }

  const table = document.getElementById('candidatesTable')?.querySelector('tbody');
  if (!table) return;

  const tr = document.createElement('tr');
  const token = 'tk_' + Math.random().toString(36).substring(2, 9);
  tr.innerHTML = `
    <td><strong>${name || 'Candidate'}</strong><br/><small style="color:var(--muted);">${email}</small></td>
    <td><code style="font-size:11px; color:var(--primary);">careerpilot://company-interview?token=${token}</code></td>
    <td><span class="badge-status badge-draft">Ready to Send</span></td>
    <td><span style="color:var(--muted);">Pending</span></td>
    <td style="text-align: right;"><span style="font-size:12px; color:var(--muted);">Queued</span></td>
  `;
  table.appendChild(tr);

  document.getElementById('newCandName').value = '';
  document.getElementById('newCandEmail').value = '';
}

function dispatchEmailsDemo() {
  const notice = document.getElementById('invitationSuccessNotice');
  if (notice) {
    notice.style.display = 'block';
    setTimeout(() => {
      notice.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }
}

function viewReportSample(candName, score) {
  const repName = document.getElementById('repCandName');
  const repScore = document.getElementById('repScore');
  if (repName) repName.innerText = `Candidate Assessment Report · ${candName}`;
  if (repScore) repScore.innerText = `${score}%`;
  switchTab('report');
  document.getElementById('employerApp')?.scrollIntoView({ behavior: 'smooth' });
}
