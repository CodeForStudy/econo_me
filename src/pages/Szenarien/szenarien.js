(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('.toc-links a[href^="#"]');
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const href = link.getAttribute("href");
        if (!href) return;
        const target = document.querySelector(href);
        if (!target) return;

        const safeTopVal = getComputedStyle(document.documentElement).getPropertyValue("--safe-top") || "0px";
        const safeTop = parseFloat(safeTopVal) || 0;
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const extraGap = 12;

        const rect = target.getBoundingClientRect();
        const targetY = window.scrollY + rect.top - (headerHeight + safeTop + extraGap);

        window.scrollTo({ top: Math.max(0, Math.floor(targetY)), behavior: 'smooth' });

        try { history.replaceState(null, '', href); } catch (err) {}
      });
    });

    const sections = Array.from(document.querySelectorAll('.content-section[id]'));
    if (sections.length) {
      const linkById = {};
      links.forEach((l) => {
        const h = l.getAttribute('href');
        if (h && h.startsWith('#')) linkById[h.slice(1)] = l;
      });

      let ticking = false;
      let lastId = null;

      function updateActive() {
        ticking = false;
        const safeTopVal = getComputedStyle(document.documentElement).getPropertyValue("--safe-top") || "0px";
        const safeTop = parseFloat(safeTopVal) || 0;
        const header = document.querySelector('.site-header');
        const headerHeight = header ? header.getBoundingClientRect().height : 0;
        const offset = headerHeight + safeTop + 12;

        let best = sections[0];
        let bestDist = Infinity;
        for (const s of sections) {
          const t = s.getBoundingClientRect().top;
          const dist = Math.abs(t - offset);
          if (dist < bestDist) { bestDist = dist; best = s; }
        }

        const id = best.id;
        if (id !== lastId) {
          if (lastId && linkById[lastId]) linkById[lastId].classList.remove('active');
          if (linkById[id]) linkById[id].classList.add('active');
          lastId = id;
        }
      }

      window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(updateActive); ticking = true; }
      }, { passive: true });

      window.addEventListener('resize', () => requestAnimationFrame(updateActive), { passive: true });

      requestAnimationFrame(updateActive);
    }
  });
})();

(() => {
  document.addEventListener("DOMContentLoaded", () => {
    const groupLabels = document.querySelectorAll(".scenario-group-label[data-group]");
    if (!groupLabels.length) return;

    const setGroupHover = (group, isOn) => {
      const rows = document.querySelectorAll(`.scenario-table tbody tr[data-group="${group}"]`);
      rows.forEach((row) => row.classList.toggle("group-hover", isOn));
    };

    groupLabels.forEach((label) => {
      const group = label.getAttribute("data-group");
      if (!group) return;

      label.addEventListener("mouseenter", () => setGroupHover(group, true));
      label.addEventListener("mouseleave", () => setGroupHover(group, false));
      label.addEventListener("focus", () => setGroupHover(group, true));
      label.addEventListener("blur", () => setGroupHover(group, false));
    });
  });
})();
