/* ==================== NOTES WALLAH - TEST SECTION ==================== */

// Sample test subjects based on class (same as study for now)
const TEST_SUBJECTS = {
  "9": ["Science", "Mathematics", "English", "Hindi", "Social Science"],
  "10": ["Science", "Mathematics", "English", "Hindi", "Social Science"],
  "11": ["Physics", "Chemistry", "Mathematics", "Biology", "English"],
  "12": ["Physics", "Chemistry", "Mathematics", "Biology", "English"]
};

function loadTestPage() {
  const container = document.getElementById('test-content');
  if (!container) return;

  const userClass = AppState.user.class || "10";
  const subjects = TEST_SUBJECTS[userClass] || TEST_SUBJECTS["10"];

  let html = `
    <div class="test-intro card">
      <h3>Practice Tests</h3>
      <p>Select a subject to start a chapter-wise or full syllabus test.</p>
    </div>
    <div class="subjects-grid" style="margin-top:16px">
  `;

  subjects.forEach(sub => {
    html += `
      <div class="subject-card" onclick="openTestSubject('${sub}')">
        <i class="fas fa-clipboard-list"></i>
        <span>${sub}</span>
      </div>`;
  });

  html += `</div>`;
  container.innerHTML = html;
}

function openTestSubject(subjectName) {
  const container = document.getElementById('test-content');
  container.innerHTML = `
    <div class="back-bar" onclick="loadTestPage()">
      <i class="fas fa-arrow-left"></i>
      <span>${subjectName}</span>
    </div>

    <div class="test-options">
      <div class="action-card" onclick="startTestConfig('${subjectName}', 'chapter')">
        <i class="fas fa-book"></i>
        <div>
          <h4>Chapter Test</h4>
          <p>Test one chapter at a time</p>
        </div>
      </div>

      <div class="action-card" onclick="startTestConfig('${subjectName}', 'full')">
        <i class="fas fa-layer-group"></i>
        <div>
          <h4>Full Syllabus Test</h4>
          <p>Mixed questions from all chapters</p>
        </div>
      </div>
    </div>

    <p class="page-subtitle" style="margin-top:24px">Coming in next parts:</p>
    <ul class="coming-list">
      <li>Real MCQ question bank</li>
      <li>Timer + Negative marking</li>
      <li>Result + Review answers</li>
      <li>Previous Year Questions</li>
    </ul>
  `;
}

function startTestConfig(subject, type) {
  alert(`Test configuration for ${subject} (${type}) will be added in the next part.\n\nWe will add:\n- Number of questions\n- Timer\n- Negative marking\n- Real questions from Firebase`);
}

// Load when Test tab is clicked
document.addEventListener('DOMContentLoaded', () => {
  const testNav = document.querySelector('.nav-item[data-page="test"]');
  if (testNav) {
    testNav.addEventListener('click', () => {
      setTimeout(loadTestPage, 50);
    });
  }
});
