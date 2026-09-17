/* ==================== NOTES WALLAH - CHALLENGES ==================== */

function loadChallengesPage() {
  const container = document.getElementById('challenges-content');
  if (!container) return;

  container.innerHTML = `
    <div class="challenges-list">
      <div class="challenge-card daily" onclick="startDailyChallenge()">
        <div class="challenge-icon">
          <i class="fas fa-sun"></i>
        </div>
        <div class="challenge-info">
          <h3>Daily Challenge</h3>
          <p>5 questions · New every day</p>
        </div>
        <i class="fas fa-chevron-right"></i>
      </div>

      <div class="challenge-card weekly" onclick="startWeeklyChallenge()">
        <div class="challenge-icon">
          <i class="fas fa-calendar-week"></i>
        </div>
        <div class="challenge-info">
          <h3>Weekly Challenge</h3>
          <p>5 questions · Resets every week</p>
        </div>
        <i class="fas fa-chevron-right"></i>
      </div>
    </div>

    <div class="card" style="margin-top:20px; text-align:center; color:var(--text-light); font-size:13px;">
      Real questions and scoring will come in the next parts.
    </div>
  `;
}

function startDailyChallenge() {
  alert('Daily Challenge will start here.\n\n5 random questions from your class syllabus.\n(Coming in next part with real MCQs)');
}

function startWeeklyChallenge() {
  alert('Weekly Challenge will start here.\n\n5 questions · Bigger reward style.\n(Coming in next part)');
}

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.nav-item[data-page="challenges"]');
  if (nav) {
    nav.addEventListener('click', () => {
      setTimeout(loadChallengesPage, 50);
    });
  }
});
