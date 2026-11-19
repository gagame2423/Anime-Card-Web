ANIME CARD RNG — AUTO CHESS CO-OP RECOVERY AND CONNECTION MODES
Build: 20261119-ac-live-reconcile-1
Date: 19 November 2026

WHAT CHANGED

The post-Neutral stall was possible because the host waited for every combat
job, including background bot fights, before entering Results. A delayed
worker could hold the whole room even after a human's fight had finished.
Ready was hidden during that wait and throughout Results. The former lock
handshake also waited for guest acknowledgements, and phase snapshots carried
full combat telemetry that was unnecessary for advancing the round.

- The host fills open board slots from the bench and publishes the locked
  boards before combat. An acknowledgement is no longer required to start.
- A round reconciles when all connected living humans' authoritative fights
  finish, or four seconds after the first such fight finishes. The host
  completes any pending fights in short batches, replaying stalled workers
  from the same committed boards and seeds. The four seconds is when recovery
  starts; the remaining computation still needs to finish. A wall-clock
  backstop also covers rounds where no human result arrives. If the deterministic
  replay repeatedly fails, only that fight settles as a draw.
- Combat, Results and the next Planning or Draft use separate transition
  state. Ready, board locks and lock receipts are cleared after settlement.
  The host may choose Next Round after the summary animation, or let the
  six-second Results timer advance the whole room. Ready is available in the
  next Planning phase. Guests do not need to acknowledge the summary.
- If a guest stays on an older phase, it asks for the latest host snapshot.
  Guest replay progress cannot delay settlement or determine damage or rewards.
  Routine snapshots omit per-unit combat metrics; the match report is still
  transferred at completion. Live packets are separate from cloud replay saves.
- Brief Internet or signaling interruptions no longer automatically abandon a
  live match. The reconnect path gives a pending handshake time to finish
  and preserves the guest's seat during the connection grace period.

CHOOSING A CONNECTION MODE

Online Relay (default) — remote friends or mobile data
1. The host chooses Online Relay and shares the AC- invite code.
2. Guests enter that code and select Join. The room code automatically sets
   the guest to the same mode.
3. The connection has the project's full STUN and Metered TURN configuration.
   WebRTC may use a direct path where available; a TURN path uses metered
   bandwidth. The badge reports the selected mode and linked peers.

LAN / Direct Wi-Fi — friends on the same router
1. The host chooses LAN / Direct Wi-Fi and shares the AL- invite code.
2. Guests use the AL- code and wait for the linked status before the host
   starts. Both sides use direct WebRTC candidates and one STUN server.
   No TURN server is configured for an AL- room, so its gameplay does not
   use Metered TURN bandwidth.
3. If the direct link is still pending after about six seconds, the lobby
   offers Switch to Online Relay. The attempt can still complete if you wait.
   For fallback, the host switches first and shares the AC- code with the
   same suffix. Guests can then use the switch or join that AC- code.
   A host mode change recreates the room before Start; any guests already
   linked must join again. Mode cannot be switched during a match.

LAN mode still uses the existing PeerJS signaling service to establish
connections, so it is not an offline lobby. Wi-Fi client isolation or blocked
peer traffic can prevent direct links. Local latency depends on your network;
it is not guaranteed to be zero. The preference is remembered on each device.

INSTALLATION AND TURN SETUP

1. Apply this patch on top of the existing game, including the previous
   Mobile Formation QoL patch if it has not already been applied. Extract the
   ZIP at the game root, where index.html is located, and overwrite the files
   listed below. Keep existing assets and all other files.
2. Deploy the new index.html with the JavaScript and CSS together. Reload
   the game on both devices before creating and joining a new room. The
   cache versions for the changed modules and the combat worker are updated.
3. Leave the working Metered TURN configuration in online_utils.js in place.
   To enable relay on a deployment where it has not been configured, the
   site operator must set up its existing TURN_SERVER configuration or
   provision credentials through its deployment. The patch supplies no new
   credentials. If TURN is absent, the lobby shows a warning and Online Relay
   still attempts a direct connection using STUN.
4. No save reset or Firebase rules change is needed. Firebase continues to
   handle recorded runs and leaderboards, not live phase progression.

PATCH CONTENTS

- autochess.js — shared Ready and lock reset at round transitions.
- autochess_combat.js — authoritative combat recovery and Results advance.
- autochess_live.js — non-blocking lock, phase reconciliation and live snapshots.
- autochess_online.js — LAN and Relay profiles, invite routing and reconnection.
- autochess_lobby.js — mode switch, link status and fallback prompt.
- autochess_view.js — live HUD badge and host Next Round / Ready controls.
- autochess_panels.js — connection and round flow instructions in the Guide.
- autochess.css — responsive styles for the new controls and badge.
- index.html — cache versions for changed modules and styles.
- README.txt — this patch's change and setup notes.

VERIFICATION

- In a local two-peer browser test, Shared Draft, Neutral combat, Results,
  Next Round, and the next Ready action all advanced.
- A test with stalled combat workers exercised the four-second recovery.
  A separate test withheld the Results snapshot and verified guest resync.
- The invite transport tests checked STUN-only LAN settings, the six-second
  prompt, and the Relay configuration after switching. Live Metered service
  availability and latency on a particular router were not measured.
