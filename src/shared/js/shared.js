const counters = document.querySelectorAll(".stat-number");
const scenarios = document.querySelectorAll(".scenario");
const scenarioButtons = document.querySelectorAll("[data-scenario]");

const animateCounters = () => {
  counters.forEach((counter) => {
    const target = Number(counter.dataset.count || 0);
    let current = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const tick = () => {
      current += step;
      if (current >= target) {
        counter.textContent = target;
      } else {
        counter.textContent = current;
        requestAnimationFrame(tick);
      }
    };
    tick();
  });
};

const revealOnScroll = () => {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
        }
      });
    },
    { threshold: 0.2 }
  );

  document.querySelectorAll(".card, .glass, .callout").forEach((el) => {
    el.classList.add("reveal");
    observer.observe(el);
  });
};

const setupScenarios = () => {
  if (!scenarios.length) return;
  const activate = (key) => {
    scenarios.forEach((card) => {
      card.classList.toggle("active", card.dataset.scenario === key);
    });
  };
  scenarioButtons.forEach((btn) => {
    btn.addEventListener("click", () => activate(btn.dataset.scenario));
  });
  activate("a");
};

animateCounters();
revealOnScroll();
setupScenarios();
