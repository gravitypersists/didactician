/* w-blocks: seven small working specimens of the building blocks Didactician composes pages from.
   One mount, no scroll steps, no network. Every specimen is independent and works in any order.
   All examples reuse what the reader already has: the § 4 line
       total = sum(x for x in values if x > 0)      with values = [3, -1, 4, 0]
   or the pipeline itself (handoff prompts, reviewers). */
Didactician.widget('w-blocks', function (el, ctx) {
  'use strict';

  var VALUES = [3, -1, 4, 0];
  var uid = 0;
  function nid(p) { uid += 1; return 'wb-' + p + '-' + uid; }

  // ---- tiny DOM helper -------------------------------------------------------------------
  function h(tag, props) {
    var node = document.createElement(tag);
    var kids = Array.prototype.slice.call(arguments, 2);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === false || v == null) return;
        if (k === 'class') node.className = v;
        else if (k === 'text') node.textContent = v;
        else if (k === 'on') Object.keys(v).forEach(function (ev) { node.addEventListener(ev, v[ev]); });
        else node.setAttribute(k, v === true ? '' : v);
      });
    }
    kids.forEach(function add(c) {
      if (c == null || c === false) return;
      if (Array.isArray(c)) { c.forEach(add); return; }
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }
  function cap(t) { return t.charAt(0).toUpperCase() + t.slice(1); }
  function code(t) { return h('code', null, t); }
  function svgEl(tag, attrs) {
    var n = document.createElementNS('http://www.w3.org/2000/svg', tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    return n;
  }

  // ---- shared pieces ---------------------------------------------------------------------
  // A card: small-caps head, the example, and its one-line directive directly under it.
  function card(n, name, body, directive, extra) {
    return h('article', { class: 'wb-card' + (extra ? ' ' + extra : ''), 'data-spec': String(n) },
      h('h3', { class: 'wb-head' }, h('span', { class: 'wb-n' }, 'Specimen ' + n), ' · ' + name),
      h('div', { class: 'wb-body' }, body),
      h('p', { class: 'wb-why' }, h('span', { class: 'wb-why-k' }, 'Directive.'), ' ' + directive));
  }

  // A disclosure that looks like a control: bordered button, a caret that turns, a verb in the label.
  function disclosure(showLabel, hideLabel, content) {
    var panelId = nid('panel');
    var caret = h('span', { class: 'wb-caret', 'aria-hidden': 'true' }, '▸');
    var label = h('span', { class: 'wb-disc-label' }, showLabel);
    var btn = h('button', { type: 'button', class: 'wb-disc', 'aria-expanded': 'false', 'aria-controls': panelId }, caret, label);
    var panel = h('div', { class: 'wb-panel', id: panelId, hidden: true }, content);
    var live = h('div', { 'aria-live': 'polite' }, panel);
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') !== 'true';
      btn.setAttribute('aria-expanded', String(open));
      caret.textContent = open ? '▾' : '▸';
      label.textContent = open ? hideLabel : showLabel;
      panel.hidden = !open;
    });
    return h('div', { class: 'wb-disc-wrap' }, btn, live);
  }

  // One-tap multiple choice. opts: [{ text, correct, why }]. onCommit(i, optionButtons).
  // Feedback goes in an aria-live region under the options, so nothing moves above it.
  function choice(promptId, opts, onCommit, cols, onReset) {
    var letters = 'ABCDEFG';
    var group = h('div', { class: 'wb-opts' + (cols ? ' wb-cols-' + cols : ''), role: 'group', 'aria-labelledby': promptId });
    var fb = h('div', { class: 'wb-fb', 'aria-live': 'polite' });
    var btns = opts.map(function (o, i) {
      var b = h('button', { type: 'button', class: 'wb-opt', 'aria-pressed': 'false' },
        h('span', { class: 'wb-ltr' }, letters[i]), h('span', { class: 'wb-opt-t' }, o.text));
      b.addEventListener('click', function () { commit(i); });
      return b;
    });
    btns.forEach(function (b) { group.appendChild(b); });
    var again = h('button', { type: 'button', class: 'wb-again' }, '↺ Try again');
    var done = false;

    function commit(i) {
      if (done) return;
      done = true;
      btns.forEach(function (b, j) {
        b.setAttribute('aria-pressed', String(j === i));
        b.disabled = true;
        if (opts[j].correct) b.classList.add('is-right');
        if (j === i && !opts[j].correct) b.classList.add('is-wrong');
        if (opts[j].correct || j === i) {
          b.appendChild(h('span', { class: 'wb-tag' }, opts[j].correct ? (j === i ? '✓ your answer, correct' : '✓ correct') : '✗ your answer'));
        }
      });
      fb.textContent = '';
      var right = opts.filter(function (o) { return o.correct; })[0];
      var rightIdx = opts.indexOf(right);
      var extra = onCommit ? onCommit(i, rightIdx, fb) : null;
      var verdict = h('p', { class: 'wb-verdict' },
        h('span', { class: 'wb-solution' }, i === rightIdx ? 'Correct.' : 'Not quite.'), ' ',
        i === rightIdx ? cap(right.why) : opts[i].why + ' The answer is ' + letters[rightIdx] + ': ' + right.why);
      fb.appendChild(verdict);
      if (extra) fb.appendChild(extra);
      fb.appendChild(again);
    }
    function reset() {
      done = false;
      btns.forEach(function (b) {
        b.disabled = false;
        b.setAttribute('aria-pressed', 'false');
        b.classList.remove('is-right', 'is-wrong');
        var t = b.querySelector('.wb-tag');
        if (t) b.removeChild(t);
      });
      fb.textContent = '';
      if (onReset) onReset();
    }
    again.addEventListener('click', function () { reset(); btns[0].focus(); });
    return { group: group, fb: fb, reset: reset };
  }

  // ---- 1. Progressive reveal -------------------------------------------------------------
  function spec1() {
    var dl = h('dl', { class: 'wb-dl' },
      h('dt', null, 'Role'), h('dd', null, 'Which agent definition to read and follow, e.g. ', code('agents/widget-builder.md'), '.'),
      h('dt', null, 'Task'), h('dd', null, 'What to build or check, and which decisions already apply.'),
      h('dt', null, 'Inputs'), h('dd', null, 'Paths of the files to read. The files are named, not pasted into the prompt.'),
      h('dt', null, 'Outputs'), h('dd', null, 'The only folder this agent may write to, and what its report must contain.'));
    var body = [
      h('p', { class: 'wb-lead' }, 'Every agent in the pipeline starts from one handoff prompt, which is saved as a file. A reader who only wants the idea can stop here.'),
      disclosure('Show what’s in a handoff prompt', 'Hide what’s in a handoff prompt', dl)
    ];
    return card(1, 'Progressive reveal', body,
      'Optional depth waits behind a control the reader opens, so it stays out of working memory until asked for. What every reader needs is never hidden.');
  }

  // ---- 2. Multiple choice ----------------------------------------------------------------
  function spec2() {
    var qid = nid('q');
    var c = choice(qid, [
      { text: 'the brief', why: 'Reviewers do get the brief: they check the page against what was asked for.' },
      { text: 'the page', why: 'The page is what they review; without it there would be nothing to check.' },
      { text: 'the builder’s report', correct: true,
        why: 'the report carries the builder’s reasoning and what it meant to say. A reviewer who read it would tend to read that intent back into the page, so the reviewer starts fresh from the brief, the page and the facts or plan.' }
    ]);
    var body = [
      h('p', { class: 'wb-q', id: qid }, 'Which of these does a reviewer never see?'),
      c.group, c.fb
    ];
    return card(2, 'Multiple choice', body,
      'Make the reader produce an answer instead of rereading, hide it until they commit, and explain why each wrong option is wrong. The explanation is where the learning is meant to happen.');
  }

  // ---- 3. Predict, then reveal -----------------------------------------------------------
  function keptRow(t, showWhy) {
    var row = h('ul', { class: 'wb-vals', 'aria-label': 'values and whether x > ' + t + ' keeps them' });
    VALUES.forEach(function (x) {
      var keep = x > t;
      row.appendChild(h('li', { class: 'wb-val ' + (keep ? 'is-kept' : 'is-dropped') },
        h('span', { class: 'wb-val-n' }, String(x)),
        h('span', { class: 'wb-val-s' }, keep ? 'keep' : 'drop'),
        showWhy ? h('span', { class: 'wb-val-w' }, x + ' > ' + t + (keep ? '' : ' is false')) : null));
    });
    return row;
  }
  function spec3() {
    var qid = nid('q');
    var c = choice(qid, [
      { text: '6', why: '6 adds every value, −1 included: 3 + (−1) + 4 + 0. The filter is what leaves −1 out.' },
      { text: '7', correct: true, why: 'the filter keeps 3 and 4, and 3 + 4 = 7.' },
      { text: '8', why: '8 treats −1 as 1. The filter drops a value; it never flips its sign.' }
    ], function () {
      return h('div', { class: 'wb-reveal' },
        h('p', { class: 'wb-cap' }, 'What the filter did to each value'),
        keptRow(0, true),
        h('p', { class: 'wb-sum' }, '3 + 4 = ', h('b', null, '7')));
    }, 3);
    var body = [
      h('div', { class: 'wb-codebox' }, code('values = [3, -1, 4, 0]'), h('br'), code('total = sum(x for x in values if x > 0)')),
      h('p', { class: 'wb-q', id: qid }, 'What is total?'),
      c.group, c.fb
    ];
    return card(3, 'Predict, then reveal', body,
      'Ask for a prediction before showing the outcome, put the tempting wrong answer among the options, then reveal and explain why it was wrong. A wrong guess followed by the truth is meant to draw attention to the gap.');
  }

  // ---- 4. Think, then reveal -------------------------------------------------------------
  function spec4() {
    var qid = nid('q');
    var model = h('p', { class: 'wb-model' },
      h('span', { class: 'wb-solution' }, 'A model answer.'), ' ',
      'It reads its own page knowing what it meant, so it tends to read that intent back into the words instead of seeing what is on the screen. Studies of LLM judges find they score their own output higher than human annotators do (shown on GPT-4 and Llama 2). That is why a fresh reviewer gets the page. Whether this beats self-review has not been measured.');
    var body = [
      h('p', { class: 'wb-q', id: qid }, 'Why might the agent that wrote a page miss its own mistakes?'),
      h('p', { class: 'wb-lead' }, 'Think of your own answer first. There is no box to type in and nothing is graded.'),
      disclosure('Show a model answer', 'Hide the model answer', model)
    ];
    return card(4, 'Think, then reveal', body,
      'For open questions, the reader forms an answer in their head and then opens a model one. The references prefer this to a free-text box, which they say readers find annoying and skip.');
  }

  // ---- 5. Step-through -------------------------------------------------------------------
  function spec5() {
    var STEPS = [
      { key: 'filter', name: 'Filter', text: 'The test x > 0 keeps 3 and 4. −1 and 0 fail it.' },
      { key: 'sum', name: 'Sum', text: 'sum() adds what is left.' },
      { key: 'assign', name: 'Assign', text: 'total = names the result.' }
    ];
    var i = 0;
    var parts = {
      assign: h('span', { class: 'wb-part', 'data-part': 'assign' }, 'total ='),
      sumOpen: h('span', { class: 'wb-part', 'data-part': 'sum' }, ' sum('),
      gen: h('span', { class: 'wb-part', 'data-part': 'gen' }, 'x for x in values '),
      filter: h('span', { class: 'wb-part', 'data-part': 'filter' }, 'if x > 0'),
      sumClose: h('span', { class: 'wb-part', 'data-part': 'sum' }, ')')
    };
    var line = h('p', { class: 'wb-codebox wb-codeline', 'aria-label': 'total = sum(x for x in values if x > 0)' },
      parts.assign, parts.sumOpen, parts.gen, parts.filter, parts.sumClose);
    var work = h('div', { class: 'wb-work' });
    var title = h('p', { class: 'wb-stepname' });
    var counter = h('span', { class: 'wb-count' });
    var prev = h('button', { type: 'button', class: 'wb-btn' }, '‹ Back');
    var next = h('button', { type: 'button', class: 'wb-btn' }, 'Next ›');
    var live = h('p', { class: 'wb-live', 'aria-live': 'polite' });

    function render() {
      var s = STEPS[i];
      Object.keys(parts).forEach(function (k) {
        var on = parts[k].getAttribute('data-part') === s.key;
        parts[k].classList.toggle('is-active', on);
        parts[k].classList.toggle('is-dim', !on);
      });
      work.textContent = '';
      if (i === 0) work.appendChild(keptRow(0, false));
      else if (i === 1) work.appendChild(h('p', { class: 'wb-eq' }, '3 + 4 = ', h('b', null, '7')));
      else work.appendChild(h('p', { class: 'wb-eq' }, 'total = ', h('b', null, '7')));
      title.textContent = '';
      title.appendChild(h('span', { class: 'wb-solution' }, s.name + '.'));
      title.appendChild(document.createTextNode(' ' + s.text));
      counter.textContent = 'Step ' + (i + 1) + ' of 3';
      prev.disabled = i === 0;
      next.disabled = i === STEPS.length - 1;
      live.textContent = 'Step ' + (i + 1) + ' of 3, ' + s.name + '. ' + s.text;
    }
    prev.addEventListener('click', function () { if (i > 0) { i -= 1; render(); } });
    next.addEventListener('click', function () { if (i < STEPS.length - 1) { i += 1; render(); } });
    render();
    var body = [
      h('div', { class: 'wb-stage' }, line, work),
      title,
      h('div', { class: 'wb-ctrl' }, prev, counter, next),
      live
    ];
    return card(5, 'Step-through', body,
      'One change per step, with the rest dimmed, so the reader holds only what just changed. Diagrams I and II are the full-size version.');
  }

  // ---- 6. Contrasting cases --------------------------------------------------------------
  var MONTHS = ['Jan', 'Feb', 'Mar', 'Apr'];
  var SERIES = [
    { id: 'P', data: [5, 6, 7, 6], cls: 'wb-sP' },
    { id: 'Q', data: [3, 5, 6, 8], cls: 'wb-sQ' }
  ];
  function chart(mode, label) {
    var W = 380, H = 128, x0 = 36, x1 = 244, yTop = 12, yBot = 92, vmax = 9;
    var X = function (k) { return x0 + 14 + (x1 - x0 - 28) * k / 3; };
    var Y = function (v) { return yBot - (yBot - yTop) * v / vmax; };
    var svg = svgEl('svg', { class: 'wb-chart', viewBox: '0 0 ' + W + ' ' + H, role: 'img',
      'aria-label': 'Line chart of two series over four months, ' + (mode === 'legend' ? 'with a legend box at the right' : 'with a name at the end of each line') + '.' });
    [0, 3, 6, 9].forEach(function (v) {
      svg.appendChild(svgEl('line', { class: 'wb-grid', x1: x0, x2: x1, y1: Y(v), y2: Y(v) }));
      var t = svgEl('text', { class: 'wb-tick', x: x0 - 6, y: Y(v), 'text-anchor': 'end', 'dominant-baseline': 'middle' });
      t.textContent = v; svg.appendChild(t);
    });
    MONTHS.forEach(function (m, k) {
      var t = svgEl('text', { class: 'wb-tick', x: X(k), y: yBot + 19, 'text-anchor': 'middle' });
      t.textContent = m; svg.appendChild(t);
    });
    svg.appendChild(svgEl('line', { class: 'wb-axis', x1: x0, x2: x1, y1: yBot, y2: yBot }));
    // March marker, drawn only after the reader answers
    var mark = svgEl('g', { class: 'wb-march', visibility: 'hidden' });
    mark.appendChild(svgEl('line', { class: 'wb-marchline', x1: X(2), x2: X(2), y1: yTop - 4, y2: yBot }));
    SERIES.forEach(function (s, si) {
      var t = svgEl('text', { class: 'wb-val-label', x: X(2) + (si === 0 ? -6 : 6), y: Y(s.data[2]) + (si === 0 ? -8 : 16), 'text-anchor': si === 0 ? 'end' : 'start' });
      t.textContent = s.data[2];
      mark.appendChild(t);
    });
    SERIES.forEach(function (s, si) {
      var pts = s.data.map(function (v, k) { return X(k) + ',' + Y(v); }).join(' ');
      svg.appendChild(svgEl('polyline', { class: 'wb-line ' + s.cls, points: pts }));
      s.data.forEach(function (v, k) {
        svg.appendChild(si === 0
          ? svgEl('circle', { class: 'wb-pt ' + s.cls, cx: X(k), cy: Y(v), r: 4 })
          : svgEl('rect', { class: 'wb-pt ' + s.cls, x: X(k) - 4, y: Y(v) - 4, width: 8, height: 8 }));
      });
    });
    svg.appendChild(mark);
    if (mode === 'legend') {
      svg.appendChild(svgEl('rect', { class: 'wb-legend', x: 256, y: 14, width: 118, height: 56 }));
      SERIES.forEach(function (s, si) {
        var y = 32 + si * 26;
        svg.appendChild(svgEl('line', { class: 'wb-line ' + s.cls, x1: 264, x2: 288, y1: y, y2: y }));
        svg.appendChild(si === 0
          ? svgEl('circle', { class: 'wb-pt ' + s.cls, cx: 276, cy: y, r: 4 })
          : svgEl('rect', { class: 'wb-pt ' + s.cls, x: 272, y: y - 4, width: 8, height: 8 }));
        var t = svgEl('text', { class: 'wb-lab', x: 296, y: y, 'dominant-baseline': 'middle' });
        t.textContent = 'Series ' + s.id; svg.appendChild(t);
      });
    } else {
      SERIES.forEach(function (s) {
        var t = svgEl('text', { class: 'wb-lab wb-lab-' + s.id, x: X(3) + 12, y: Y(s.data[3]), 'dominant-baseline': 'middle' });
        t.textContent = 'Series ' + s.id; svg.appendChild(t);
      });
    }
    return { fig: h('figure', { class: 'wb-fig' }, h('figcaption', { class: 'wb-cap' }, label), svg), svg: svg, mark: mark, label: svg.getAttribute('aria-label') };
  }
  function spec6() {
    var qid = nid('q');
    var A = chart('legend', 'Chart A · names in a legend box');
    var B = chart('direct', 'Chart B · names on the lines');
    var c = choice(qid, [
      { text: 'Series P', correct: true, why: 'Series P is at 7 in March and Series Q at 6.' },
      { text: 'Series Q', why: 'In March Series Q is at 6, one below Series P.' }
    ], function () {
      [A, B].forEach(function (ch) {
        ch.mark.setAttribute('visibility', 'visible');
        ch.svg.setAttribute('aria-label', 'Line chart of two series over four months. Series P: 5, 6, 7, 6. Series Q: 3, 5, 6, 8.');
      });
      return h('p', { class: 'wb-after' }, 'Same numbers in both charts. Only one thing differs: in A you look from a line to the box and back, matching by symbol; in B the name sits on the line. Which was quicker for you?');
    }, 2, function () {
      [A, B].forEach(function (ch) {
        ch.mark.setAttribute('visibility', 'hidden');
        ch.svg.setAttribute('aria-label', ch.label);
      });
    });
    var body = [
      h('p', { class: 'wb-q', id: qid }, 'Which series is higher in March?'),
      h('div', { class: 'wb-charts' }, A.fig, B.fig),
      c.group, c.fb,
      h('p', { class: 'wb-note' }, 'Illustrative numbers, not from a run.')
    ];
    return card(6, 'Contrasting cases', body,
      'Put two cases that differ in one feature side by side and ask what differs before saying. Labels on the lines avoid matching at a distance (split attention). Diagram III is the full-size version.');
  }

  // ---- 7. Sandbox, with a prediction first -----------------------------------------------
  function totalFor(t) { return VALUES.reduce(function (s, x) { return x > t ? s + x : s; }, 0); }
  function spec7() {
    var qid = nid('q'), sid = nid('t');
    var predicted = null, moved = false;
    var predBtns = [1, 2, 3, 4, 5].map(function (v) {
      var b = h('button', { type: 'button', class: 'wb-chip', 'aria-pressed': 'false' }, 't = ' + v);
      b.addEventListener('click', function () { commitPrediction(v); });
      return b;
    });
    var pred = h('div', { class: 'wb-chips', role: 'group', 'aria-labelledby': qid }, predBtns);
    var lockNote = h('p', { class: 'wb-note wb-lock' }, 'Choose a prediction to unlock the slider.');

    var tOut = h('b', { class: 'wb-t' }, '0');
    var line = h('p', { class: 'wb-codebox wb-codeline', 'aria-hidden': 'true' },
      'total = sum(x for x in values if x > ', tOut, ')');
    var valsHost = h('div', { class: 'wb-valshost' });
    var totalOut = h('p', { class: 'wb-total' }, 'total = ', h('b', null, '7'));
    var slider = h('input', { type: 'range', class: 'wb-range', id: sid, min: '0', max: '5', step: '1', value: '0', disabled: true });
    var ticks = h('div', { class: 'wb-ticks', 'aria-hidden': 'true' });
    for (var k = 0; k <= 5; k++) ticks.appendChild(h('span', { style: '--i:' + k }, String(k)));
    var live = h('p', { class: 'wb-live', 'aria-live': 'polite' });
    var check = h('button', { type: 'button', class: 'wb-btn', disabled: true }, 'Check my prediction');
    var result = h('div', { class: 'wb-fb', 'aria-live': 'polite' });
    var again = h('button', { type: 'button', class: 'wb-again' }, '↺ Try again');

    function update() {
      var t = +slider.value;
      tOut.textContent = String(t);
      valsHost.textContent = '';
      valsHost.appendChild(keptRow(t, false));
      var tot = totalFor(t);
      totalOut.textContent = '';
      totalOut.appendChild(document.createTextNode('total = '));
      totalOut.appendChild(h('b', null, String(tot)));
      var kept = VALUES.filter(function (x) { return x > t; });
      live.textContent = 't = ' + t + '. Kept ' + (kept.length ? kept.join(' and ') : 'nothing') + '. total = ' + tot + '.';
      slider.setAttribute('aria-valuetext', 't = ' + t + ', total = ' + tot);
    }
    function refreshCheck() { check.disabled = !(predicted !== null && moved); }
    function commitPrediction(v) {
      if (predicted !== null) return;
      predicted = v;
      predBtns.forEach(function (b, j) { b.setAttribute('aria-pressed', String(j + 1 === v)); b.disabled = true; });
      slider.disabled = false;
      lockNote.textContent = 'Prediction locked: t = ' + v + '. Now drag the slider and watch total.';
      refreshCheck();
    }
    slider.addEventListener('input', function () { moved = true; update(); refreshCheck(); });
    check.addEventListener('click', function () {
      var ok = predicted === 3;
      result.textContent = '';
      result.appendChild(h('p', { class: 'wb-verdict' },
        h('span', { class: 'wb-solution' }, ok ? 'Correct.' : 'Not quite.'),
        ' You predicted t = ' + predicted + '. Total first drops below 7 at t = 3, where total = 4. ' +
        'At t = 0, 1 and 2 the 3 and the 4 both pass the test, so total stays 7 (−1 and 0 never counted). ' +
        'At t = 3 the 3 is no longer greater than 3, so only the 4 is left.'));
      result.appendChild(again);
      check.disabled = true;
    });
    again.addEventListener('click', function () {
      predicted = null; moved = false;
      predBtns.forEach(function (b) { b.disabled = false; b.setAttribute('aria-pressed', 'false'); });
      slider.value = '0'; slider.disabled = true;
      lockNote.textContent = 'Choose a prediction to unlock the slider.';
      result.textContent = '';
      update(); refreshCheck();
      predBtns[0].focus();
    });
    update();

    var body = [
      h('p', { class: 'wb-q', id: qid }, 'Before you drag: as t rises from 0, at what value does total first drop below 7?'),
      pred, lockNote,
      h('div', { class: 'wb-stage' }, line, valsHost, totalOut),
      h('div', { class: 'wb-slider' },
        h('label', { class: 'wb-sl-label', for: sid }, 'Threshold ', h('i', null, 't'), ' (0 to 5, whole numbers)'),
        slider, ticks),
      live,
      h('div', { class: 'wb-ctrl wb-ctrl-left' }, check),
      result
    ];
    return card(7, 'Sandbox, with a prediction first', body,
      'Moving a slider alone counts only as Active. Asking the reader to predict first is meant to make it Constructive (ICAP; its authors frame it as a hypothesis, not a settled result).',
      'wb-wide');
  }

  // ---- assemble ---------------------------------------------------------------------------
  var grid = h('div', { class: 'wb-grid-cards' }, spec1(), spec2(), spec3(), spec4(), spec5(), spec6(), spec7());
  el.appendChild(grid);

  ctx.onResize(function (w) { grid.classList.toggle('wb-two', w >= 800); });
});
