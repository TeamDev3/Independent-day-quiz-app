/* Independence Day Quiz — script.js
   Customize questions below in `questions` array.
*/

(() => {
  // ----- Configure quiz here -----
  const questions = [
    {
      q: "When is Pakistan's Independence Day celebrated?",
      options: ["August 14", "August 15", "July 14", "October 14"],
      a: 0
    },
    {
      q: "Who is known as the founder of Pakistan?",
      options: ["Muhammad Ali Jinnah", "Allama Iqbal", "Liaquat Ali Khan", "Sir Syed Ahmed Khan"],
      a: 0
    },
    {
      q: "What national color is most associated with Pakistan's flag?",
      options: ["Green", "Red", "Blue", "Orange"],
      a: 0
    },
    {
      q: "Which year did Pakistan gain independence?",
      options: ["1947", "1937", "1957", "1940"],
      a: 0
    },
    {
      q: "The star and crescent on Pakistan's flag symbolize:",
      options: ["Progress & light", "Strength & courage", "Fertility & water", "Wealth & fortune"],
      a: 0
    }
  ];

  const perQuestionTime = 15; // seconds; set to null to disable timer

  // ----- DOM refs -----
  const qTotal = questions.length;
  const el = {
    qIndex: document.getElementById('qIndex'),
    qTotal: document.getElementById('qTotal'),
    question: document.getElementById('question'),
    options: document.getElementById('options'),
    nextBtn: document.getElementById('nextBtn'),
    skipBtn: document.getElementById('skipBtn'),
    score: document.getElementById('score'),
    progressBar: document.getElementById('progressBar'),
    timerWrap: document.getElementById('timer'),
    timeLeft: document.getElementById('timeLeft'),
    resultCard: document.getElementById('result-card') || document.getElementById('result-card'),
    resultTitle: document.getElementById('resultTitle'),
    resultText: document.getElementById('resultText'),
    finalScore: document.getElementById('finalScore'),
    finalTotal: document.getElementById('finalTotal'),
    restartBtn: document.getElementById('restartBtn'),
    shareBtn: document.getElementById('shareBtn'),
    quizCard: document.getElementById('quiz-card'),
    resultSection: document.getElementById('result-card')
  };

  // show totals
  document.getElementById('qTotal').textContent = qTotal;
  document.getElementById('finalTotal').textContent = qTotal;

  let current = 0;
  let score = 0;
  let answered = false;
  let timer = null;
  let timeRemaining = perQuestionTime;

  function startTimer() {
    if (!perQuestionTime) {
      el.timerWrap.hidden = true;
      return;
    }
    el.timerWrap.hidden = false;
    timeRemaining = perQuestionTime;
    el.timeLeft.textContent = timeRemaining;
    timer = setInterval(() => {
      timeRemaining--;
      el.timeLeft.textContent = timeRemaining;
      if (timeRemaining <= 0) {
        clearInterval(timer);
        // auto-skip if not answered
        disableOptions();
        revealCorrect(null); // treat as wrong
        setTimeout(nextQuestion, 800);
      }
    }, 1000);
  }
  function stopTimer(){
    if(timer){ clearInterval(timer); timer = null; }
  }

  function renderQuestion() {
    answered = false;
    el.nextBtn.disabled = true;
    el.qIndex.textContent = current + 1;
    const q = questions[current];
    el.question.textContent = q.q;
    el.options.innerHTML = '';

    q.options.forEach((opt, idx) => {
      const li = document.createElement('li');
      li.setAttribute('role','option');
      li.setAttribute('tabindex','0');
      li.dataset.index = idx;
      li.innerHTML = `<span class="badge">${String.fromCharCode(65+idx)}</span> <span class="opt-text">${opt}</span>`;
      li.addEventListener('click', onChoose);
      li.addEventListener('keydown', (e) => {
        if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); onChoose.call(li, e); }
      });
      el.options.appendChild(li);
    });

    updateProgress();
    startTimer();
  }

  function onChoose(e) {
    if(answered) return;
    stopTimer();
    const chosen = Number(this.dataset.index);
    answered = true;
    disableOptions();
    revealCorrect(chosen);
    el.nextBtn.disabled = false;
  }

  function disableOptions(){
    const items = el.options.querySelectorAll('li');
    items.forEach(li => {
      li.style.pointerEvents = 'none';
      li.setAttribute('aria-disabled','true');
    });
  }

  function revealCorrect(chosenIdx){
    const correct = questions[current].a;
    const items = el.options.querySelectorAll('li');
    items.forEach(li => {
      const i = Number(li.dataset.index);
      if(i === correct){
        li.classList.add('correct');
      }
      if(chosenIdx !== null && i === chosenIdx && i !== correct){
        li.classList.add('wrong');
      }
    });
    if(chosenIdx === correct){
      score += 1;
      el.score.textContent = score;
    }
  }

  function updateProgress() {
    const pct = ((current) / qTotal) * 100;
    el.progressBar.style.width = `${pct}%`;
  }

  function nextQuestion(){
    stopTimer();
    current++;
    if(current >= qTotal){
      finishQuiz();
      return;
    }
    renderQuestion();
  }

  function finishQuiz(){
    // final render
    el.progressBar.style.width = `100%`;
    document.getElementById('finalScore').textContent = score;
    document.getElementById('quiz-card').classList.add('hidden');
    const r = document.getElementById('result-card');
    r.classList.remove('hidden');
    r.setAttribute('aria-hidden','false');
    // celebrate if great score
    if(score >= Math.ceil(qTotal * 0.6)) {
      startConfetti();
      setTimeout(() => stopConfetti(), 5000);
    }
  }

  function resetQuiz(){
    stopTimer();
    current = 0;
    score = 0;
    el.score.textContent = '0';
    el.progressBar.style.width = '0%';
    document.getElementById('quiz-card').classList.remove('hidden');
    document.getElementById('result-card').classList.add('hidden');
    renderQuestion();
  }

  // share functionality
  function shareScore() {
    const text = `I scored ${score}/${qTotal} on the Independence Day Quiz! 🇵🇰 Try it yourself!`;
    if (navigator.share) {
      navigator.share({title:'Independence Day Quiz', text});
    } else {
      // fallback copy to clipboard
      navigator.clipboard?.writeText(text).then(() => {
        alert('Score copied to clipboard — share it with friends!');
      }).catch(() => {
        prompt('Copy your score:', text);
      });
    }
  }

  // button events
  document.getElementById('nextBtn').addEventListener('click', nextQuestion);
  document.getElementById('skipBtn').addEventListener('click', () => {
    stopTimer();
    disableOptions();
    revealCorrect(null);
    setTimeout(nextQuestion, 700);
  });
  document.getElementById('restartBtn').addEventListener('click', resetQuiz);
  document.getElementById('shareBtn').addEventListener('click', shareScore);

  // keyboard: next on space when answered
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight' && !document.getElementById('result-card').classList.contains('hidden')) {
      resetQuiz();
    }
  });

  // initial render
  renderQuestion();

  // -------------------------
  // Simple confetti (canvas) — small lightweight implementation
  // -------------------------
  const confettiCanvas = document.getElementById('confetti');
  confettiCanvas.width = window.innerWidth;
  confettiCanvas.height = window.innerHeight;
  const ctx = confettiCanvas.getContext('2d');
  let confettiPieces = [];
  let confettiInterval = null;

  function random(min, max){ return Math.random() * (max - min) + min; }

  function spawnConfetti(count = 80) {
    confettiPieces = [];
    const colors = ['#006b3f','#12a24a','#ffffff','#e6f7ec'];
    for(let i=0;i<count;i++){
      confettiPieces.push({
        x: random(0, confettiCanvas.width),
        y: random(-confettiCanvas.height, 0),
        r: random(6, 12),
        d: random(2, 6),
        color: colors[Math.floor(random(0, colors.length))],
        tilt: random(-10,10),
        tiltSpeed: random(0.1,0.6),
        drift: random(-0.6,0.6),
      });
    }
  }

  function drawConfetti(){
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
    confettiPieces.forEach(p => {
      ctx.beginPath();
      ctx.fillStyle = p.color;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.tilt * Math.PI/180);
      ctx.fillRect(-p.r/2, -p.r/2, p.r, p.r*0.6);
      ctx.restore();
      p.y += p.d;
      p.x += p.d * p.d * 0.0008 + p.d * p.d * p.d * 0.00001 + p.d * (p.d > 3 ? 0.2 : 0.05) + p.d * p.d * p.d * 0.000001 + p.d * 0.04 + p.d * p.d * 0.0001 + p.d * p.d * 0.0001 + p.d * p.d * 0.00001 + p.d * 0.1 + p.d * 0.01 + p.d * p.d * 0.002;
      p.x += p.drift;
      p.tilt += p.tiltSpeed;
      if(p.y > confettiCanvas.height + 20){
        p.y = random(-20, -100);
        p.x = random(0, confettiCanvas.width);
      }
    });
  }

  function startConfetti(){
    spawnConfetti(120);
    confettiCanvas.style.display = 'block';
    if(confettiInterval) clearInterval(confettiInterval);
    confettiInterval = setInterval(drawConfetti, 16);
  }
  function stopConfetti(){
    if(confettiInterval){ clearInterval(confettiInterval); confettiInterval = null; }
    ctx.clearRect(0,0,confettiCanvas.width, confettiCanvas.height);
  }

  // resize
  window.addEventListener('resize', () => {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  });

})();


