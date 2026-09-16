/* ==================== NOTES WALLAH - NAVIGATION ==================== */

document.addEventListener('DOMContentLoaded', () => {

  // Bottom Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const pages = document.querySelectorAll('.page');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetPage = item.getAttribute('data-page');

      // Update active nav
      navItems.forEach(nav => nav.classList.remove('active'));
      item.classList.add('active');

      // Show target page
      pages.forEach(page => page.classList.remove('active'));
      const pageEl = document.getElementById(`page-${targetPage}`);
      if (pageEl) {
        pageEl.classList.add('active');
      }
    });
  });

  // Quick Access cards on Home
  const quickCards = document.querySelectorAll('.quick-card');
  quickCards.forEach(card => {
    card.addEventListener('click', () => {
      const tab = card.getAttribute('data-tab');
      
      // Find and click the corresponding nav item
      const navItem = document.querySelector(`.nav-item[data-page="${tab}"]`);
      if (navItem) {
        navItem.click();
      }
    });
  });

});
