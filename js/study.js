/* ==================== NOTES WALLAH - STUDY SECTION ==================== */

// Temporary sample data (will move fully to Firestore later)
const SUBJECTS_DATA = {
  "9": [
    { id: "science", name: "Science", icon: "fas fa-flask" },
    { id: "maths", name: "Mathematics", icon: "fas fa-square-root-alt" },
    { id: "english", name: "English", icon: "fas fa-book" },
    { id: "hindi", name: "Hindi", icon: "fas fa-language" },
    { id: "sst", name: "Social Science", icon: "fas fa-globe-asia" }
  ],
  "10": [
    { id: "science", name: "Science", icon: "fas fa-flask" },
    { id: "maths", name: "Mathematics", icon: "fas fa-square-root-alt" },
    { id: "english", name: "English", icon: "fas fa-book" },
    { id: "hindi", name: "Hindi", icon: "fas fa-language" },
    { id: "sst", name: "Social Science", icon: "fas fa-globe-asia" }
  ],
  "11": [
    { id: "physics", name: "Physics", icon: "fas fa-atom" },
    { id: "chemistry", name: "Chemistry", icon: "fas fa-vial" },
    { id: "maths", name: "Mathematics", icon: "fas fa-square-root-alt" },
    { id: "biology", name: "Biology", icon: "fas fa-dna" },
    { id: "english", name: "English", icon: "fas fa-book" }
  ],
  "12": [
    { id: "physics", name: "Physics", icon: "fas fa-atom" },
    { id: "chemistry", name: "Chemistry", icon: "fas fa-vial" },
    { id: "maths", name: "Mathematics", icon: "fas fa-square-root-alt" },
    { id: "biology", name: "Biology", icon: "fas fa-dna" },
    { id: "english", name: "English", icon: "fas fa-book" }
  ]
};

const CHAPTERS_DATA = {
  "physics": [
    { id: "ch1", number: 1, name: "Electric Charges and Fields", hasEbook: true, hasProNotes: true },
    { id: "ch2", number: 2, name: "Electrostatic Potential and Capacitance", hasEbook: true, hasProNotes: true },
    { id: "ch3", number: 3, name: "Current Electricity", hasEbook: true, hasProNotes: false },
    { id: "ch4", number: 4, name: "Moving Charges and Magnetism", hasEbook: true, hasProNotes: true }
  ],
  "chemistry": [
    { id: "ch1", number: 1, name: "The Solid State", hasEbook: true, hasProNotes: true },
    { id: "ch2", number: 2, name: "Solutions", hasEbook: true, hasProNotes: true },
    { id: "ch3", number: 3, name: "Electrochemistry", hasEbook: true, hasProNotes: false }
  ],
  "maths": [
    { id: "ch1", number: 1, name: "Relations and Functions", hasEbook: true, hasProNotes: true },
    { id: "ch2", number: 2, name: "Inverse Trigonometric Functions", hasEbook: true, hasProNotes: true },
    { id: "ch3", number: 3, name: "Matrices", hasEbook: true, hasProNotes: false }
  ],
  "biology": [
    { id: "ch1", number: 1, name: "Reproduction in Organisms", hasEbook: true, hasProNotes: true },
    { id: "ch2", number: 2, name: "Sexual Reproduction in Flowering Plants", hasEbook: true, hasProNotes: true }
  ],
  "science": [
    { id: "ch1", number: 1, name: "Chemical Reactions and Equations", hasEbook: true, hasProNotes: true },
    { id: "ch2", number: 2, name: "Acids, Bases and Salts", hasEbook: true, hasProNotes: true },
    { id: "ch3", number: 3, name: "Metals and Non-metals", hasEbook: true, hasProNotes: false }
  ],
  "english": [
    { id: "ch1", number: 1, name: "The Last Lesson", hasEbook: true, hasProNotes: false },
    { id: "ch2", number: 2, name: "Lost Spring", hasEbook: true, hasProNotes: false }
  ],
  "hindi": [
    { id: "ch1", number: 1, name: "सूरदास", hasEbook: true, hasProNotes: false }
  ],
  "sst": [
    { id: "ch1", number: 1, name: "The Rise of Nationalism in Europe", hasEbook: true, hasProNotes: true }
  ]
};

// Current navigation state inside Study
let currentSubject = null;

function loadSubjects() {
  const container = document.getElementById('subjects-list');
  if (!container) return;

  const userClass = AppState.user.class || "10";
  const subjects = SUBJECTS_DATA[userClass] || SUBJECTS_DATA["10"];

  if (!subjects || subjects.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-book"></i>
        <p>No subjects available yet</p>
      </div>`;
    return;
  }

  let html = `<div class="subjects-grid">`;
  subjects.forEach(sub => {
    html += `
      <div class="subject-card" onclick="openSubject('${sub.id}', '${sub.name}')">
        <i class="${sub.icon}"></i>
        <span>${sub.name}</span>
      </div>`;
  });
  html += `</div>`;
  container.innerHTML = html;
}

function openSubject(subjectId, subjectName) {
  currentSubject = { id: subjectId, name: subjectName };
  const container = document.getElementById('subjects-list');
  const chapters = CHAPTERS_DATA[subjectId] || [];

  let html = `
    <div class="back-bar" onclick="loadSubjects()">
      <i class="fas fa-arrow-left"></i>
      <span>${subjectName}</span>
    </div>
    <p class="page-subtitle">${chapters.length} Chapters</p>
  `;

  if (chapters.length === 0) {
    html += `
      <div class="empty-state">
        <i class="fas fa-book-open"></i>
        <p>No chapters available yet</p>
      </div>`;
  } else {
    html += `<div class="chapters-list">`;
    chapters.forEach(ch => {
      html += `
        <div class="chapter-card" onclick="openChapter('${ch.id}', '${ch.name}', ${ch.number})">
          <div class="chapter-number">${ch.number}</div>
          <div class="chapter-info">
            <h4>${ch.name}</h4>
            <div class="chapter-tags">
              ${ch.hasEbook ? '<span class="tag ebook">Ebook</span>' : ''}
              ${ch.hasProNotes ? '<span class="tag pro">Pro Notes</span>' : ''}
            </div>
          </div>
          <i class="fas fa-chevron-right"></i>
        </div>`;
    });
    html += `</div>`;
  }

  container.innerHTML = html;
}

function openChapter(chapterId, chapterName, chapterNumber) {
  const container = document.getElementById('subjects-list');

  container.innerHTML = `
    <div class="back-bar" onclick="openSubject('${currentSubject.id}', '${currentSubject.name}')">
      <i class="fas fa-arrow-left"></i>
      <span>Chapter ${chapterNumber}</span>
    </div>

    <div class="chapter-detail">
      <h2>${chapterName}</h2>
      <p class="chapter-meta">${currentSubject.name} · Chapter ${chapterNumber}</p>

      <div class="action-cards">
        <div class="action-card" onclick="openEbook()">
          <i class="fas fa-book-open"></i>
          <div>
            <h4>Read</h4>
            <p>NCERT Ebook</p>
          </div>
        </div>

        <div class="action-card" onclick="openProNotes()">
          <i class="fas fa-file-alt"></i>
          <div>
            <h4>Pro Notes</h4>
            <p>Study material</p>
          </div>
        </div>
      </div>
    </div>
  `;
}

function openEbook() {
  // Later we will use real NCERT links from Firestore
  alert('NCERT Ebook link will open here.\n\n(Real links will be added from admin panel later)');
  // window.open('https://ncert.nic.in/...', '_blank');
}

function openProNotes() {
  // Ad will play quietly in background later (AdMob). For now just open.
  showRewardedAd(() => {
    alert('Pro Notes will open here.\n\n(Real files will be added soon)');
  });
}

// Ad placeholder - later connect real rewarded ad. Do not show messages about ads in UI.
function showRewardedAd(onSuccess) {
  // Silent for now - just continue
  if (typeof onSuccess === 'function') {
    onSuccess();
  }
}

// Load subjects when Study tab is opened
document.addEventListener('DOMContentLoaded', () => {
  // Hook into navigation
  const studyNav = document.querySelector('.nav-item[data-page="study"]');
  if (studyNav) {
    studyNav.addEventListener('click', () => {
      setTimeout(loadSubjects, 50);
    });
  }
});
