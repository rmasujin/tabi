// Wedding Site App - Navigation & Interactions

(function() {
  'use strict';

  // State
  let currentScreen = 'home';
  let currentSeatsView = 'map';

  // Get elements
  const screens = {
    home: document.getElementById('screen-home'),
    menu: document.getElementById('screen-menu'),
    seats: document.getElementById('screen-seats'),
    tableDetail: document.getElementById('screen-table-detail')
  };

  const navButtons = {
    home: document.getElementById('nav-home'),
    menu: document.getElementById('nav-menu'),
    seats: document.getElementById('nav-seats')
  };

  const seatsViews = {
    map: document.getElementById('view-map'),
    list: document.getElementById('view-list')
  };

  const seatsTabs = {
    map: document.getElementById('tab-map'),
    list: document.getElementById('tab-list')
  };

  // Navigation functions
  function showScreen(screenName) {
    // Hide all screens
    Object.values(screens).forEach(screen => {
      if (screen) screen.classList.remove('active');
    });

    // Show target screen
    if (screens[screenName]) {
      screens[screenName].classList.add('active');
      currentScreen = screenName;

      // Scroll to top
      screens[screenName].scrollTop = 0;
    }

    // Update nav buttons (only for main screens)
    if (screenName !== 'tableDetail') {
      updateNavButtons(screenName);
      // Update URL hash
      window.location.hash = screenName;
    }
  }

  function updateNavButtons(screenName) {
    Object.keys(navButtons).forEach(key => {
      const btn = navButtons[key];
      if (btn) {
        if (key === screenName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      }
    });
  }

  function switchSeatsView(viewName) {
    currentSeatsView = viewName;

    // Update tabs
    if (viewName === 'map') {
      if (seatsTabs.map) seatsTabs.map.classList.add('active');
      if (seatsTabs.list) seatsTabs.list.classList.remove('active');
      if (seatsViews.map) seatsViews.map.classList.add('active');
      if (seatsViews.list) seatsViews.list.classList.remove('active');
    } else {
      if (seatsTabs.list) seatsTabs.list.classList.add('active');
      if (seatsTabs.map) seatsTabs.map.classList.remove('active');
      if (seatsViews.list) seatsViews.list.classList.add('active');
      if (seatsViews.map) seatsViews.map.classList.remove('active');
    }
  }

  function showTableDetail(tableName) {
    showScreen('tableDetail');

    const titleEl = document.getElementById('table-detail-title');
    if (titleEl) {
      titleEl.textContent = tableName + ' 卓';
    }
  }

  function backToSeats() {
    showScreen('seats');
  }

  // Event listeners - Navigation
  if (navButtons.home) {
    navButtons.home.addEventListener('click', () => showScreen('home'));
  }
  if (navButtons.menu) {
    navButtons.menu.addEventListener('click', () => showScreen('menu'));
  }
  if (navButtons.seats) {
    navButtons.seats.addEventListener('click', () => showScreen('seats'));
  }

  // Event listeners - Seats tabs
  if (seatsTabs.map) {
    seatsTabs.map.addEventListener('click', () => switchSeatsView('map'));
  }
  if (seatsTabs.list) {
    seatsTabs.list.addEventListener('click', () => switchSeatsView('list'));
  }

  // Event listeners - Table circles (on map)
  const tableCircles = document.querySelectorAll('.table-circle');
  tableCircles.forEach(circle => {
    circle.addEventListener('click', (e) => {
      const tableName = circle.getAttribute('data-table');
      if (tableName) {
        showTableDetail(tableName);
      }
    });
  });

  // Event listeners - Table items (on list)
  const tableItems = document.querySelectorAll('.table-list-item');
  tableItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const tableName = item.getAttribute('data-table');
      if (tableName) {
        showTableDetail(tableName);
      }
    });
  });

  // Event listeners - Back button
  const backBtn = document.getElementById('back-to-seats');
  if (backBtn) {
    backBtn.addEventListener('click', backToSeats);
  }

  // Handle URL hash changes
  window.addEventListener('hashchange', () => {
    const hash = window.location.hash.slice(1);
    if (hash && screens[hash]) {
      showScreen(hash);
    }
  });

  // Prevent pull-to-refresh on mobile
  let startY = 0;
  document.body.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.body.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    const activeScreen = document.querySelector('.screen.active');

    if (activeScreen && activeScreen.scrollTop === 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });

  // Initialize from URL hash
  function init() {
    const hash = window.location.hash.slice(1);
    if (hash && screens[hash]) {
      showScreen(hash);
    } else {
      showScreen('home');
    }

    // Set initial seats view
    switchSeatsView('map');
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
