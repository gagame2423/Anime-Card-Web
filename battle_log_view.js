/* Presentation for the legacy Arena feed, including its string-only callers. */
(function (host) {
  'use strict';
  const labels = Object.freeze({
    energy:'energy',entry:'passive', passive: 'passive', 'self-passive': 'passive', champion: 'passive', relic: 'passive', skill: 'skill', 'special attack': 'skill',
    status: 'status', debuff: 'debuff', 'anti-heal': 'bleed', 'critical hit!': 'crit', 'critical hit': 'crit', crit: 'crit',
    dodge: 'dodge', heal: 'heal', revival: 'heal', revive: 'heal', shield: 'shield', support: 'heal',
    burn: 'burn', bleed: 'bleed', poison: 'poison', dot: 'dot', stun: 'debuff', freeze: 'freeze', 'black flame':'black-flame', 'black flames':'black-flame', fear:'fear', hindred: 'hindred', hindered:'hindred', hypnosis:'hypnosis', hypothesis:'hypnosis', survive: 'heal'
  });
  const tones = new Set(['player','enemy','victory','defeat','passive','critical','status','debuff','dodge','support','heal','shield','burn','bleed','poison','special','revive','counter']);
  const events = [
    ['black-flame', 'black flames?'],
    ['burn', 'burn(?:s|ed|ing)?'],
    ['bleed', 'bleed(?:s|ing)?|bled|heal blocked'],
    ['poison', 'poison(?:s|ed|ing)?'],
    ['dot', 'damage over time|dot'],
    ['freeze', 'freez(?:e|es|ing)|froz(?:e|en)'],
    ['fear', 'fear(?:ed|s)?'],
    ['hindred', 'hind(?:red|ered)'],
    ['hypnosis', 'hyp(?:nosis|othesis|notized?)'],
    ['debuff', 'stun(?:s|ned|ning)?|debuffs?|silenced?'],
    ['crit', 'crit(?:ical)?(?: hits?)?|crits'],
    ['dodge', 'dodg(?:e|es|ed|ing)|evad(?:e|es|ed|ing)'],
    ['heal', 'heal(?:s|ed|ing)?|reviv(?:e|es|ed|al)|resurrect(?:ed|ion)?|surviv(?:e|es|ed|al|ing)'],
    ['shield', 'shields?|shielded']
  ];
  const whole = source => new RegExp('^(?:' + source + ')$', 'i');
  const vocabulary = events.map(([kind, source]) => [kind, whole(source)]);
  const number = String.raw`(?:[+−-]|[x×])?\d+(?:,\d{3})*(?:\.\d+)?(?:%|t(?=\b))?`;
  const numeric = whole(number);
  const escaped = word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const labelFor = token => Object.hasOwn(labels, token) ? labels[token] : '';
  let pattern, isSkill, plainPattern, catalog;
  function prepare() {
    if (pattern && catalog === host.ALL_CARDS) return;
    catalog = host.ALL_CARDS;
    const names = new Set(['Piercing Pulse','Arcane Blast','Crescent Strike','Guardian Pulse','Golden Sword', 'Grass Sword', 'Demon Blood Sword', 'Berserker', 'Serious Mode', 'Mordecai Mode', 'Rigby Mode',
      'Demon Slayer', 'Demon Dweller', 'Fox Theft', 'Soul Unbound', 'Wind Blade', 'Azakana Blade', 'Murciélago', 'Resurrección', 'The One',
      'Candy Form', 'Datebayo', 'HAMONNN', 'Haki', 'Sasuke', 'Naruto', 'Mordecai', 'Rigby', 'EXCALIBUR!!!', 'BLUE', 'GREEN', 'PURPLE']);
    for (const card of catalog || []) if (card.passive?.name?.length > 2) names.add(card.passive.name);
    const skills = [...names].sort((a,b) => b.length - a.length).map(escaped).join('|');
    const reserved = Object.keys(labels).sort((a,b) => b.length - a.length).map(escaped).join('|');
    const outcomes = events.map(([, source]) => source).join('|');
    isSkill = whole(skills);
    pattern = new RegExp(String.raw`\[(?:${reserved}|\b(?:${skills}))\]|(?<![\w])(?:${outcomes}|\b(?:${skills}))(?![\w])|(?<![\w])${number}(?![\w])`, 'gi');
    plainPattern = new RegExp(String.raw`(?<![\w])${number}(?=\s+(?:(?:[a-z]+)\s+)?damage\b)`, 'gi');
  }
  function createLine(doc, message, tone = '') {
    prepare();
    const line = doc.createElement('div');
    const safeTone = tones.has(tone) ? tone : '';
    line.className = 'battle-log__line' + (safeTone ? ' is-' + safeTone : '');
    const turn = /^TURN\s+\d+\s+[•·]/i.test(message);
    const basic = !safeTone && /^.+? dealt [\d,.]+ damage\.$/i.test(message);
    const highlights = [];
    for (const hit of message.matchAll(basic ? plainPattern : pattern)) {
      const text = hit[0], bracket = text.startsWith('['), inner = bracket ? text.slice(1,-1) : text;
      const kind = (bracket && labelFor(inner.toLowerCase())) || vocabulary.find(([,re])=>re.test(inner))?.[0] ||
        (numeric.test(text) ? 'number' : !turn && isSkill.test(inner) ? 'skill' : '');
      if (kind) highlights.push({ text, kind, start: hit.index, bracket });
    }
    const contextual = highlights.find(h => !['number','skill','passive','status','debuff'].includes(h.kind))?.kind;
    const toneAccent = {critical:'crit',passive:'passive',dodge:'dodge',heal:'heal',shield:'shield',debuff:'debuff',victory:'heal',defeat:'bleed',special:'skill',support:'heal',burn:'burn',bleed:'bleed',poison:'poison',revive:'heal',counter:'skill'};
    const accent = turn ? 'turn' : toneAccent[safeTone] === 'crit' ? 'crit' : contextual ||
      toneAccent[safeTone] || highlights.find(h => h.kind !== 'number')?.kind;
    if (accent) line.dataset.accent = accent;
    let cursor = 0;
    for (const { text, kind, start, bracket } of highlights) {
      if (start > cursor) line.append(doc.createTextNode(message.slice(cursor,start)));
      const span = doc.createElement(kind === 'skill' ? 'strong' : 'span');
      span.className = 'battle-log__token';
      span.dataset.accent = kind === 'status' && contextual ? contextual : kind;
      if (bracket || !['number','skill'].includes(kind)) span.classList.add('battle-log__pill');
      span.textContent = text;
      line.append(span);
      cursor = start + text.length;
    }
    if (cursor < message.length) line.append(doc.createTextNode(message.slice(cursor)));
    return line;
  }
  const panes = doc => [doc.getElementById('battleLog'), doc.getElementById('battleEnemyLog')];
  function backup(doc) {
    return panes(doc).map(pane => pane && ({nodes:[...pane.childNodes], scroll:pane.scrollTop}));
  }
  function restore(doc, saved = []) {
    panes(doc).forEach((pane,i) => {
      if(!pane)return;
      pane.replaceChildren(...(saved[i]?.nodes || []));
      pane.scrollTop = saved[i]?.scroll || 0;
    });
  }
  host.BattleLogView = Object.freeze({ createLine, panes, backup, restore });
})(window);
