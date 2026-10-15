/* One gesture-activated silent audio graph; lifecycle recovery stays in app.js.
   Silent audio cannot override browser/OS freezing or tab-discard policies. */
(function (host) {
  'use strict';
  const doc = host.document;
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
  function gesture() { activated = true; void resumeAudio(); }
  for (const event of ['pointerdown', 'keydown', 'click']) doc.addEventListener(event, gesture, { capture: true, passive: true });
  doc.addEventListener('visibilitychange', () => { if (doc.visibilityState === 'visible') void resumeAudio(); });
  doc.addEventListener('freeze', () => bridge.onFreeze?.());
  doc.addEventListener('resume', () => { leaving = false; void resumeAudio(); bridge.onResume?.(); });
  host.addEventListener('pageshow', event => {
    leaving = false; void resumeAudio();
    if (event.persisted) bridge.onResume?.();
  });
  host.addEventListener('pagehide', event => {
    leaving = true;
    if (!context) return;
    if (event.persisted) { void context.suspend().catch(() => {}); return; }
    try { source?.stop(); source?.disconnect(); gain?.disconnect(); void context.close().catch(() => {}); } catch (_) {}
    context = source = gain = null; pending = null;
  });
  host.BackgroundActivitySystem = Object.freeze({
    configure: options => { bridge = options || {}; }, resumeAudio,
    getStatus: () => ({ supported: Boolean(audioConstructor()), activated, state: context?.state || 'inactive', silent: true })
  });
})(window);
