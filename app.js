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
    profile: document.getElementById('screen-profile'),
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
    if (screenName !== 'tableDetail' && screenName !== 'profile') {
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

  function showTableDetail(tableId) {
    showScreen('tableDetail');

    const table = SEATING_DATA.tables.find(t => t.id === tableId || t.label === tableId);
    if (!table) return;

    renderTableDetail(table);
  }

  function renderTableDetail(table) {
    const titleEl = document.getElementById('table-detail-title');
    if (titleEl) {
      titleEl.textContent = table.label + ' 卓';
    }

    // Update table header
    const tableBadge = document.querySelector('#screen-table-detail .table-badge');
    const seatsInfo = document.querySelector('#screen-table-detail .seats-info');
    const tableDescription = document.querySelector('#screen-table-detail .table-description');

    if (tableBadge) tableBadge.textContent = `TABLE ${table.label}`;
    if (seatsInfo) seatsInfo.textContent = `${table.guests.length} ／ ${table.seatCount} SEATS`;
    if (tableDescription) tableDescription.textContent = table.category;

    // Update seat diagram
    const seatDiagram = document.querySelector('.seat-diagram');
    if (seatDiagram) {
      const tableLetter = seatDiagram.querySelector('.table-letter');
      if (tableLetter) tableLetter.textContent = table.label;

      // Update seat positions - only show occupied seats, evenly distributed
      const guests = table.guests;
      const guestCount = guests.length;

      let seatsHTML = '';
      guests.forEach((guest, index) => {
        // Distribute evenly around the circle
        const angle = (360 / guestCount) * index;
        const radius = 85;
        const x = 107 + radius * Math.sin(angle * Math.PI / 180);
        const y = 107 - radius * Math.cos(angle * Math.PI / 180);

        seatsHTML += `<div class="seat-position" style="left:${x}px; top:${y}px">${guest.seat}</div>`;
      });

      const existingSeats = seatDiagram.querySelectorAll('.seat-position');
      existingSeats.forEach(seat => seat.remove());
      seatDiagram.insertAdjacentHTML('beforeend', seatsHTML);
    }

    // Update guest list
    const guestList = document.querySelector('.guest-list');
    if (guestList) {
      guestList.innerHTML = '';
      table.guests.forEach(guest => {
        const honorific = guest.honorific || '';
        const note = guest.note ? `<span class="guest-role">　${guest.note}</span>` : '';
        const guestHTML = `
          <div class="guest-item">
            <span class="seat-number">${guest.seat}</span>
            <span class="guest-name">${guest.name}${honorific}${note}</span>
          </div>
        `;
        guestList.insertAdjacentHTML('beforeend', guestHTML);
      });
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

  // Event listeners - Back buttons
  const backToSeatsBtn = document.getElementById('back-to-seats');
  if (backToSeatsBtn) {
    backToSeatsBtn.addEventListener('click', backToSeats);
  }

  const backToHomeBtn = document.getElementById('back-to-home');
  if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => showScreen('home'));
  }

  // Event listeners - Posts (click to show profile)
  const posts = document.querySelectorAll('.post');
  posts.forEach(post => {
    // Don't navigate when clicking on slider
    const slider = post.querySelector('.slider-container');
    if (slider) {
      slider.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    post.addEventListener('click', (e) => {
      showScreen('profile');
    });
    post.style.cursor = 'pointer';
  });

  // Post image slider functionality
  function initPostSliders() {
    const sliders = document.querySelectorAll('.slider-container');

    sliders.forEach(container => {
      const postSlider = container.closest('.post-slider');
      const postId = postSlider.getAttribute('data-post-id');
      const dotsContainer = document.querySelector(`.pagination-dots[data-post-id="${postId}"]`);
      const dots = dotsContainer ? dotsContainer.querySelectorAll('.dot') : [];

      let isScrolling = false;

      container.addEventListener('scroll', () => {
        if (isScrolling) return;

        isScrolling = true;
        requestAnimationFrame(() => {
          const scrollLeft = container.scrollLeft;
          const width = container.offsetWidth;
          const index = Math.round(scrollLeft / width);

          // Update dots
          dots.forEach((dot, i) => {
            if (i === index) {
              dot.classList.add('active');
            } else {
              dot.classList.remove('active');
            }
          });

          isScrolling = false;
        });
      });
    });
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

  // Render table list view
  function renderTableList() {
    const tableListContainer = document.querySelector('.table-list');
    if (!tableListContainer) return;

    tableListContainer.innerHTML = '';

    // Filter out takasago (head table) and render regular tables
    const regularTables = SEATING_DATA.tables.filter(t => t.shape === 'round');

    regularTables.forEach(table => {
      const firstGuest = table.guests[0];
      const guestName = firstGuest ? `${firstGuest.name}${firstGuest.honorific || ''}` : '';
      const otherCount = table.guests.length > 1 ? ` 他 ${table.guests.length - 1}名` : '';

      const itemHTML = `
        <div class="table-list-item" data-table="${table.id}">
          <div class="table-avatar"></div>
          <div class="table-info">
            <div class="table-badge">TABLE ${table.label}</div>
            <div class="table-title">${table.category}</div>
            <div class="table-guests">${guestName}${otherCount}</div>
          </div>
          <svg class="chevron" width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#C2C1B9" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M8 4l6 6-6 6"></path>
          </svg>
        </div>
      `;
      tableListContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Re-attach click event listeners for dynamically created items
    const newTableItems = document.querySelectorAll('.table-list-item');
    newTableItems.forEach(item => {
      item.addEventListener('click', (e) => {
        const tableId = item.getAttribute('data-table');
        if (tableId) {
          showTableDetail(tableId);
        }
      });
    });
  }

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

    // Initialize post sliders
    initPostSliders();

    // Render table list
    renderTableList();
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
