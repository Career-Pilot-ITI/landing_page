if (typeof window !== 'undefined') {
(() => {
  const config = window.CAREER_PILOT_CONFIG || {};
  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector('.site-header');
  const progress = document.getElementById('scrollProgress');
  const toast = document.getElementById('toast');
  const themeButton = document.getElementById('themeButton');
  const themePopover = document.getElementById('themePopover');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');

  const showToast = (message, ms = 3300) => {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => toast.classList.remove('show'), ms);
  };

  const setTheme = (theme) => {
    root.dataset.theme = theme;
    localStorage.setItem('careerPilotTheme', theme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', theme === 'midnight' ? '#0E1428' : theme === 'pulse' ? '#F1F3F9' : '#F7F8FC');
  };
  setTheme(localStorage.getItem('careerPilotTheme') || config.defaultTheme || 'cloud');

  themeButton?.addEventListener('click', (e) => {
    e.stopPropagation();
    themePopover.classList.toggle('open');
  });
  themePopover?.querySelectorAll('[data-theme-choice]').forEach(btn => btn.addEventListener('click', () => {
    setTheme(btn.dataset.themeChoice);
    themePopover.classList.remove('open');
  }));
  document.addEventListener('click', (e) => {
    if (!themePopover?.contains(e.target) && e.target !== themeButton) themePopover?.classList.remove('open');
  });

  menuButton?.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  mobileMenu?.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mobileMenu.classList.remove('open')));

  const updateScroll = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.width = `${max > 0 ? (scrollTop / max) * 100 : 0}%`;
    header?.classList.toggle('scrolled', scrollTop > 16);
  };
  window.addEventListener('scroll', updateScroll, { passive: true });
  updateScroll();

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: '0px 0px -50px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

  const counters = document.querySelectorAll('[data-count]');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = Number(el.dataset.count || 0);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      counterObserver.unobserve(el);
    });
  }, { threshold: .6 });
  counters.forEach(el => counterObserver.observe(el));

  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`));
    });
  }, { threshold: .4 });
  sections.forEach(section => navObserver.observe(section));

  const challengeData = {
    public: {
      title: 'Open competition for the community',
      badge: 'OPEN COMPETITION',
      cardTitle: 'Mobile Engineer Sprint',
      text: 'Browse active public challenges, join from the Free tier, complete the AI interview, and compare results on the leaderboard.',
      plan: 'FREE',
      bullets: ['Discover public challenges regardless of preferred track.', 'Reuse the existing interview experience for participation.', 'Receive AI-scored results and leaderboard context.']
    },
    private: {
      title: 'Controlled screening for invited candidates',
      badge: 'PRIVATE SCREENING',
      cardTitle: 'Backend Screening Round',
      text: 'Join with an invitation or private code, complete the interview, and view only the result scope allowed for participants.',
      plan: 'FREE',
      bullets: ['Invitation/code based access.', 'Creator can review participant sessions and results.', 'Useful for first-round screening and structured assessments.']
    },
    create: {
      title: 'Create and host a custom interview challenge',
      badge: 'MAX CREATOR TOOL',
      cardTitle: 'Create Your Challenge',
      text: 'Configure track, visibility, seniority, interview mode, questions, and challenge rules, then publish for public or private participation.',
      plan: 'MAX',
      bullets: ['Challenge creation is gated to Max.', 'Question sets can be validated with Firebase AI.', 'Creator dashboard tracks created and taken challenge sessions.']
    }
  };
  const renderChallenge = (key) => {
    const copyEl = document.getElementById('challengeCopy');
    if (!copyEl) return;
    const d = challengeData[key];
    copyEl.innerHTML = `<h3>${d.title}</h3><p>${d.text}</p><ul>${d.bullets.map(x => `<li>${x}</li>`).join('')}</ul>`;
    const badgeEl = document.getElementById('challengeBadge');
    if (badgeEl) badgeEl.textContent = d.badge;
    const titleEl = document.getElementById('challengeTitle');
    if (titleEl) titleEl.textContent = d.cardTitle;
    const textEl = document.getElementById('challengeText');
    if (textEl) textEl.textContent = d.text;
    const planEl = document.getElementById('challengePlan');
    if (planEl) planEl.textContent = d.plan;
  };
  if (document.getElementById('challengeCopy')) renderChallenge('public');
  document.querySelectorAll('[data-challenge]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-challenge]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    renderChallenge(btn.dataset.challenge);
  }));

  const archData = {
    mobile: {
      icon: 'i-video',
      title: 'Mobile intelligence',
      description: 'Latency-sensitive media processing stays close to the user. Android uses MediaPipe and Whisper integration; iOS uses Apple Vision and Apple Speech.',
      points: ['Fast perception and transcription', 'Privacy-friendly local processing', 'Android can use a direct Firebase AI interpretation path']
    },
    backend: {
      icon: 'i-server',
      title: 'Backend orchestration',
      description: 'Spring Boot remains authoritative for user, interview, ATS, subscription, wallet, payment, and server-side AI business workflows.',
      points: ['REST business services and security', 'Agentic interview orchestration', 'Asynchronous CV optimization jobs']
    },
    rag: {
      icon: 'i-brain',
      title: 'Retrieval-Augmented Generation',
      description: 'Spring AI retrieves relevant track and question-bank knowledge from pgvector so prompts receive controlled context before generation.',
      points: ['Embeddings + metadata filters', 'pgvector similarity retrieval', 'Lexical fallback and deterministic server validation']
    },
    data: {
      icon: 'i-database',
      title: 'Authoritative data',
      description: 'PostgreSQL + pgvector back the core backend. The current Android Challenge runtime additionally uses Firebase Firestore for public/private challenges and challenge sessions.',
      points: ['Relational business state', 'Vector indexes for semantic retrieval', 'Firestore challenge collections in current Android implementation']
    }
  };
  const archDetail = document.getElementById('archDetail');
  const renderArch = (key) => {
    if (!archDetail) return;
    const d = archData[key];
    archDetail.innerHTML = `<div class="arch-icon"><svg><use href="#${d.icon}"/></svg></div><h3>${d.title}</h3><p>${d.description}</p><ul>${d.points.map(x => `<li><svg><use href="#i-check"/></svg>${x}</li>`).join('')}</ul>`;
  };
  if (archDetail) renderArch('mobile');
  document.querySelectorAll('[data-arch]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('[data-arch]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    renderArch(btn.dataset.arch);
  }));

  const planFeatures = {
    FREE: ['Enter challenges', 'Voice interviews via coins', 'Core performance analytics', 'Voice scoring & AI feedback'],
    PLUS: ['Everything in Free', 'ATS match', 'CV AI analysis', 'Cover letters', 'Job parsing', 'Technical quizzes', 'PDF report export'],
    MAX: ['Everything in Plus', 'Video interview AI', 'Advanced reports', 'Create & host challenges']
  };
  const renderAccess = (plan) => {
    const result = document.getElementById('accessResult');
    if (!result) return;
    result.innerHTML = planFeatures[plan].map(x => `<span class="access-pill"><svg><use href="#i-check"/></svg>${x}</span>`).join('');
  };
  if (document.getElementById('accessResult')) renderAccess('FREE');
  document.querySelectorAll('#planSelector [data-plan]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#planSelector [data-plan]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    renderAccess(btn.dataset.plan);
  }));

  const demoDeviceCopy = {
    android: ['Android product walkthrough', 'Show onboarding, CV setup, interview practice, ATS, Challenges, Access gating, pricing, and reports in one guided recording.'],
    ios: ['iOS product walkthrough', 'Show the native SwiftUI experience, profile/CV flow, interview practice, reports, ATS, subscriptions, and iOS media intelligence.']
  };
  document.querySelectorAll('#deviceSelector [data-device]').forEach(btn => btn.addEventListener('click', () => {
    document.querySelectorAll('#deviceSelector [data-device]').forEach(x => x.classList.remove('active'));
    btn.classList.add('active');
    const d = demoDeviceCopy[btn.dataset.device];
    const dHeading = document.getElementById('demoHeading');
    const dDesc = document.getElementById('demoDescription');
    if (dHeading) dHeading.textContent = d[0];
    if (dDesc) dDesc.textContent = d[1];
  }));

  const demoModal = document.getElementById('demoModal');
  const modalVideo = document.getElementById('modalDemoVideo');
  const openDemo = () => {
    demoModal.classList.add('open');
    demoModal.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  };
  const closeDemo = () => {
    demoModal.classList.remove('open');
    demoModal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
    modalVideo?.pause();
  };
  document.querySelectorAll('[data-open-demo]').forEach(btn => btn.addEventListener('click', openDemo));
  document.querySelectorAll('[data-close-demo]').forEach(btn => btn.addEventListener('click', closeDemo));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && demoModal.classList.contains('open')) closeDemo(); });

  const verifyVideo = async () => {
    try {
      const res = await fetch(config.demoVideoUrl || 'assets/demo/career-pilot-demo.mp4', { method: 'HEAD', cache: 'no-store' });
      if (!res.ok) return;
      document.querySelectorAll('.demo-placeholder video').forEach(v => { v.style.display = 'block'; });
      document.querySelectorAll('.video-empty').forEach(x => x.style.display = 'none');
    } catch (_) { /* placeholder stays visible */ }
  };
  verifyVideo();

  const apkUrl = config.apkUrl || 'https://drive.google.com/file/d/1UaDY4iH1V7P2FbzhyFoJamS35vxfknQp/view?usp=sharing';
  document.querySelectorAll('.apk-link').forEach(link => {
    link.setAttribute('href', apkUrl);
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
    link.removeAttribute('download');
    link.addEventListener('click', () => {
      showToast('Opening Career Pilot APK on Google Drive...');
    });
  });

  // Interactive Feature Playground Data & Logic
  const interviewTracks = {
    android: {
      name: 'Android Native',
      tag: 'KOTLIN · JETPACK COMPOSE · MVI',
      question: 'Explain how Kotlin StateFlow differs from SharedFlow in Jetpack Compose state management, and how lifecycle-aware collection prevents memory leaks.',
      time: '02:00',
      scores: { st: 24, a: 33, r: 23, del: 14, total: 94 },
      gaze: '94% (High Focus)',
      posture: 'Stable (Centered)',
      pacing: '142 WPM (Optimal)',
      feedback: 'Excellent STAR framing on Coroutines state isolation. Highlight baseline profile optimizations in your results to maximize the technical score.'
    },
    ios: {
      name: 'iOS Native',
      tag: 'SWIFT 5.10 · SWIFTUI · MVVM',
      question: 'How does the Swift Concurrency actor model eliminate data races in multithreaded SwiftUI applications compared to traditional GCD dispatch queues?',
      time: '02:00',
      scores: { st: 25, a: 34, r: 22, del: 14, total: 95 },
      gaze: '96% (High Focus)',
      posture: 'Stable (Centered)',
      pacing: '138 WPM (Optimal)',
      feedback: 'Clear explanation of isolation domains and Sendable protocol. Good delivery pacing with minimal filler words.'
    },
    backend: {
      name: 'Cloud Backend',
      tag: 'JAVA 21 · SPRING BOOT 3 · PGVECTOR',
      question: 'How do you design a stateless JWT authentication filter in Spring Security while optimizing pgvector HNSW semantic index lookups for high-throughput queries?',
      time: '02:00',
      scores: { st: 23, a: 32, r: 24, del: 13, total: 92 },
      gaze: '91% (Good)',
      posture: 'Stable (Centered)',
      pacing: '148 WPM (Optimal)',
      feedback: 'Strong understanding of vector distance metrics and Spring Security filter chains. Good architectural trade-off justification.'
    },
    qa: {
      name: 'Quality Assurance',
      tag: 'TEST AUTOMATION · CI/CD · POSTMAN',
      question: 'How do you build a deterministic test pipeline for testing asynchronous MVI state flows and REST API contracts under network failure simulations?',
      time: '02:00',
      scores: { st: 24, a: 34, r: 24, del: 14, total: 96 },
      gaze: '95% (High Focus)',
      posture: 'Stable (Centered)',
      pacing: '136 WPM (Optimal)',
      feedback: 'Outstanding breakdown of unit, integration, and UI testing matrices. Thorough coverage of edge cases.'
    }
  };

  let activeTrack = 'android';
  const renderInterviewTrack = (trackKey) => {
    activeTrack = trackKey;
    const t = interviewTracks[trackKey];
    const tagEl = document.getElementById('simPromptTag');
    const textEl = document.getElementById('simPromptText');
    const timeEl = document.getElementById('simPromptTime');
    const scoreEl = document.getElementById('simTotalScore');
    const tipEl = document.getElementById('simCoachTip');
    const gazeEl = document.getElementById('simGazeScore');
    const postEl = document.getElementById('simPostureScore');
    const paceEl = document.getElementById('simPacingScore');

    if (tagEl) tagEl.textContent = t.tag;
    if (textEl) textEl.textContent = t.question;
    if (timeEl) timeEl.textContent = t.time;
    if (scoreEl) scoreEl.textContent = `${t.scores.total}/100`;
    if (tipEl) tipEl.textContent = t.feedback;
    if (gazeEl) gazeEl.textContent = `Gaze: ${t.gaze}`;
    if (postEl) postEl.textContent = `Posture: ${t.posture}`;
    if (paceEl) paceEl.textContent = `Pacing: ${t.pacing}`;

    // Update progress bars
    const fillSt = document.getElementById('fillST');
    const fillA = document.getElementById('fillA');
    const fillR = document.getElementById('fillR');
    const fillDel = document.getElementById('fillDel');

    if (fillSt) fillSt.style.width = `${(t.scores.st / 25) * 100}%`;
    if (fillA) fillA.style.width = `${(t.scores.a / 35) * 100}%`;
    if (fillR) fillR.style.width = `${(t.scores.r / 25) * 100}%`;
    if (fillDel) fillDel.style.width = `${(t.scores.del / 15) * 100}%`;

    const labelSt = document.getElementById('labelST');
    const labelA = document.getElementById('labelA');
    const labelR = document.getElementById('labelR');
    const labelDel = document.getElementById('labelDel');

    if (labelSt) labelSt.textContent = `${t.scores.st}/25`;
    if (labelA) labelA.textContent = `${t.scores.a}/35`;
    if (labelR) labelR.textContent = `${t.scores.r}/25`;
    if (labelDel) labelDel.textContent = `${t.scores.del}/15`;
  };

  document.querySelectorAll('[data-track-chip]').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('[data-track-chip]').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      renderInterviewTrack(chip.dataset.trackChip);
    });
  });

  const btnSimulateAnswer = document.getElementById('btnSimulateAnswer');
  btnSimulateAnswer?.addEventListener('click', () => {
    const bars = document.querySelectorAll('.audio-bar');
    bars.forEach(b => b.classList.add('animating'));
    btnSimulateAnswer.disabled = true;
    btnSimulateAnswer.textContent = 'Simulating Speech & Vision ML...';

    setTimeout(() => {
      bars.forEach(b => b.classList.remove('animating'));
      btnSimulateAnswer.disabled = false;
      btnSimulateAnswer.innerHTML = '<svg style="width:14px;height:14px;fill:currentColor;"><use href="#i-spark"/></svg> Evaluate Answer';
      renderInterviewTrack(activeTrack);
      showToast('AI Evaluator completed: Multimodal scores and STAR feedback updated!');
    }, 1200);
  });

  // ATS Scanner Interactive Profiles
  const atsProfiles = {
    junior_android: {
      title: 'Junior Android Engineer',
      matchScore: 88,
      matched: ['Kotlin', 'Jetpack Compose', 'Coroutines', 'MVI Architecture', 'DataStore'],
      missing: ['Ktor Network Client', 'Baseline Profiles'],
      rawBullet: 'Built the android app UI and connected APIs.',
      optimizedBullet: 'Engineered 14+ Jetpack Compose screens adopting Clean Architecture + MVI, reducing UI state latency by 35% with Ktor async pipelines.'
    },
    ios_architect: {
      title: 'Lead iOS Engineer',
      matchScore: 94,
      matched: ['Swift 5.10', 'SwiftUI', 'Actors & Async/Await', 'Apple Vision', 'Core Data'],
      missing: ['Combine Legacy Bridge'],
      rawBullet: 'Worked on face detection and user interface in Swift.',
      optimizedBullet: 'Architected real-time on-device gaze & posture tracking using Apple Vision Framework, processing 30 FPS at sub-25ms latency with 0 frame drops.'
    },
    backend_lead: {
      title: 'Senior Spring Backend',
      matchScore: 92,
      matched: ['Java 21', 'Spring Boot 3', 'PostgreSQL pgvector', 'JWT Auth', 'Docker'],
      missing: ['Kafka Streams'],
      rawBullet: 'Created database queries and interview REST endpoints.',
      optimizedBullet: 'Implemented semantic question retrieval using PostgreSQL pgvector HNSW indexing, accelerating contextual question retrieval to p95 < 80ms.'
    }
  };

  const renderAtsProfile = (key) => {
    const p = atsProfiles[key];
    const scoreEl = document.getElementById('atsMatchScore');
    const scoreBar = document.getElementById('atsScoreBar');
    const matchedEl = document.getElementById('atsMatchedSkills');
    const missingEl = document.getElementById('atsMissingSkills');
    const rawEl = document.getElementById('atsRawBullet');
    const optEl = document.getElementById('atsOptBullet');

    if (scoreEl) scoreEl.textContent = `${p.matchScore}%`;
    if (scoreBar) scoreBar.style.width = `${p.matchScore}%`;
    if (rawEl) rawEl.textContent = p.rawBullet;
    if (optEl) optEl.textContent = p.optimizedBullet;

    if (matchedEl) {
      matchedEl.innerHTML = p.matched.map(s => `<span class="skill-pill skill-match"><svg style="width:12px;height:12px;fill:currentColor;"><use href="#i-check"/></svg> ${s}</span>`).join('');
    }
    if (missingEl) {
      missingEl.innerHTML = p.missing.map(s => `<span class="skill-pill skill-missing"><svg style="width:12px;height:12px;fill:currentColor;"><use href="#i-close"/></svg> ${s}</span>`).join('');
    }
  };

  document.querySelectorAll('[data-ats-role]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-ats-role]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderAtsProfile(btn.dataset.atsRole);
    });
  });

  const btnOptimizeCv = document.getElementById('btnOptimizeCv');
  btnOptimizeCv?.addEventListener('click', () => {
    const optEl = document.getElementById('atsOptBullet');
    if (!optEl) return;
    optEl.style.opacity = '0.4';
    btnOptimizeCv.disabled = true;
    setTimeout(() => {
      optEl.style.opacity = '1';
      btnOptimizeCv.disabled = false;
      showToast('CV Bullet point rewritten with Google X-Y-Z formula!');
    }, 600);
  });

  // Playground Tab Switcher
  document.querySelectorAll('[data-playground-tab]').forEach(tabBtn => {
    tabBtn.addEventListener('click', () => {
      document.querySelectorAll('[data-playground-tab]').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('[data-playground-view]').forEach(v => v.style.display = 'none');
      tabBtn.classList.add('active');
      const targetView = document.querySelector(`[data-playground-view="${tabBtn.dataset.playgroundTab}"]`);
      if (targetView) targetView.style.display = 'block';
    });
  });

  // Interactive Career Readiness Calculator
  const calcSlider = document.getElementById('calcHoursSlider');
  const calcHoursVal = document.getElementById('calcHoursVal');
  const calcReadiness = document.getElementById('calcReadiness');
  const calcWeeks = document.getElementById('calcWeeks');
  const calcPercentile = document.getElementById('calcPercentile');

  const updateCalculator = (hours) => {
    if (calcHoursVal) calcHoursVal.textContent = `${hours} hrs / week`;
    const readiness = Math.min(98, Math.round(52 + hours * 3.8));
    const weeks = Math.max(2, (14 - hours * 0.9)).toFixed(1);
    const percentile = Math.min(99, Math.round(60 + hours * 3.2));

    if (calcReadiness) calcReadiness.textContent = `${readiness}%`;
    if (calcWeeks) calcWeeks.textContent = `${weeks} wks`;
    if (calcPercentile) calcPercentile.textContent = `Top ${100 - percentile}%`;
  };

  calcSlider?.addEventListener('input', (e) => updateCalculator(Number(e.target.value)));

  // Initial renders
  if (document.getElementById('simPromptTag')) renderInterviewTrack('android');
  if (document.getElementById('atsMatchScore')) renderAtsProfile('junior_android');
  if (document.getElementById('calcHoursVal')) updateCalculator(6);

  // Contact Form Submission Handler
  const contactForm = document.getElementById('contactForm');
  contactForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = contactForm.querySelector('button[type="submit"]');
    const origText = btn ? btn.innerHTML : '';
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<span class="camera-badge-dot" style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#fff;margin-right:6px;animation:pulseDot 1s infinite;"></span> Sending message...';
    }

    setTimeout(() => {
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = origText;
      }
      contactForm.reset();
      showToast('Thank you! Your message has been sent successfully. Our team will get back to you shortly.');
    }, 900);
  });

  // QR Code Modal Handlers
  const qrModal = document.getElementById('qrModal');
  const qrImage = document.getElementById('qrImage');
  const qrTitle = document.getElementById('qrModalTitle');
  const qrDesc = document.getElementById('qrModalDesc');
  const qrActionBtn = document.getElementById('qrActionBtn');
  const qrActionText = document.getElementById('qrActionText');
  const qrCopyBtn = document.getElementById('qrCopyBtn');

  let currentQrType = 'apk';

  const openQrModal = (type = 'apk') => {
    if (!qrModal) return;
    setQrType(type);
    qrModal.classList.add('open');
    qrModal.setAttribute('aria-hidden', 'false');
    body.style.overflow = 'hidden';
  };

  const closeQrModal = () => {
    if (!qrModal) return;
    qrModal.classList.remove('open');
    qrModal.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';
  };

  const setQrType = (type) => {
    currentQrType = type;
    document.querySelectorAll('#qrTypeSelector [data-qr-type]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.qrType === type);
    });

    if (type === 'apk') {
      const driveUrl = config.apkUrl || 'https://drive.google.com/file/d/1UaDY4iH1V7P2FbzhyFoJamS35vxfknQp/view?usp=sharing';
      if (qrImage) qrImage.src = 'assets/qr-apk-download.svg';
      if (qrTitle) qrTitle.textContent = 'Download APK via Google Drive';
      if (qrDesc) qrDesc.textContent = 'Scan with your phone camera or click below to download the signed Android release from Google Drive.';
      if (qrActionBtn) {
        qrActionBtn.href = driveUrl;
        qrActionBtn.setAttribute('target', '_blank');
        qrActionBtn.setAttribute('rel', 'noopener noreferrer');
        qrActionBtn.removeAttribute('download');
      }
      if (qrActionText) qrActionText.textContent = 'Open Google Drive Download';
    } else {
      if (qrImage) qrImage.src = 'assets/qr-live-demo.svg';
      if (qrTitle) qrTitle.textContent = 'Open Mobile Emulator';
      if (qrDesc) qrDesc.textContent = 'Scan with your phone camera to test the real-time mobile interface in your mobile browser.';
      if (qrActionBtn) {
        qrActionBtn.href = 'emulator.html';
        qrActionBtn.removeAttribute('download');
      }
      if (qrActionText) qrActionText.textContent = 'Open Emulator Page';
    }
  };

  document.querySelectorAll('[data-open-qr]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openQrModal(btn.dataset.openQr || 'apk');
    });
  });

  document.querySelectorAll('[data-close-qr]').forEach(btn => {
    btn.addEventListener('click', closeQrModal);
  });

  document.querySelectorAll('#qrTypeSelector [data-qr-type]').forEach(btn => {
    btn.addEventListener('click', () => setQrType(btn.dataset.qrType));
  });

  qrCopyBtn?.addEventListener('click', () => {
    const origin = (window.location.origin && !window.location.origin.includes('localhost'))
      ? window.location.origin
      : (config.productionUrl || 'https://career-pilot-indol.vercel.app');
    const url = currentQrType === 'apk' 
      ? (config.apkUrl || 'https://drive.google.com/file/d/1UaDY4iH1V7P2FbzhyFoJamS35vxfknQp/view?usp=sharing')
      : (origin + '/emulator.html');
    navigator.clipboard?.writeText(url).then(() => {
      showToast('Link copied to clipboard: ' + url);
    }).catch(() => {
      showToast('Link: ' + url);
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && qrModal?.classList.contains('open')) closeQrModal();
  });

  document.querySelectorAll('details').forEach(detail => detail.addEventListener('toggle', () => {
    if (!detail.open) return;
    document.querySelectorAll('details').forEach(other => { if (other !== detail) other.open = false; });
  }));

  // App Screenshot Gallery Filter & Lightbox
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryCards = document.querySelectorAll('.gallery-card');
  const lightbox = document.getElementById('screenshotLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      galleryCards.forEach(card => {
        if (filter === 'all' || card.dataset.category?.includes(filter)) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  const openLightbox = (imgSrc, title) => {
    if (!lightbox || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    if (lightboxCaption) lightboxCaption.textContent = title || 'Career Pilot Native Interface';
    lightbox.classList.add('open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  galleryCards.forEach(card => {
    card.addEventListener('click', () => {
      const imgSrc = card.dataset.img;
      const title = card.dataset.title;
      if (imgSrc) openLightbox(imgSrc, title);
    });
  });

  lightboxClose?.addEventListener('click', closeLightbox);
  lightboxBackdrop?.addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && lightbox?.classList.contains('open')) closeLightbox();
  });
})();
}

