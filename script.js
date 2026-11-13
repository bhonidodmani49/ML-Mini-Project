// ===== Health Risk Predictor — Prediction Logic =====

(function () {
  'use strict';

  const form = document.getElementById('predict-form');
  const btnPredict = document.getElementById('btn-predict');
  const btnLoader = document.getElementById('btn-loader');
  const resultCard = document.getElementById('result-card');
  const resultPlaceholder = document.getElementById('result-placeholder');
  const resultIcon = document.getElementById('result-icon');
  const resultLabel = document.getElementById('result-label');
  const resultLevel = document.getElementById('result-level');
  const resultBarFill = document.getElementById('result-bar-fill');
  const resultScoreText = document.getElementById('result-score-text');
  const resultFactors = document.getElementById('result-factors');
  const aiContainer = document.getElementById('ai-container');
  const aiContent = document.getElementById('ai-content');

  let chartInstance = null;

  // ——— Typewriter Effect for AI Suggestions ———
  function typeWriterEffect(texts, container) {
    container.innerHTML = '';
    let currentParagraphIndex = 0;
    
    function typeNextParagraph() {
      if (currentParagraphIndex >= texts.length) return;
      
      const p = document.createElement('p');
      p.className = 'typing-cursor';
      container.appendChild(p);
      
      const textToType = texts[currentParagraphIndex];
      let charIndex = 0;
      
      const typingInterval = setInterval(() => {
        if (charIndex < textToType.length) {
          p.textContent += textToType.charAt(charIndex);
          charIndex++;
        } else {
          clearInterval(typingInterval);
          p.classList.remove('typing-cursor');
          currentParagraphIndex++;
          setTimeout(typeNextParagraph, 300); // Wait before next paragraph
        }
      }, 25); // Typing speed
    }
    
    typeNextParagraph();
  }

  // ——— Simulated ML Prediction Logic ———
  function computeRiskDetails(age, bmi, bp, glucose, lifestyle, smoking) {
    let ageScore = 0, bmiScore = 0, bpScore = 0, glucoseScore = 0, lifestyleScore = 0, smokingScore = 0;

    if (age > 60) ageScore = 20;
    else if (age > 45) ageScore = 14;
    else if (age > 35) ageScore = 8;
    else ageScore = 3;

    if (bmi > 35) bmiScore = 20;
    else if (bmi > 30) bmiScore = 15;
    else if (bmi > 25) bmiScore = 9;
    else if (bmi < 18.5) bmiScore = 7;
    else bmiScore = 2;

    if (bp > 180) bpScore = 20;
    else if (bp > 140) bpScore = 16;
    else if (bp > 130) bpScore = 10;
    else if (bp > 120) bpScore = 5;
    else bpScore = 2;

    if (glucose > 200) glucoseScore = 20;
    else if (glucose > 140) glucoseScore = 15;
    else if (glucose > 120) glucoseScore = 9;
    else if (glucose > 100) glucoseScore = 5;
    else glucoseScore = 2;

    if (lifestyle === 'sedentary') lifestyleScore = 10;
    else if (lifestyle === 'moderate') lifestyleScore = 5;
    else lifestyleScore = 1;

    if (smoking === 'yes') smokingScore = 10;
    else smokingScore = 1;

    const total = ageScore + bmiScore + bpScore + glucoseScore + lifestyleScore + smokingScore;
    const score = Math.min(100, Math.max(0, total));

    return {
      score,
      breakdown: [
        (ageScore / 20) * 100,
        (bmiScore / 20) * 100,
        (bpScore / 20) * 100,
        (glucoseScore / 20) * 100,
        (lifestyleScore / 10) * 100,
        (smokingScore / 10) * 100
      ]
    };
  }

  function getFactors(age, bmi, bp, glucose, lifestyle, smoking) {
    const factors = [];
    if (age > 50) factors.push({ text: 'Age > 50', risk: true });
    else factors.push({ text: 'Age OK', risk: false });

    if (bmi > 30) factors.push({ text: 'Obese BMI', risk: true });
    else if (bmi > 25) factors.push({ text: 'Overweight', risk: true });
    else factors.push({ text: 'Healthy BMI', risk: false });

    if (bp > 140) factors.push({ text: 'High BP', risk: true });
    else factors.push({ text: 'Normal BP', risk: false });

    if (glucose > 140) factors.push({ text: 'High Glucose', risk: true });
    else factors.push({ text: 'Normal Glucose', risk: false });

    if (lifestyle === 'sedentary') factors.push({ text: 'Sedentary', risk: true });
    else if (lifestyle === 'active') factors.push({ text: 'Active', risk: false });
    else factors.push({ text: 'Moderate', risk: false });

    if (smoking === 'yes') factors.push({ text: 'Smoker', risk: true });
    else factors.push({ text: 'Non-smoker', risk: false });

    return factors;
  }

  function generateAISuggestions(age, bmi, bp, glucose, lifestyle, smoking, score) {
    const suggestions = [];
    
    if (score < 45) {
        suggestions.push("Keep up the great work! Your health metrics are currently in a very safe range.");
        if (lifestyle !== 'active') {
            suggestions.push("Consider incorporating more physical activity to maintain these excellent stats as you age.");
        }
        if (smoking === 'yes') {
            suggestions.push("Quitting smoking now will ensure you stay in the low-risk category long term.");
        }
    } else {
        suggestions.push("Based on the data, your health profile flags a high risk. Let's focus on actionable preventative measures.");
        
        if (bmi > 25) {
            suggestions.push("AI Dietitian: Consider a calorie deficit of 300-500 kcal/day and focus on lean proteins to safely reduce your BMI.");
        }
        if (bp > 130) {
            suggestions.push("Cardio Alert: Aim to reduce sodium intake to under 1500mg daily. Daily 30-minute brisk walks will help lower blood pressure naturally.");
        }
        if (glucose > 100) {
            suggestions.push("Metabolic Advice: Cut out added sugars and processed carbohydrates. Opt for complex carbs and fiber to stabilize your blood glucose.");
        }
        if (lifestyle === 'sedentary') {
            suggestions.push("Activity Goal: Start small. Try the '10-minute rule' - walk for 10 minutes after every major meal. This drastically improves insulin sensitivity.");
        }
        if (smoking === 'yes') {
            suggestions.push("Critical Intervention: Smoking exponentially amplifies other risks. Speak to a doctor about nicotine replacement therapy (NRT) to start a cessation plan.");
        }
    }
            
    if (suggestions.length < 3 && score >= 45) {
        suggestions.push("Schedule a comprehensive checkup with your primary care physician to run a full lipid panel.");
    }
        
    return suggestions;
  }

  // ——— Form Submit Handler ———
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Gather values
    const age = parseFloat(document.getElementById('input-age').value);
    const bmi = parseFloat(document.getElementById('input-bmi').value);
    const bp = parseFloat(document.getElementById('input-bp').value);
    const glucose = parseFloat(document.getElementById('input-glucose').value);
    const lifestyle = document.getElementById('input-lifestyle').value;
    const smoking = document.getElementById('input-smoking').value;

    // Show loading state
    btnPredict.classList.add('loading');
    btnPredict.disabled = true;
    aiContainer.classList.add('hidden');

    setTimeout(function () {
      const riskData = computeRiskDetails(age, bmi, bp, glucose, lifestyle, smoking);
      const score = riskData.score;
      const isHighRisk = score >= 45;
      const factors = getFactors(age, bmi, bp, glucose, lifestyle, smoking);
      const aiSuggestions = generateAISuggestions(age, bmi, bp, glucose, lifestyle, smoking, score);

      // Hide placeholder, show result card
      resultPlaceholder.style.display = 'none';
      resultCard.classList.remove('hidden', 'low-risk', 'high-risk');
      resultCard.classList.add(isHighRisk ? 'high-risk' : 'low-risk');

      // Populate result
      resultIcon.textContent = isHighRisk ? '⚠️' : '✅';
      resultLabel.textContent = isHighRisk ? 'High Risk' : 'Low Risk';
      resultLevel.textContent = isHighRisk
        ? 'Elevated health risk detected'
        : 'Your health indicators look good';

      // Animate bar
      resultBarFill.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          resultBarFill.style.width = score + '%';
        });
      });

      resultScoreText.textContent = 'Risk Score: ' + score + ' / 100';

      // Render Chart
      renderChart(riskData.breakdown, isHighRisk);

      // Render factor tags
      resultFactors.innerHTML = '';
      factors.forEach(function (f) {
        const tag = document.createElement('span');
        tag.className = 'factor-tag ' + (f.risk ? 'risk' : 'safe');
        tag.textContent = f.text;
        resultFactors.appendChild(tag);
      });

      // Show AI Insights
      aiContainer.classList.remove('hidden');
      typeWriterEffect(aiSuggestions, aiContent);

      // Scroll result into view
      resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Reset button
      btnPredict.classList.remove('loading');
      btnPredict.disabled = false;
    }, 800);
  });

  // ——— Smooth scroll for nav links ———
  document.querySelectorAll('a[href^="#"]').forEach(function (link) {
    link.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  // ——— Chart Rendering ———
  function renderChart(dataArr, isHighRisk) {
    const ctx = document.getElementById('riskChart').getContext('2d');
    
    const color = isHighRisk ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)';
    const bgColor = isHighRisk ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)';

    if (chartInstance) {
      chartInstance.data.datasets[0].data = dataArr;
      chartInstance.data.datasets[0].borderColor = color;
      chartInstance.data.datasets[0].backgroundColor = bgColor;
      chartInstance.data.datasets[0].pointBackgroundColor = color;
      chartInstance.update();
      return;
    }

    Chart.defaults.color = '#7b809a';
    Chart.defaults.font.family = "'Inter', sans-serif";

    chartInstance = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: ['Age', 'BMI', 'Blood Pressure', 'Glucose', 'Lifestyle', 'Smoking'],
        datasets: [{
          label: 'Risk Contribution %',
          data: dataArr,
          backgroundColor: bgColor,
          borderColor: color,
          pointBackgroundColor: color,
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: color,
          borderWidth: 2,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
            grid: { color: 'rgba(255, 255, 255, 0.1)' },
            pointLabels: {
              color: '#a0a5bf',
              font: { size: 11, weight: '600' }
            },
            ticks: { display: false, min: 0, max: 100, stepSize: 25 }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'rgba(10, 14, 26, 0.9)',
            titleColor: '#fff',
            bodyColor: '#e0e4ef',
            borderColor: 'rgba(255,255,255,0.1)',
            borderWidth: 1,
            padding: 10,
            displayColors: false,
            callbacks: {
              label: function(context) {
                return context.raw.toFixed(0) + '% risk';
              }
            }
          }
        }
      }
    });
  }
})();
