// Career Pilot Enterprise B2B - Central Client API & Session Controller

const CompanyApi = (() => {
  const API_BASE = "http://localhost:8080/api/v1";

  // Default seed data for instant, reliable client-side operation & offline demo
  const DEFAULT_COMPANY = {
    id: "comp_acme_01",
    name: "Acme Technologies",
    logoUrl: null,
    brandColor: "#FF7A45",
    industry: "Mobile & AI Software",
    website: "https://acme.tech",
    subscriptionTier: "GROWTH",
    subscriptionStatus: "ACTIVE",
    applicantsIncluded: 50,
    applicantsUsed: 19
  };

  const DEFAULT_INTERVIEWS = [
    {
      id: "int_android_01",
      title: "Senior Android Engineer",
      description: "Technical & System Design assessment for Kotlin, Coroutines, Jetpack Compose, and clean architecture.",
      status: "PUBLISHED",
      deadline: "2026-09-15T23:59:59Z",
      isRandomOrder: true,
      totalInvited: 15,
      totalCompleted: 12,
      averageScore: 88,
      createdAt: "2026-08-20T10:00:00Z",
      questions: [
        {
          id: "q_1",
          questionText: "Can you explain how Kotlin Coroutines manage structured concurrency, and how you handle Dispatchers and exception propagation?",
          evaluationCriteria: "Candidate must explain CoroutineScope, SupervisorJob, difference between Dispatchers.IO and Default, and cancellation propagation. Max 60 if they only define what a coroutine is without discussing exception handling.",
          timeLimitSeconds: 90,
          weight: 2
        },
        {
          id: "q_2",
          questionText: "How do you optimize Jetpack Compose recomposition performance and ensure stability for state holders?",
          evaluationCriteria: "Candidate must mention @Stable/@Immutable annotations, derivedStateOf, remember with keys, skippable composables, and avoiding reading state too early.",
          timeLimitSeconds: 90,
          weight: 1
        },
        {
          id: "q_3",
          questionText: "Describe your approach to implementing clean MVI architecture with unidirectional data flow.",
          evaluationCriteria: "Must mention UiState (immutable StateFlow), UiIntent (actions to ViewModel), and UiEffect (one-off Channels for navigation/snackbars).",
          timeLimitSeconds: 120,
          weight: 2
        }
      ]
    },
    {
      id: "int_backend_02",
      title: "Spring Cloud Backend Architect",
      description: "Distributed microservices, PostgreSQL pgvector RAG, and high-throughput security.",
      status: "PUBLISHED",
      deadline: "2026-09-20T23:59:59Z",
      isRandomOrder: false,
      totalInvited: 9,
      totalCompleted: 7,
      averageScore: 81,
      createdAt: "2026-08-22T14:30:00Z",
      questions: [
        {
          id: "q_b1",
          questionText: "Explain how pgvector handles vector indexing (HNSW vs IVFFlat) and RAG embeddings retrieval in PostgreSQL.",
          evaluationCriteria: "Candidate must discuss cosine similarity vs inner product, indexing trade-offs, and chunking strategy.",
          timeLimitSeconds: 90,
          weight: 2
        }
      ]
    }
  ];

  const DEFAULT_CANDIDATES = [
    {
      id: "cand_1",
      interviewId: "int_android_01",
      name: "Sarah Jenkins",
      email: "sarah.jenkins@example.com",
      status: "COMPLETED",
      token: "tk_sarah92",
      emailSentAt: "2026-08-21T09:15:00Z",
      overallScore: 92,
      sessionId: "sess_sarah_01"
    },
    {
      id: "cand_2",
      interviewId: "int_android_01",
      name: "Omar Farooq",
      email: "omar.farooq@example.com",
      status: "COMPLETED",
      token: "tk_omar88",
      emailSentAt: "2026-08-21T09:15:00Z",
      overallScore: 88,
      sessionId: "sess_omar_02"
    },
    {
      id: "cand_3",
      interviewId: "int_android_01",
      name: "Layla Mansour",
      email: "layla.m@example.com",
      status: "STARTED",
      token: "tk_layla03",
      emailSentAt: "2026-08-22T11:00:00Z",
      overallScore: null,
      sessionId: null
    },
    {
      id: "cand_4",
      interviewId: "int_android_01",
      name: "Tarek Nabil",
      email: "tarek.nabil@example.com",
      status: "SENT",
      token: "tk_tarek04",
      emailSentAt: "2026-08-22T11:00:00Z",
      overallScore: null,
      sessionId: null
    }
  ];

  // Helper Storage Initializer
  function initStorage() {
    if (!localStorage.getItem("cp_interviews")) {
      localStorage.setItem("cp_interviews", JSON.stringify(DEFAULT_INTERVIEWS));
    }
    if (!localStorage.getItem("cp_candidates")) {
      localStorage.setItem("cp_candidates", JSON.stringify(DEFAULT_CANDIDATES));
    }
  }

  initStorage();

  // Auth & Session
  function getSession() {
    const raw = localStorage.getItem("cp_company_session");
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  function setSession(sessionData) {
    localStorage.setItem("cp_company_session", JSON.stringify(sessionData));
  }

  function clearSession() {
    localStorage.removeItem("cp_company_session");
    localStorage.removeItem("cp_company_token");
  }

  function requireAuth() {
    const session = getSession();
    if (!session) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  }

  // API Methods
  return {
    getSession,
    setSession,
    clearSession,
    requireAuth,

    async register(data) {
      try {
        const res = await fetch(`${API_BASE}/company/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data)
        });
        if (res.ok) return await res.json();
      } catch (e) {}

      // Fallback local registration simulation
      const session = {
        token: "jwt_mock_" + Math.random().toString(36).substring(2),
        user: { name: data.name, email: data.email, role: "ADMIN" },
        company: {
          id: "comp_" + Math.random().toString(36).substring(2, 8),
          name: data.companyName,
          brandColor: "#FF7A45",
          industry: data.industry || "Technology",
          website: data.website || "",
          subscriptionTier: "STARTER",
          applicantsIncluded: 10,
          applicantsUsed: 0
        }
      };
      localStorage.setItem("cp_pending_reg", JSON.stringify(session));
      return { success: true, email: data.email };
    },

    async verifyOtp(email, code) {
      try {
        const res = await fetch(`${API_BASE}/company/auth/verify-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, code })
        });
        if (res.ok) {
          const body = await res.json();
          setSession(body);
          return body;
        }
      } catch (e) {}

      // Fallback verification
      const pending = localStorage.getItem("cp_pending_reg");
      const session = pending ? JSON.parse(pending) : {
        token: "jwt_mock_verified",
        user: { name: "Recruiter", email: email, role: "ADMIN" },
        company: {
          ...DEFAULT_COMPANY,
          name: email.split("@")[0].toUpperCase() + " Inc"
        }
      };
      setSession(session);
      localStorage.removeItem("cp_pending_reg");
      return session;
    },

    async login(email, password) {
      try {
        const res = await fetch(`${API_BASE}/company/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password })
        });
        if (res.ok) {
          const body = await res.json();
          setSession(body);
          return body;
        }
      } catch (e) {}

      // Fallback login
      const companyName = email.split("@")[1]?.split(".")[0]?.toUpperCase() || "ACME";
      const session = {
        token: "jwt_mock_" + Math.random().toString(36).substring(2),
        user: {
          name: email.split("@")[0].replace(".", " "),
          email: email,
          role: "ADMIN"
        },
        company: {
          ...DEFAULT_COMPANY,
          name: companyName + " Corp"
        }
      };
      setSession(session);
      return session;
    },

    getInterviews() {
      const raw = localStorage.getItem("cp_interviews");
      return raw ? JSON.parse(raw) : DEFAULT_INTERVIEWS;
    },

    getInterviewById(id) {
      const list = this.getInterviews();
      return list.find(i => i.id === id) || list[0];
    },

    saveInterview(interviewData) {
      const list = this.getInterviews();
      const newInterview = {
        ...interviewData,
        id: interviewData.id || "int_" + Math.random().toString(36).substring(2, 9),
        createdAt: new Date().toISOString(),
        totalInvited: 0,
        totalCompleted: 0,
        averageScore: null,
        status: "PUBLISHED"
      };
      list.unshift(newInterview);
      localStorage.setItem("cp_interviews", JSON.stringify(list));
      return newInterview;
    },

    getCandidates(interviewId) {
      const raw = localStorage.getItem("cp_candidates");
      const list = raw ? JSON.parse(raw) : DEFAULT_CANDIDATES;
      if (!interviewId) return list;
      return list.filter(c => c.interviewId === interviewId);
    },

    addCandidate(interviewId, candidate) {
      const raw = localStorage.getItem("cp_candidates");
      const list = raw ? JSON.parse(raw) : DEFAULT_CANDIDATES;
      const newCand = {
        id: "cand_" + Math.random().toString(36).substring(2, 9),
        interviewId: interviewId,
        name: candidate.name || "Candidate",
        email: candidate.email,
        status: "SENT",
        token: "tk_" + Math.random().toString(36).substring(2, 10),
        emailSentAt: new Date().toISOString(),
        overallScore: null,
        sessionId: null
      };
      list.unshift(newCand);
      localStorage.setItem("cp_candidates", JSON.stringify(list));

      // Update interview count
      const interviews = this.getInterviews();
      const intv = interviews.find(i => i.id === interviewId);
      if (intv) {
        intv.totalInvited = (intv.totalInvited || 0) + 1;
        localStorage.setItem("cp_interviews", JSON.stringify(interviews));
      }

      return newCand;
    },

    dispatchInvitations(interviewId) {
      const candidates = this.getCandidates(interviewId);
      candidates.forEach(c => {
        if (c.status === "READY" || c.status === "DRAFT") {
          c.status = "SENT";
          c.emailSentAt = new Date().toISOString();
        }
      });
      localStorage.setItem("cp_candidates", JSON.stringify(candidates));
      return { count: candidates.length };
    },

    getCandidateReport(sessionId) {
      return {
        applicantName: "Sarah Jenkins",
        applicantEmail: "sarah.jenkins@example.com",
        interviewTitle: "Senior Android Engineer Assessment",
        completedAt: "2026-08-25T14:22:00Z",
        totalDurationSeconds: 224,
        overallScore: 92,
        contentScore: 94,
        bodyLanguageScore: 88,
        voiceScore: 93,
        answers: [
          {
            questionOrder: 1,
            questionText: "Can you explain how Kotlin Coroutines manage structured concurrency, and how you handle Dispatchers and exception propagation?",
            durationSeconds: 78,
            speechRateWpm: 138,
            fillerWordCount: 2,
            aiScore: 94,
            transcript: "Kotlin coroutines enforce structured concurrency through CoroutineScope and Job parent-child hierarchies. When a child coroutine fails without a SupervisorJob, the cancellation propagates upwards to cancel all sibling jobs. I use Dispatchers.IO for background I/O operations and Dispatchers.Default for CPU heavy parsing and data transformation.",
            evaluationCriteria: "Candidate must explain CoroutineScope, SupervisorJob, difference between Dispatchers.IO and Default, and cancellation propagation.",
            aiEvaluation: "Candidate accurately hit every single criteria: clearly explained CoroutineScope, SupervisorJob exception scoping, Dispatchers.IO vs Default separation, and Job cancellation propagation."
          },
          {
            questionOrder: 2,
            questionText: "How do you optimize Jetpack Compose recomposition performance and ensure stability for state holders?",
            durationSeconds: 65,
            speechRateWpm: 142,
            fillerWordCount: 1,
            aiScore: 90,
            transcript: "I ensure state stability by annotating immutable domain models with @Immutable or @Stable so Compose can skip unnecessary recompositions. I also use derivedStateOf to throttle high-frequency state changes and defer reads inside layout/draw lambda modifiers.",
            evaluationCriteria: "Must mention @Stable/@Immutable annotations, derivedStateOf, and skippable composables.",
            aiEvaluation: "Excellent explanation of state stability, skippable composables, and derivedStateOf optimization."
          }
        ]
      };
    }
  };
})();
