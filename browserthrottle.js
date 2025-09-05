<script>
(() => {
  // 1) Throttle render frequency
  const MAX_FPS = 2;                  // tweak: 1–5 is plenty for chat
  const INTERVAL = 1000 / MAX_FPS;
  const container = document.querySelector('.chat, .messages, ul');
  if (!container) return;

  const pending = [];
  const renderNow = () => {
    if (!pending.length) return;
    // Replace list with the last few items only
    const frag = document.createDocumentFragment();
    const take = Math.min(pending.length, 3);
    for (let i = pending.length - take; i < pending.length; i++) {
      frag.appendChild(pending[i]);
    }
    pending.length = 0;
    container.textContent = '';
    container.appendChild(frag);
  };
  setInterval(renderNow, INTERVAL);

  // 2) Intercept DOM inserts, strip images/emoji, push into queue
  const stripEmoji = (s) => s.replace(/\p{Extended_Pictographic}/gu, ''); // remove emoji glyphs
  const cleanNode = (node) => {
    // remove media nodes
    node.querySelectorAll('img, video, canvas, svg, picture, source, [style*="background-image"]').forEach(n => n.remove());
    // strip emoji from text nodes
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    let t;
    while ((t = walker.nextNode())) t.nodeValue = stripEmoji(t.nodeValue);
    return node;
  };

  const observer = new MutationObserver((mutations) => {
    for (const m of mutations) {
      m.addedNodes.forEach((n) => {
        if (!(n instanceof HTMLElement)) return;
        // only queue message-like rows
        if (n.matches('.message, .chat-item, .msg, li')) {
          pending.push(cleanNode(n));
        } else {
          // if a container batch is added, extract its rows
          n.querySelectorAll('.message, .chat-item, .msg, li').forEach((row) => pending.push(cleanNode(row)));
        }
      });
    }
  });
  observer.observe(container, { childList: true, subtree: true });

  // Optional: start with only the last 3 existing rows
  const rows = [...container.querySelectorAll('.message, .chat-item, .msg, li')];
  pending.push(...rows.slice(-3).map(cleanNode));
})();
</script>
