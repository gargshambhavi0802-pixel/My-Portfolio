/* =====================================================================
   PAGE TURN TRANSITION  —  The Algorithm Times
   ---------------------------------------------------------------------
   When a navbar link is clicked, the current page is "printed" onto a
   stack of thin paper strips, turned like a newspaper page, and the
   destination page is revealed underneath. Then the real navigation
   happens (it looks identical, so the switch is seamless).

   • Going to a LATER navbar item  -> page turns forward  (hinge on left)
   • Going to an EARLIER navbar item -> page turns backward (hinge on right)

   Works on plain HTML pages. No libraries. Include on every page with:
       <script src="javascript/page-turn.js" defer></script>       (index.html)
       <script src="../javascript/page-turn.js" defer></script>    (pages/*.html)

   Want to tweak it? Either edit CONFIG below, or set before this script:
       window.PAGE_TURN = { duration: 1400, strips: 20 };
   ===================================================================== */
(() => {
    'use strict';

    const CONFIG = Object.assign({
        duration: 1150,        // ms, length of the turn
        strips: 16,            // more strips = smoother curl (12–24 is good)
        maxAngle: 122,         // how far the page swings (deg)
        bend: 58,              // how much the page curls while turning (deg)
        perspective: 2600,     // px, lower = more dramatic 3D
        depth: 0.42,           // 0..1, squashes depth so the page stays on screen
        paper: '#F8F3E8',      // page colour (matches your body background)
        backPaper: '#E7DDC6',  // colour of the back of the sheet
        loadTimeout: 1400      // ms to wait for the next page before turning anyway
    }, window.PAGE_TURN || {});

    // Respect "reduce motion" accessibility setting: plain navigation.
    if (window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const NAV_SELECTOR = '.navbar a';
    let busy = false;
    let stageEl = null;

    /* ------------------------------ styles ------------------------------ */
    const style = document.createElement('style');
    style.textContent = `
.pt-stage{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:${CONFIG.paper};
  perspective:${CONFIG.perspective}px;perspective-origin:50% 45%;contain:strict}
.pt-under{position:absolute;top:0;left:0;height:100%;border:0;background:${CONFIG.paper};
  transform-origin:50% 50%;will-change:transform}
.pt-dim{position:absolute;inset:0;background:#000;opacity:0;pointer-events:none}
.pt-shadow{position:absolute;top:0;bottom:0;pointer-events:none;opacity:0}
.pt-depth{position:absolute;inset:0;transform-style:preserve-3d;
  transform:scale3d(1,1,${CONFIG.depth});pointer-events:none}
.pt-hinge{position:absolute;top:0;height:100%;transform-style:preserve-3d;will-change:transform}
.pt-face,.pt-back{position:absolute;inset:0;backface-visibility:hidden;-webkit-backface-visibility:hidden}
.pt-face{overflow:hidden}
.pt-back{transform:rotateY(180deg);background:${CONFIG.backPaper}}
.pt-inner{position:absolute;top:0;height:100%;overflow:hidden}
.pt-shade{position:absolute;inset:0;pointer-events:none}
`;
    document.head.appendChild(style);

    /* ------------------------------ helpers ------------------------------ */
    const el = (cls, tag = 'div') => {
        const n = document.createElement(tag);
        n.className = cls;
        return n;
    };
    const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2); // easeInOutCubic
    const norm = path => path.replace(/index\.html$/i, '').replace(/\/+$/, '/');

    function navIndexOf(links, url) {
        const target = norm(new URL(url, location.href).pathname);
        return links.findIndex(a => norm(new URL(a.href, location.href).pathname) === target);
    }

    // Light-weight preloading so the next page is ready when you click.
    const prefetched = new Set();
    function prefetch(url) {
        if (prefetched.has(url)) return;
        prefetched.add(url);
        const l = document.createElement('link');
        l.rel = 'prefetch';
        l.href = url;
        document.head.appendChild(l);
    }

    // Copy of the current page (what the user is looking at right now).
    function snapshotPage() {
        const body = document.body;
        const rect = body.getBoundingClientRect();   // top is negative when scrolled
        const cs = getComputedStyle(body);
        const wrap = el('pt-clone');
        wrap.style.cssText =
            `position:absolute;left:${rect.left}px;top:${rect.top}px;width:${rect.width}px;` +
            `color:${cs.color};font-family:${cs.fontFamily};font-size:${cs.fontSize};` +
            `font-weight:${cs.fontWeight};font-style:${cs.fontStyle};line-height:${cs.lineHeight};` +
            `letter-spacing:${cs.letterSpacing};text-align:${cs.textAlign};`;
        [...body.children].forEach(child => {
            if (child === stageEl || child.tagName === 'SCRIPT' || child.tagName === 'NOSCRIPT') return;
            const c = child.cloneNode(true);
            if (c.removeAttribute) c.removeAttribute('id');
            if (c.querySelectorAll) {
                c.querySelectorAll('[id]').forEach(n => n.removeAttribute('id'));
                c.querySelectorAll('script,iframe,[autofocus]').forEach(n => n.remove());
            }
            wrap.appendChild(c);
        });
        return wrap;
    }

    function pageBackground() {
        const bg = c => (c && c !== 'transparent' && c !== 'rgba(0, 0, 0, 0)') ? c : null;
        return bg(getComputedStyle(document.body).backgroundColor) ||
               bg(getComputedStyle(document.documentElement).backgroundColor) ||
               CONFIG.paper;
    }

    /* ------------------------------ the turn ------------------------------ */
    function turn(url, dir) {
        busy = true;

        const stage = stageEl = el('pt-stage');
        stage.setAttribute('aria-hidden', 'true');
        stage.inert = true;
        document.body.appendChild(stage);

        const W = stage.clientWidth;
        const H = stage.clientHeight;
        const sbw = Math.max(0, window.innerWidth - document.documentElement.clientWidth); // scrollbar width

        // 1) Destination page, waiting underneath.
        const under = el('pt-under', 'iframe');
        under.src = url;
        under.tabIndex = -1;
        // Same layout width as the real next page (its scrollbar is pushed out of view).
        under.style.width = (W + sbw) + 'px';
        stage.appendChild(under);

        const dim = el('pt-dim');
        stage.appendChild(dim);

        const shadow = el('pt-shadow');
        stage.appendChild(shadow);

        // 2) The current page, cut into hinged strips.
        const depth = el('pt-depth');
        stage.appendChild(depth);

        const N = Math.max(4, CONFIG.strips | 0);
        const w = W / N;
        const bg = pageBackground();
        const clone = snapshotPage();
        const hinges = [];
        const shades = [];
        let parent = depth;

        for (let i = 0; i < N; i++) {
            const hinge = el('pt-hinge');
            hinge.style.width = (w + 1) + 'px';              // +1px overlap hides hairline seams

            let srcX;                                        // where this strip's slice starts on the page
            if (dir === 1) {                                 // hinge on the left
                srcX = i * w;
                hinge.style.left = (i === 0 ? 0 : w) + 'px';
                hinge.style.transformOrigin = '0 50%';
            } else {                                         // hinge on the right
                srcX = W - (i + 1) * w - 1;
                if (i === 0) hinge.style.right = '0px';
                else hinge.style.left = (-w) + 'px';
                hinge.style.transformOrigin = '100% 50%';
            }

            const face = el('pt-face');
            face.style.background = bg;
            const inner = el('pt-inner');
            inner.style.left = (-srcX) + 'px';
            inner.style.width = W + 'px';
            inner.appendChild(i === 0 ? clone : clone.cloneNode(true));
            const shade = el('pt-shade');
            face.appendChild(inner);
            face.appendChild(shade);

            hinge.appendChild(face);
            hinge.appendChild(el('pt-back'));
            parent.appendChild(hinge);

            hinges.push(hinge);
            shades.push(shade);
            parent = hinge;
        }

        // 3) Animation driver.
        const rad = d => d * Math.PI / 180;
        const dark = a => (0.55 * (1 - Math.cos(rad(Math.min(a, 100))))).toFixed(3);
        function setProgress(p) {
            const e = ease(p);
            const theta = e * CONFIG.maxAngle;
            const bend = CONFIG.bend * Math.sin(Math.PI * e);   // curl peaks mid-turn
            let prev = 0, edge = 0;

            for (let i = 0; i < N; i++) {
                const s = i / (N - 1);
                const phi = Math.max(0, theta + bend * (s - 0.5));     // absolute angle of this strip
                hinges[i].style.transform = `rotateY(${-dir * (phi - prev)}deg)`;
                // Darkness follows the angle at each strip edge => smooth gradient, no banding.
                const a0 = dark(prev), a1 = dark(phi);
                const [l, r] = dir === 1 ? [a0, a1] : [a1, a0];
                shades[i].style.background =
                    `linear-gradient(90deg,rgba(32,22,10,${l}),rgba(32,22,10,${r}))`;
                prev = phi;
                edge += w * Math.cos(rad(phi));
            }

            // Shadow the lifting page throws on the page beneath.
            edge = Math.min(W, Math.max(0, edge));
            const sw = Math.min(W, 60 + 260 * Math.sin(Math.PI * e));
            const sh = shadow.style;
            sh.width = sw + 'px';
            sh.opacity = Math.min(1, Math.sin(Math.PI * Math.min(1, e * 1.05)) * 1.15).toFixed(3);
            if (dir === 1) {
                sh.left = edge + 'px'; sh.right = 'auto';
                sh.background = 'linear-gradient(90deg,rgba(25,15,0,.42),rgba(25,15,0,.12) 45%,rgba(25,15,0,0))';
            } else {
                sh.right = edge + 'px'; sh.left = 'auto';
                sh.background = 'linear-gradient(270deg,rgba(25,15,0,.42),rgba(25,15,0,.12) 45%,rgba(25,15,0,0))';
            }

            // Page underneath gently "comes forward" as the sheet leaves.
            dim.style.opacity = (0.26 * (1 - e)).toFixed(3);
            under.style.transform = `scale(${(0.975 + 0.025 * e).toFixed(4)})`;
        }

        setProgress(0);

        let started = false;
        function start() {
            if (started) return;
            started = true;
            const t0 = performance.now();
            (function frame(now) {
                const p = Math.min(1, (now - t0) / CONFIG.duration);
                setProgress(p);
                if (p < 1) requestAnimationFrame(frame);
                else finish();
            })(t0);
        }

        function finish() {
            // The iframe now fills the screen and matches the real next page.
            window.location.href = url;
            // Safety net: if navigation is cancelled, give the page back.
            setTimeout(cleanup, 6000);
        }

        // Wait for the next page to be ready (but never hang the click).
        under.addEventListener('load', () => requestAnimationFrame(() => requestAnimationFrame(start)));
        setTimeout(start, CONFIG.loadTimeout);
    }

    function cleanup() {
        if (stageEl && stageEl.parentNode) stageEl.parentNode.removeChild(stageEl);
        stageEl = null;
        busy = false;
    }

    /* ------------------------------ wiring ------------------------------ */
    document.addEventListener('click', e => {
        const a = e.target.closest && e.target.closest(NAV_SELECTOR);
        if (!a) return;
        if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (a.target && a.target !== '_self') return;
        if (a.hasAttribute('download')) return;

        const url = new URL(a.href, location.href);
        if (url.origin !== location.origin && location.protocol !== 'file:') return;

        e.preventDefault();
        if (busy) return;

        const links = [...document.querySelectorAll(NAV_SELECTOR)];
        const from = navIndexOf(links, location.href);
        const to = navIndexOf(links, a.href);
        if (from !== -1 && from === to) return;          // already on this page

        try {
            turn(a.href, to !== -1 && from !== -1 && to < from ? -1 : 1);
        } catch (err) {                                    // never trap the visitor
            console.warn('[page-turn] falling back to normal navigation', err);
            cleanup();
            window.location.href = a.href;
        }
    });

    // Warm up the next page as soon as someone shows interest in a link.
    ['pointerenter', 'focusin', 'touchstart'].forEach(evt =>
        document.addEventListener(evt, e => {
            const a = e.target.closest && e.target.closest(NAV_SELECTOR);
            if (a) prefetch(a.href);
        }, { passive: true, capture: true })
    );

    // Back/forward cache: never come back to a half-finished animation.
    window.addEventListener('pageshow', e => { if (e.persisted) cleanup(); });
})();