/* One gesture-activated silent audio graph; lifecycle recovery stays in app.js.
   Silent audio cannot override browser/OS freezing or tab-discard policies. */
(function (host) {
  'use strict';
  const doc = host.document;
  const MUSIC_KEY = 'anime_card_rng_music_muted';
  let specialHold=false, fadeFrame=null;
  let music = null, musicPending = null, musicUnavailable = false, muted = false;
  try { muted = host.localStorage.getItem(MUSIC_KEY) === 'true'; } catch (_) {}
  function renderMusicControl() {
    const button = doc.getElementById('musicToggleButton');
    if (button) { button.textContent = muted ? '♫ Music OFF' : '♫ Music ON'; button.setAttribute('aria-pressed',String(muted)); button.title = musicUnavailable ? 'Add musictheme.mp4 to the game directory, then reload.' : 'Looping background music'; }
  }
  function resumeMusic() {
    if (!activated || leaving || muted || specialHold || musicUnavailable || !host.Audio) return Promise.resolve(false);
    if (musicPending) return musicPending;
    try {
      if (!music) {
        music = new host.Audio('musictheme.mp4'); music.loop = true; music.preload = 'none'; music.volume = .35;
        music.addEventListener('error',()=>{ musicUnavailable = true; renderMusicControl(); });
      }
      if (!music.paused) return Promise.resolve(true);
      musicPending = Promise.resolve(music.play()).then(()=>{if(specialHold||muted||leaving){music.pause();return false;}return true;}).catch(error=>{ if (error.name === 'NotSupportedError') musicUnavailable = true; renderMusicControl(); return false; }).finally(()=>{musicPending = null;});
      return musicPending;
    } catch (_) { return Promise.resolve(false); }
  }
  doc.getElementById('musicToggleButton')?.addEventListener('click',()=>{
    muted = !muted; try { host.localStorage.setItem(MUSIC_KEY,JSON.stringify(muted)); } catch (_) {}
    if (muted) music?.pause(); else void resumeMusic(); renderMusicControl();
  });
  renderMusicControl();
  let context = null, source = null, gain = null, activated = false, leaving = false, pending = null, bridge = {};
  const audioConstructor = () => host.AudioContext || host.webkitAudioContext;
  function resumeAudio() {
    if (!activated || leaving || !audioConstructor()) return Promise.resolve(false);
    if (pending) return pending;
    if (context?.state === 'running') return Promise.resolve(true);
    try {
      if (!context || context.state === 'closed') {
        context = new (audioConstructor())();
        source = context.createBufferSource();
        source.buffer = context.createBuffer(1, context.sampleRate, context.sampleRate);
        source.loop = true; // A new AudioBuffer contains zeros: genuinely silent.
        gain = context.createGain(); gain.gain.value = 0;
        source.connect(gain); gain.connect(context.destination); source.start();
        context.addEventListener?.('statechange', () => {
          if (!leaving && context?.state === 'suspended' && doc.visibilityState === 'visible') void resumeAudio();
        });
      }
      const current = context;
      pending = Promise.resolve(current.resume()).then(() => current.state === 'running').catch(() => false).finally(() => { pending = null; });
      return pending;
    } catch (_) {
      try { source?.stop(); source?.disconnect(); gain?.disconnect(); void context?.close().catch(() => {}); } catch (_) {}
      context = source = gain = null; pending = null;
      return Promise.resolve(false);
    }
  }
  function gesture() { activated = true; void resumeAudio(); void resumeMusic(); }
  for (const event of ['pointerdown', 'keydown', 'click']) doc.addEventListener(event, gesture, { capture: true, passive: true });
  doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible') { void resumeAudio(); void resumeMusic(); } });
  doc.addEventListener('freeze', () => bridge.onFreeze?.());
  doc.addEventListener('resume', () => { leaving = false; void resumeAudio(); void resumeMusic(); bridge.onResume?.(); });
  host.addEventListener('pageshow', event => {
    leaving = false; void resumeAudio(); void resumeMusic();
    if (event.persisted) bridge.onResume?.();
  });
  host.addEventListener('pagehide', event => {
    leaving = true; music?.pause();
    if (!context) return;
    if (event.persisted) { void context.suspend().catch(() => {}); return; }
    try { source?.stop(); source?.disconnect(); gain?.disconnect(); void context.close().catch(() => {}); } catch (_) {}
    context = source = gain = null; pending = null;
  });
  host.BackgroundActivitySystem = Object.freeze({
    MUSIC_KEY, holdSpecial:()=>{specialHold=true;if(fadeFrame!==null)host.cancelAnimationFrame(fadeFrame);fadeFrame=null;music?.pause();},
    releaseSpecial:()=>{
      specialHold=false;
      const resume=()=>{
        if(music)music.volume=0;
        void resumeMusic().then(ok=>{
          if(!ok||specialHold)return;
          const start=host.performance.now();
          const fade=now=>{if(specialHold||muted){fadeFrame=null;return;}music.volume=.35*Math.min(1,(now-start)/400);if(now-start<400)fadeFrame=host.requestAnimationFrame(fade);else fadeFrame=null;};
          if(fadeFrame!==null)host.cancelAnimationFrame(fadeFrame);
          fadeFrame=host.requestAnimationFrame(fade);
        });
      };
      // An immediate missing-SFX error can arrive before the first theme play settles.
      if(musicPending)void musicPending.finally(resume);else resume();
    },
    configure: options => { bridge = options || {}; }, resumeAudio, resumeMusic,
    getMusicStatus: () => ({activated,muted,unavailable:musicUnavailable,loop:music?.loop || false,paused:music?.paused ?? true,source:music?.getAttribute("src") || "musictheme.mp4"}),
    getStatus: () => ({ supported: Boolean(audioConstructor()), activated, state: context?.state || 'inactive', silent: true })
  });
})(window);
