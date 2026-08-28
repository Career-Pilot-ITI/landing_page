// Career Pilot Employer Authentication & Dashboard Controller

let currentEmployer = null;

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  initEmployerState();
});

function initEmployerState() {
  const saved = localStorage.getItem('cp_employer_session');
  if (saved) {
    try {
      currentEmployer = JSON.parse(saved);
      renderLoggedInState();
    } catch (e) {
      renderLoggedOutState();
    }
  } else {
    // Default to sandbox mode so recruiters can interact immediately
    currentEmployer = {
      companyName: "Acme Technologies",
      recruiterName: "Alex Morgan",
      email: "alex@acme.com",
      tier: "Growth",
      quota: 50
    };
    renderLoggedInState();
  }
}

function renderLoggedInState() {
  const authGate = document.getElementById('authGate');
  const dashboardInterface = document.getElementById('dashboardInterface');
  const companyHeaderName = document.getElementById('companyHeaderName');
  const companyHeaderSub = document.getElementById('companyHeaderSub');
  const logoBadge = document.getElementById('companyLogoBadge');

  if (authGate) authGate.style.display = 'none';
  if (dashboardInterface) dashboardInterface.style.display = 'block';

  if (currentEmployer) {
    if (companyHeaderName) {
      companyHeaderName.innerText = `${currentEmployer.companyName} · Recruiter Dashboard`;
    }
    if (companyHeaderSub) {
      companyHeaderSub.innerText = `${currentEmployer.tier || 'Starter'} Tier Active (${currentEmployer.quota || 10} Candidate Quota)`;
    }
    if (logoBadge) {
      logoBadge.innerText = currentEmployer.companyName ? currentEmployer.companyName.substring(0, 2).toUpperCase() : 'CP';
    }
  }
}

function renderLoggedOutState() {
  const authGate = document.getElementById('authGate');
  const dashboardInterface = document.getElementById('dashboardInterface');
  if (authGate) authGate.style.display = 'block';
  if (dashboardInterface) dashboardInterface.style.display = 'none';
}

// Modal Handlers
function openAuthModal(viewType) {
  const modal = document.getElementById('authModal');
  const regView = document.getElementById('modalRegisterView');
  const otpView = document.getElementById('modalOtpView');
  const loginView = document.getElementById('modalLoginView');

  if (!modal) return;
  modal.style.display = 'flex';

  if (regView) regView.style.display = (viewType === 'register') ? 'block' : 'none';
  if (otpView) otpView.style.display = (viewType === 'otp') ? 'block' : 'none';
  if (loginView) loginView.style.display = (viewType === 'login') ? 'block' : 'none';
}

function closeAuthModal() {
  const modal = document.getElementById('authModal');
  if (modal) modal.style.display = 'none';
}

// Register Flow
let pendingRegData = null;

async function handleEmployerRegister(e) {
  e.preventDefault();
  const compName = document.getElementById('regCompName')?.value;
  const name = document.getElementById('regRecruiterName')?.value;
  const email = document.getElementById('regEmail')?.value;
  const password = document.getElementById('regPass')?.value;
  const industry = document.getElementById('regIndustry')?.value;
  const website = document.getElementById('regWebsite')?.value;

  pendingRegData = {
    companyName: compName,
    recruiterName: name,
    email: email,
    password: password,
    industry: industry,
    website: website,
    tier: 'Starter',
    quota: 10
  };

  // Try calling backend API if available
  try {
    const API_BASE = "http://localhost:8080/api/v1";
    await fetch(`${API_BASE}/company/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName: compName,
        name: name,
        email: email,
        password: password,
        industry: industry,
        website: website
      })
    });
  } catch (err) {
    // Network offline / local simulation
  }

  // Switch to OTP view
  openAuthModal('otp');
}

async function handleEmployerOtp(e) {
  e.preventDefault();
  const code = document.getElementById('regOtpCode')?.value;
  if (!code || code.length < 4) {
    alert('Please enter a valid verification code');
    return;
  }

  // Verify
  currentEmployer = pendingRegData || {
    companyName: "New Enterprise",
    recruiterName: "Recruiter",
    email: "recruiter@enterprise.com",
    tier: "Starter",
    quota: 10
  };

  localStorage.setItem('cp_employer_session', JSON.stringify(currentEmployer));
  closeAuthModal();
  renderLoggedInState();
  switchTab('overview');
  alert(`Welcome to Career Pilot Enterprise! Your 14-day Starter free trial is active.`);
}

// Login Flow
async function handleEmployerLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail')?.value;
  const pass = document.getElementById('loginPass')?.value;

  if (!email || !pass) {
    alert('Please enter your email and password');
    return;
  }

  currentEmployer = {
    companyName: email.split('@')[1]?.split('.')[0]?.toUpperCase() || "Enterprise",
    recruiterName: email.split('@')[0],
    email: email,
    tier: "Growth",
    quota: 50
  };

  localStorage.setItem('cp_employer_session', JSON.stringify(currentEmployer));
  closeAuthModal();
  renderLoggedInState();
  switchTab('overview');
}

function handleLogout() {
  if (confirm("Are you sure you want to sign out?")) {
    localStorage.removeItem('cp_employer_session');
    currentEmployer = null;
    renderLoggedOutState();
  }
}

function unlockSandbox() {
  currentEmployer = {
    companyName: "Acme Technologies",
    recruiterName: "Alex Morgan",
    email: "alex@acme.com",
    tier: "Growth",
    quota: 50
  };
  renderLoggedInState();
  switchTab('overview');
}

// Tab Switching
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
  const title = document.getElementById('intTitle')?.value || "Mobile Engineer Assessment";
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
