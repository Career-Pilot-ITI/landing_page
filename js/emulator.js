if (typeof window !== 'undefined') {
(function () {
  'use strict';

  // State
  const state = {
    activeScreen: 'dashboard',
    isLocked: false,
    platform: 'android', // 'android' | 'ios'
    volume: 70, // 0 to 100
    coins: 120,
    activeInterviewTrack: 'android',
    isRecording: false,
    sprintSeconds: 258 // 04:18
  };

  // DOM Elements (may exist on multiple pages or inside emulator containers)
  const initEmulators = () => {
    document.querySelectorAll('.phone-emulator').forEach(phone => {
      setupPhoneInstance(phone);
    });
  };

  const setupPhoneInstance = (phone) => {
    // 1. Live Clock in Status Bar and Lock Screen
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const timeStr = `${hours}:${mins}`;

      const statusTime = phone.querySelector('.status-clock');
      if (statusTime) statusTime.textContent = timeStr;

      const lockTime = phone.querySelector('.lock-time');
      if (lockTime) lockTime.textContent = timeStr;

      const lockDate = phone.querySelector('.lock-date');
      if (lockDate) {
        const options = { weekday: 'long', month: 'short', day: 'numeric' };
        lockDate.textContent = now.toLocaleDateString('en-US', options);
      }
    };
    setInterval(updateTime, 1000);
    updateTime();

    // 2. Screen Navigation Router with Sub-Screen Tab Mapping
    const tabMap = {
      'dashboard': 'dashboard',
      'interview': 'interview',
      'live-interview': 'interview',
      'feedback': 'interview',
      'ats': 'dashboard',
      'ats-result': 'dashboard',
      'challenges': 'challenges',
      'leaderboard': 'challenges',
      'lessons': 'dashboard',
      'quiz': 'dashboard',
      'reports': 'dashboard',
      'onboarding': 'dashboard',
      'auth': 'wallet',
      'wallet': 'wallet'
    };

    const switchScreen = (screenName) => {
      state.activeScreen = screenName;
      phone.querySelectorAll('.app-screen').forEach(scr => scr.classList.remove('active'));
      phone.querySelectorAll('.nav-tab-item').forEach(tab => tab.classList.remove('active'));

      const targetScreen = phone.querySelector(`[data-screen="${screenName}"]`);
      const parentTabKey = tabMap[screenName] || screenName;
      const targetTab = phone.querySelector(`[data-nav-target="${parentTabKey}"]`);

      if (targetScreen) {
        targetScreen.classList.add('active');
        // Scroll to top of screen container on transition
        const container = phone.querySelector('.app-screen-container');
        if (container) container.scrollTop = 0;
      }
      if (targetTab) targetTab.classList.add('active');

      // Sync external control panel buttons
      document.querySelectorAll('[data-emu-screen]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.emuScreen === screenName);
      });
    };

    phone.querySelectorAll('[data-nav-target]').forEach(tab => {
      tab.addEventListener('click', () => switchScreen(tab.dataset.navTarget));
    });

    phone.querySelectorAll('[data-jump-screen]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        switchScreen(btn.dataset.jumpScreen);
      });
    });

    // 3. Hardware Lock / Power Button
    const lockOverlay = phone.querySelector('.lock-screen-overlay');
    const toggleLock = () => {
      state.isLocked = !state.isLocked;
      if (lockOverlay) {
        lockOverlay.classList.toggle('active', state.isLocked);
      }
    };

    const powerBtn = phone.querySelector('.hw-power');
    powerBtn?.addEventListener('click', toggleLock);
    lockOverlay?.addEventListener('click', () => {
      if (state.isLocked) toggleLock();
    });

    // 4. Hardware Volume Controls
    const volumeHud = phone.querySelector('.volume-hud');
    const volumeFill = phone.querySelector('.volume-hud-fill');
    let volumeTimeout;

    const adjustVolume = (delta) => {
      state.volume = Math.min(100, Math.max(0, state.volume + delta));
      if (volumeHud && volumeFill) {
        volumeFill.style.height = `${state.volume}%`;
        volumeHud.classList.add('active');
        clearTimeout(volumeTimeout);
        volumeTimeout = setTimeout(() => volumeHud.classList.remove('active'), 1200);
      }
    };

    phone.querySelector('.hw-vol-up')?.addEventListener('click', () => adjustVolume(10));
    phone.querySelector('.hw-vol-down')?.addEventListener('click', () => adjustVolume(-10));

    // 5. In-App Mock Interview Simulation
    const setupView = phone.querySelector('#emuInterviewSetup');
    const liveView = phone.querySelector('#emuInterviewLive');
    const btnLaunchLive = phone.querySelector('#btnLaunchInterviewLive');
    const btnQuitLive = phone.querySelector('#btnQuitInterview');
    const btnSubmitLiveAnswer = phone.querySelector('#btnSubmitLiveAnswer');
    const interviewModal = phone.querySelector('.interview-result-modal');

    btnLaunchLive?.addEventListener('click', () => {
      if (setupView) setupView.style.display = 'none';
      if (liveView) liveView.style.display = 'block';
    });

    btnQuitLive?.addEventListener('click', () => {
      if (liveView) liveView.style.display = 'none';
      if (setupView) setupView.style.display = 'block';
    });

    btnSubmitLiveAnswer?.addEventListener('click', () => {
      if (interviewModal) interviewModal.classList.add('active');
    });

    phone.querySelector('.btn-close-interview-modal')?.addEventListener('click', () => {
      if (interviewModal) interviewModal.classList.remove('active');
      if (liveView) liveView.style.display = 'none';
      if (setupView) setupView.style.display = 'block';
    });

    // Interview Type selector
    phone.querySelectorAll('.emu-type-card').forEach(card => {
      card.addEventListener('click', () => {
        phone.querySelectorAll('.emu-type-card').forEach(c => {
          c.classList.remove('active');
          c.style.borderColor = 'var(--app-border)';
          c.style.background = 'var(--app-card)';
        });
        card.classList.add('active');
        card.style.borderColor = 'var(--app-primary)';
        card.style.background = 'rgba(255,122,69,0.06)';
      });
    });

    // 6. ATS Match Simulation
    const btnOptBullet = phone.querySelector('.btn-emu-optimize-bullet');
    const atsResultCard = phone.querySelector('#emuAtsResultCard');
    btnOptBullet?.addEventListener('click', () => {
      btnOptBullet.disabled = true;
      btnOptBullet.innerHTML = '<span class="camera-badge-dot"></span> Analyzing CV with pgvector...';
      setTimeout(() => {
        if (atsResultCard) atsResultCard.style.display = 'block';
        btnOptBullet.disabled = false;
        btnOptBullet.innerHTML = '<svg style="width:12px;height:12px;fill:currentColor;"><use href="#i-target"/></svg><span>Scan Another Job</span>';
        showEmuToast(phone, 'ATS Match Score: 88% (Top 8% Fit)');
      }, 600);
    });

    // 7. Coin Purchase Simulation
    const coinCounters = phone.querySelectorAll('.emu-coin-val');
    const updateCoins = (amount) => {
      state.coins += amount;
      coinCounters.forEach(c => {
        c.textContent = `${state.coins}`;
        c.style.transform = 'scale(1.25)';
        setTimeout(() => c.style.transform = 'scale(1)', 200);
      });
      showEmuToast(phone, `Added +${amount} Coins! Balance: ${state.coins}`);
    };

    phone.querySelectorAll('[data-buy-coins]').forEach(btn => {
      btn.addEventListener('click', () => updateCoins(Number(btn.dataset.buyCoins)));
    });

    // 8. Live Challenge Sprint Countdown
    const sprintClock = phone.querySelector('.sprint-timer-clock');
    if (sprintClock) {
      setInterval(() => {
        if (state.sprintSeconds > 0) {
          state.sprintSeconds--;
          const m = String(Math.floor(state.sprintSeconds / 60)).padStart(2, '0');
          const s = String(state.sprintSeconds % 60).padStart(2, '0');
          sprintClock.textContent = `${m}:${s} remaining`;
        }
      }, 1000);
    }
  };

  // Helper toast inside phone
  const showEmuToast = (phone, msg) => {
    let t = phone.querySelector('.phone-toast');
    if (!t) {
      t = document.createElement('div');
      t.className = 'phone-toast';
      t.style.cssText = 'position:absolute;top:50px;left:14px;right:14px;background:rgba(15,23,42,0.92);backdrop-filter:blur(8px);border:1px solid rgba(45,212,191,0.4);border-radius:10px;padding:8px 12px;font-size:10px;font-weight:700;color:#2DD4BF;z-index:45;text-align:center;box-shadow:0 6px 16px rgba(0,0,0,0.4);transition:all 0.2s;';
      phone.querySelector('.phone-inner').appendChild(t);
    }
    t.textContent = msg;
    t.style.opacity = '1';
    t.style.transform = 'translateY(0)';
    setTimeout(() => {
      t.style.opacity = '0';
      t.style.transform = 'translateY(-6px)';
    }, 2400);
  };

  // Platform Toggle (Android / iOS)
  window.setEmulatorPlatform = (platform) => {
    state.platform = platform;
    document.querySelectorAll('.phone-emulator').forEach(p => {
      p.setAttribute('data-platform', platform);
      if (platform === 'ios') {
        p.style.setProperty('--phone-radius', '50px');
      } else {
        p.style.setProperty('--phone-radius', '40px');
      }
    });
    document.querySelectorAll('[data-emu-platform]').forEach(b => {
      b.classList.toggle('active', b.dataset.emuPlatform === platform);
    });
  };

  // External Screen Switcher helper
  window.setEmulatorScreen = (screenName) => {
    const tabMap = {
      'dashboard': 'dashboard',
      'interview': 'interview',
      'live-interview': 'interview',
      'feedback': 'interview',
      'ats': 'dashboard',
      'ats-result': 'dashboard',
      'challenges': 'challenges',
      'leaderboard': 'challenges',
      'lessons': 'dashboard',
      'quiz': 'dashboard',
      'reports': 'dashboard',
      'onboarding': 'dashboard',
      'auth': 'wallet',
      'wallet': 'wallet'
    };

    document.querySelectorAll('.phone-emulator').forEach(phone => {
      phone.querySelectorAll('.app-screen').forEach(scr => scr.classList.remove('active'));
      phone.querySelectorAll('.nav-tab-item').forEach(tab => tab.classList.remove('active'));

      const targetScreen = phone.querySelector(`[data-screen="${screenName}"]`);
      const parentTabKey = tabMap[screenName] || screenName;
      const targetTab = phone.querySelector(`[data-nav-target="${parentTabKey}"]`);

      if (targetScreen) {
        targetScreen.classList.add('active');
        const container = phone.querySelector('.app-screen-container');
        if (container) container.scrollTop = 0;
      }
      if (targetTab) targetTab.classList.add('active');

      document.querySelectorAll('[data-emu-screen]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.emuScreen === screenName);
      });
    });
  };

  // Initialize on load
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEmulators);
  } else {
    initEmulators();
  }
})();
}
