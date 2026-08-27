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
    profileKanami: document.getElementById('screen-profile-kanami'),
    profileRiki: document.getElementById('screen-profile-riki'),
    tableDetail: document.getElementById('screen-table-detail'),
    search: document.getElementById('screen-search')
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
    const previousScreen = currentScreen;
    const targetScreen = screens[screenName];

    if (!targetScreen) return;

    // For slide-in screens, keep previous screen visible during animation
    const isSlideScreen = screenName === 'profileKanami' || screenName === 'profileRiki' || screenName === 'tableDetail';

    if (!isSlideScreen) {
      // For non-sliding screens, hide all other screens immediately
      Object.values(screens).forEach(screen => {
        if (screen && screen !== targetScreen) {
          screen.classList.remove('active');
        }
      });
    }

    // Show target screen
    requestAnimationFrame(() => {
      targetScreen.classList.add('active');
      currentScreen = screenName;

      // Scroll to top
      targetScreen.scrollTop = 0;

      // For slide-in screens, hide other screens after animation completes
      if (isSlideScreen) {
        setTimeout(() => {
          Object.values(screens).forEach(screen => {
            if (screen && screen !== targetScreen && !screen.classList.contains('active')) {
              // This screen should already be inactive from previous navigation
            }
          });
        }, 300); // Match transition duration
      }
    });

    // Update nav buttons (only for main screens)
    if (screenName !== 'tableDetail' && screenName !== 'profileKanami' && screenName !== 'profileRiki' && screenName !== 'search') {
      updateNavButtons(screenName);
      // Update URL hash
      window.location.hash = screenName;
    } else if (screenName === 'search') {
      // Keep seats button active during search
      updateNavButtons('seats');
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

        // Highlight selected guest from search
        const isHighlighted = selectedGuestForHighlight && guest.id === selectedGuestForHighlight;
        const bgColor = isHighlighted ? '#0A0A0A' : '#F4F4F0';
        const textColor = isHighlighted ? '#fff' : '#0A0A0A';

        // Use sequential numbering (1, 2, 3...) instead of original seat numbers
        seatsHTML += `<div class="seat-position" style="left:${x}px; top:${y}px; background:${bgColor}; color:${textColor}">${index + 1}</div>`;
      });

      const existingSeats = seatDiagram.querySelectorAll('.seat-position');
      existingSeats.forEach(seat => seat.remove());
      seatDiagram.insertAdjacentHTML('beforeend', seatsHTML);
    }

    // Update guest list
    const guestList = document.querySelector('.guest-list');
    if (guestList) {
      guestList.innerHTML = '';
      table.guests.forEach((guest, index) => {
        const honorific = guest.honorific || '';
        const note = guest.note ? `<span class="guest-role">　${guest.note}</span>` : '';
        const isHighlighted = selectedGuestForHighlight && guest.id === selectedGuestForHighlight;
        const highlightStyle = isHighlighted ? ' style="font-weight: 700;"' : '';
        const guestHTML = `
          <div class="guest-item"${highlightStyle}>
            <span class="seat-number">${index + 1}</span>
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

  const backToHomeBtns = document.querySelectorAll('.back-to-home');
  backToHomeBtns.forEach(btn => {
    btn.addEventListener('click', () => showScreen('home'));
  });

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

    // Don't navigate when clicking read more button
    const readMore = post.querySelector('.read-more');
    if (readMore) {
      readMore.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    post.addEventListener('click', (e) => {
      const author = post.getAttribute('data-author');
      if (author === 'riki') {
        showScreen('profileRiki');
      } else if (author === 'kanami') {
        showScreen('profileKanami');
      } else {
        // Default to KANAMI for posts without author (like the first joint post)
        showScreen('profileKanami');
      }
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

  // Search functionality
  let selectedGuestForHighlight = null;

  function showSearch() {
    selectedGuestForHighlight = null;

    // Get the input element before screen transition
    const searchInput = document.getElementById('search-header-input');

    // Show screen first
    showScreen('search');

    // Immediately focus and prepare for input
    if (searchInput) {
      searchInput.value = '';
      // Direct focus from user click event (crucial for mobile keyboard)
      searchInput.focus();
    }

    renderSearchResults('');
  }

  function getAllGuests() {
    const allGuests = [];
    SEATING_DATA.tables.forEach(table => {
      if (table.shape === 'round') {
        table.guests.forEach((guest, index) => {
          allGuests.push({
            ...guest,
            tableId: table.id,
            tableLabel: table.label,
            seatIndex: index + 1
          });
        });
      }
    });
    return allGuests;
  }

  function hiraganaToKatakana(str) {
    return str.replace(/[\u3041-\u3096]/g, (match) => {
      const chr = match.charCodeAt(0) + 0x60;
      return String.fromCharCode(chr);
    });
  }

  function renderSearchResults(query) {
    const resultsContainer = document.getElementById('search-results');
    const resultsCount = document.getElementById('results-count');
    if (!resultsContainer || !resultsCount) return;

    let guests = getAllGuests();

    // Filter if there's a query
    if (query) {
      const queryKatakana = hiraganaToKatakana(query);
      guests = guests.filter(guest =>
        guest.name.includes(query) ||
        guest.kana.includes(query) ||
        guest.kana.includes(queryKatakana)
      );
    } else {
      // Sort alphabetically by kana when no query
      guests.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));
    }

    // Update count
    const countText = query ? `${guests.length} RESULT${guests.length !== 1 ? 'S' : ''}` : '68 GUESTS';
    resultsCount.textContent = countText;

    // Render results
    resultsContainer.innerHTML = '';
    guests.forEach(guest => {
      const honorific = guest.honorific || '';
      const itemHTML = `
        <div class="search-result-item" data-table-id="${guest.tableId}" data-guest-id="${guest.id}">
          <div class="search-result-info">
            <div class="search-result-name">${guest.name}${honorific}</div>
            <div class="search-result-relation">${guest.relation}</div>
          </div>
          <div class="search-result-table">${guest.tableLabel} — ${guest.seatIndex}</div>
        </div>
      `;
      resultsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Add click handlers
    const resultItems = resultsContainer.querySelectorAll('.search-result-item');
    resultItems.forEach(item => {
      item.addEventListener('click', () => {
        const tableId = item.getAttribute('data-table-id');
        const guestId = item.getAttribute('data-guest-id');
        selectedGuestForHighlight = guestId;
        showTableDetail(tableId);
      });
    });
  }

  function setupSearch() {
    // Click on search bar opens search screen
    const searchBar = document.querySelector('.search-bar');
    if (searchBar) {
      searchBar.addEventListener('click', (e) => {
        e.preventDefault();
        showSearch();
        // Extra focus attempt after a tiny delay to ensure screen has rendered
        setTimeout(() => {
          const searchInput = document.getElementById('search-header-input');
          if (searchInput) {
            searchInput.focus();
          }
        }, 50);
      });
    }

    // Search input in search screen
    const searchInput = document.getElementById('search-header-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        const query = e.target.value.trim();
        renderSearchResults(query);
      });
    }

    // Back button from search
    const backBtn = document.getElementById('back-to-seats-from-search');
    if (backBtn) {
      backBtn.addEventListener('click', () => {
        showScreen('seats');
      });
    }
  }

  // Profile tab switching
  function setupProfileTabs() {
    // Handle all profile tabs using data attributes
    const allTabs = document.querySelectorAll('.profile-tab');
    allTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');
        const profileScreen = tab.closest('.screen');

        if (profileScreen && tabName) {
          // Update tabs
          const tabs = profileScreen.querySelectorAll('.profile-tab');
          tabs.forEach(t => t.classList.remove('active'));
          tab.classList.add('active');

          // Update grids
          const grids = profileScreen.querySelectorAll('.profile-grid');
          grids.forEach(g => {
            if (g.getAttribute('data-grid') === tabName) {
              g.classList.add('active');
            } else {
              g.classList.remove('active');
            }
          });
        }
      });
    });
  }

  // Read more functionality
  function setupReadMore() {
    // Post read more buttons
    const readMoreButtons = document.querySelectorAll('.read-more');
    readMoreButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent post click from triggering
        const article = btn.closest('article');
        if (article) {
          article.classList.add('content-expanded');
        }
      });
    });

    // Profile read more buttons (handle all profile screens)
    const profileReadMoreButtons = document.querySelectorAll('.profile-read-more');
    profileReadMoreButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const profileBio = btn.previousElementSibling;
        if (profileBio) {
          profileBio.classList.add('content-expanded');
          btn.style.display = 'none';
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

    // Setup search functionality
    setupSearch();

    // Setup profile tabs
    setupProfileTabs();

    // Setup read more functionality
    setupReadMore();
  }

  // Start the app
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
