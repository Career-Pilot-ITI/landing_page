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

    // 2. Screen Navigation Router
    const switchScreen = (screenName) => {
      state.activeScreen = screenName;
      phone.querySelectorAll('.app-screen').forEach(scr => scr.classList.remove('active'));
      phone.querySelectorAll('.nav-tab-item').forEach(tab => tab.classList.remove('active'));

      const targetScreen = phone.querySelector(`[data-screen="${screenName}"]`);
      const targetTab = phone.querySelector(`[data-nav-target="${screenName}"]`);

      if (targetScreen) targetScreen.classList.add('active');
      if (targetTab) targetTab.classList.add('active');

      // Sync external control panel buttons if present
      document.querySelectorAll('[data-emu-screen]').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.emuScreen === screenName);
      });
    };

    phone.querySelectorAll('[data-nav-target]').forEach(tab => {
      tab.addEventListener('click', () => switchScreen(tab.dataset.navTarget));
    });

    phone.querySelectorAll('[data-jump-screen]').forEach(btn => {
      btn.addEventListener('click', () => switchScreen(btn.dataset.jumpScreen));
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
    const btnStartSim = phone.querySelector('.btn-sim-record');
    const audioWaves = phone.querySelectorAll('.sim-wave-bar');
    const interviewModal = phone.querySelector('.interview-result-modal');

    btnStartSim?.addEventListener('click', () => {
      if (!state.isRecording) {
        state.isRecording = true;
        btnStartSim.innerHTML = '<span class="camera-badge-dot"></span> Listening... (Tap to Finish)';
        btnStartSim.style.background = '#EF4444';
        audioWaves.forEach(w => w.classList.add('animating'));
      } else {
        state.isRecording = false;
        btnStartSim.innerHTML = '<svg style="width:14px;height:14px;fill:currentColor;"><use href="#i-mic"/></svg> Start Speaking';
        btnStartSim.style.background = '';
        audioWaves.forEach(w => w.classList.remove('animating'));
        if (interviewModal) interviewModal.classList.add('active');
      }
    });

    phone.querySelector('.btn-close-interview-modal')?.addEventListener('click', () => {
      if (interviewModal) interviewModal.classList.remove('active');
    });

    // 6. ATS Bullet Optimization Simulation
    const btnOptBullet = phone.querySelector('.btn-emu-optimize-bullet');
    const optTarget = phone.querySelector('.emu-opt-bullet-text');
    btnOptBullet?.addEventListener('click', () => {
      if (!optTarget) return;
      optTarget.style.opacity = '0.3';
      btnOptBullet.disabled = true;
      btnOptBullet.textContent = 'Rewriting with X-Y-Z...';
      setTimeout(() => {
        optTarget.style.opacity = '1';
        optTarget.innerHTML = '<b>Engineered 14+ Jetpack Compose screens</b> adopting Clean Architecture + MVI, reducing UI state latency by 35% with Ktor async pipelines.';
        btnOptBullet.disabled = false;
        btnOptBullet.textContent = 'Optimized with AI ✨';
      }, 700);
    });

    // 7. Coin Purchase Simulation
    const coinCounters = phone.querySelectorAll('.emu-coin-val');
    const updateCoins = (amount) => {
      state.coins += amount;
      coinCounters.forEach(c => {
        c.textContent = `${state.coins} Coins`;
        c.style.transform = 'scale(1.2)';
        setTimeout(() => c.style.transform = 'scale(1)', 200);
      });
      showEmuToast(phone, `Added +${amount} Coins! New Balance: ${state.coins}`);
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
    document.querySelectorAll('.phone-emulator').forEach(phone => {
      const tab = phone.querySelector(`[data-nav-target="${screenName}"]`);
      if (tab) tab.click();
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
