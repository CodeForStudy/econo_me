(() => {
  const quizRoot = document.querySelector("[data-quiz]");
  if (!quizRoot) return;

  const progressEl = quizRoot.querySelector("[data-quiz-progress]");
  const questionEl = quizRoot.querySelector("[data-quiz-question]");
  const optionsEl = quizRoot.querySelector("[data-quiz-options]");
  const explainEl = quizRoot.querySelector("[data-quiz-explain]");
  const nextBtn = quizRoot.querySelector("[data-quiz-next]");
  const resultEl = quizRoot.querySelector("[data-quiz-result]");

  const letters = ["A", "B", "C", "D", "E", "F"];
  let questions = [];
  let current = 0;
  let answered = false;
  const wrongAnswers = [];

  const shuffle = (arr) =>
    arr
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

  const renderProgress = () => {
    progressEl.innerHTML = "";
    questions.forEach((_, index) => {
      const dot = document.createElement("span");
      const isAnswered = index < current || (index === current && answered);
      dot.className = `quiz-dot${index < current ? " active" : ""}${isAnswered ? " answered" : ""}`;
      progressEl.appendChild(dot);
    });
  };

  const renderQuestion = () => {
    answered = false;
    explainEl.classList.remove("visible");
    explainEl.textContent = "";
    nextBtn.disabled = true;

    if (current >= questions.length) {
      showResult();
      return;
    }

    const item = questions[current];
    questionEl.textContent = item.frage;

    optionsEl.innerHTML = "";
    item.optionen.forEach((opt, index) => {
      const btn = document.createElement("button");
      btn.className = "quiz-option";
      btn.type = "button";
      btn.innerHTML = `<span class="quiz-letter">${letters[index]}</span><span>${opt.text}</span>`;
      btn.addEventListener("click", () => handleAnswer(btn, index));
      optionsEl.appendChild(btn);
    });

    renderProgress();
  };

  const handleAnswer = (btn, index) => {
    if (answered) return;
    answered = true;
    const item = questions[current];
    const options = Array.from(optionsEl.children);

    options.forEach((option, idx) => {
      option.classList.add("disabled");
      if (item.optionen[idx].isCorrect) option.classList.add("correct");
    });

    if (!item.optionen[index].isCorrect) {
      btn.classList.add("wrong");
      wrongAnswers.push({
        frage: item.frage,
        richtig: item.optionen.find((o) => o.isCorrect)?.text,
        deine: item.optionen[index].text,
      });
    } else {
      item.richtigBeantwortet = true;
    }

    item.deineAntwort = item.optionen[index].text;

    explainEl.textContent = `Erklärung: ${item.erklaerung}`;
    explainEl.classList.add("visible");
    nextBtn.disabled = false;
    renderProgress();
  };

  const showResult = () => {
    questionEl.style.display = "none";
    optionsEl.style.display = "none";
    explainEl.style.display = "none";
    progressEl.style.display = "none";
    nextBtn.style.display = "none";

    const correctCount = questions.length - wrongAnswers.length;
    const percent = Math.round((correctCount / questions.length) * 100);
    const rating =
      percent >= 90
        ? { label: "Sehr gut", className: "good" }
        : percent >= 70
        ? { label: "Gut", className: "ok" }
        : percent >= 50
        ? { label: "Solide", className: "mid" }
        : { label: "Ausbaufähig", className: "low" };

    resultEl.classList.add("visible");
    resultEl.innerHTML = `
      <div class="quiz-result-title ${rating.className}">${rating.label}</div>
      <div class="quiz-result-sub">Du hast <strong>${correctCount}</strong> von <strong>${questions.length}</strong> Fragen richtig beantwortet.</div>
      <div class="quiz-review"></div>
      <div class="quiz-result-actions">
        <button class="btn" type="button" data-quiz-restart>Quiz wiederholen</button>
      </div>
    `;

    const review = resultEl.querySelector(".quiz-review");
    const restartBtn = resultEl.querySelector("[data-quiz-restart]");
    questions.forEach((q, index) => {
      const isCorrect = q.richtigBeantwortet === true;
      const item = document.createElement("div");
      item.className = `quiz-item ${isCorrect ? "correct" : "wrong"}`;
      item.innerHTML = `
        <div class="quiz-item-title">
          <span>Frage ${index + 1}: ${q.frage}</span>
          <span>${isCorrect ? "✔" : "✖"}</span>
        </div>
        <div class="quiz-item-details">
          <div><strong>Deine Antwort:</strong> ${q.deineAntwort || "–"}</div>
          <div><strong>Richtige Antwort:</strong> ${q.optionen.find((o) => o.isCorrect)?.text}</div>
        </div>
      `;

      item.addEventListener("click", () => {
        const openItem = review.querySelector(".quiz-item.open");
        if (openItem && openItem !== item) openItem.classList.remove("open");
        item.classList.toggle("open");
      });

      review.appendChild(item);
    });

    restartBtn?.addEventListener("click", () => {
      current = 0;
      answered = false;
      wrongAnswers.length = 0;
      questions.forEach((q) => {
        delete q.richtigBeantwortet;
        delete q.deineAntwort;
      });

      questionEl.style.display = "";
      optionsEl.style.display = "";
      explainEl.style.display = "";
      progressEl.style.display = "";
      nextBtn.style.display = "";
      resultEl.classList.remove("visible");
      resultEl.innerHTML = "";

      renderQuestion();
    });
  };

  nextBtn.addEventListener("click", () => {
    if (!answered) return;
    current += 1;
    renderQuestion();
  });

  fetch("../../data/quiz.json")
    .then((res) => res.json())
    .then((data) => {
      questions = shuffle(
        data.map((q) => ({
          ...q,
          optionen: shuffle(
            q.optionen.map((text, index) => ({
              text,
              isCorrect: index === q.richtig,
            }))
          ),
        }))
      );
      renderQuestion();
    })
    .catch(() => {
      questionEl.textContent = "Quiz konnte nicht geladen werden.";
    });
})();

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

        try {
          history.replaceState(null, '', href);
        } catch (err) {
        }
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
          if (dist < bestDist) {
            bestDist = dist;
            best = s;
          }
        }

        const id = best.id;
        if (id !== lastId) {
          if (lastId && linkById[lastId]) linkById[lastId].classList.remove('active');
          if (linkById[id]) linkById[id].classList.add('active');
          lastId = id;
        }
      }

      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateActive);
          ticking = true;
        }
      }, { passive: true });

      window.addEventListener('resize', () => requestAnimationFrame(updateActive), { passive: true });

      requestAnimationFrame(updateActive);
    }
  });
})();
