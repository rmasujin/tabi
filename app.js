// Wedding Site App - Navigation & Interactions

(function() {
  'use strict';

  // State
  let currentScreen = 'home';
  let currentSeatsView = 'map';
  let scrollPositions = {};
  let previousProfileScreen = null; // Track which profile screen we came from
  let postsData = { posts: [] }; // Will be loaded from JSON
  let profileData = {}; // Will be loaded from JSON
  let seatingData = {}; // Will be loaded from JSON

  // Get elements
  const screens = {
    home: document.getElementById('screen-home'),
    menu: document.getElementById('screen-menu'),
    seats: document.getElementById('screen-seats'),
    profileKanami: document.getElementById('screen-profile-kanami'),
    profileRiki: document.getElementById('screen-profile-riki'),
    tableDetail: document.getElementById('screen-table-detail'),
    search: document.getElementById('screen-search'),
    postDetail: document.getElementById('screen-post-detail')
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
  function showScreen(screenName, restoreScroll = false) {
    const previousScreenName = currentScreen;
    const targetScreen = screens[screenName];

    if (!targetScreen) return;

    // Save scroll position of current screen
    if (screens[previousScreenName]) {
      scrollPositions[previousScreenName] = screens[previousScreenName].scrollTop;
    }

    // For slide-in screens, keep previous screen visible during animation
    const isSlideScreen = screenName === 'profileKanami' || screenName === 'profileRiki' || screenName === 'tableDetail' || screenName === 'postDetail';
    const wasPreviousSlideScreen = previousScreenName === 'profileKanami' || previousScreenName === 'profileRiki' || previousScreenName === 'tableDetail' || previousScreenName === 'postDetail';

    // Determine if we're going "deeper" (opening detail) or "back" (closing detail)
    const isGoingDeeper = screenName === 'postDetail' && (previousScreenName === 'profileKanami' || previousScreenName === 'profileRiki');
    const isGoingBack = (screenName === 'profileKanami' || screenName === 'profileRiki') && previousScreenName === 'postDetail';

    if (isGoingDeeper) {
      // Opening post detail over profile - keep profile visible
      // Don't remove active from profile screen
    } else if (isGoingBack) {
      // Going back from post detail to profile - remove post detail active
      if (screens[previousScreenName]) {
        screens[previousScreenName].classList.remove('active');
      }
    } else if (isSlideScreen && wasPreviousSlideScreen && previousScreenName !== screenName) {
      // Other slide screen transitions
      if (screens[previousScreenName]) {
        screens[previousScreenName].classList.remove('active');
      }
    } else if (!isSlideScreen) {
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

      // Restore scroll position or scroll to top
      if (restoreScroll && scrollPositions[screenName] !== undefined) {
        targetScreen.scrollTop = scrollPositions[screenName];
      } else if (isSlideScreen) {
        // Slide screens always start at top
        targetScreen.scrollTop = 0;
      }

      // For slide-in screens, hide other screens after animation completes
      if (isSlideScreen && !wasPreviousSlideScreen) {
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
    if (screenName !== 'tableDetail' && screenName !== 'profileKanami' && screenName !== 'profileRiki' && screenName !== 'search' && screenName !== 'postDetail') {
      updateNavButtons(screenName);
      // Update URL hash
      window.location.hash = screenName;
    } else if (screenName === 'search') {
      // Keep seats button active during search
      updateNavButtons('seats');
    }
  }

  // Load posts data from JSON
  async function loadPostsData() {
    try {
      // キャッシュを回避するためタイムスタンプを追加
      const timestamp = new Date().getTime();
      const response = await fetch(`data/posts-data.json?t=${timestamp}`);
      postsData = await response.json();
      console.log('Posts data loaded:', postsData);
    } catch (error) {
      console.error('Failed to load posts data:', error);
      postsData = { posts: [] };
    }
  }

  // Load profile data from JSON
  async function loadProfileData() {
    try {
      const response = await fetch('data/profile-data.json');
      profileData = await response.json();
      console.log('Profile data loaded:', profileData);
    } catch (error) {
      console.error('Failed to load profile data:', error);
      profileData = {};
    }
  }

  // Load seating data from JSON
  async function loadSeatingData() {
    try {
      const response = await fetch('data/seating-data.json');
      seatingData = await response.json();
      console.log('Seating data loaded:', seatingData);
    } catch (error) {
      console.error('Failed to load seating data:', error);
      seatingData = {};
    }
  }

  // Update profile bio dynamically
  function updateProfileBios() {
    // Update KANAMI name (large display - use fullName if available)
    if (profileData.kanami) {
      const kanamiNameEl = document.querySelector('#screen-profile-kanami .profile-name-large');
      if (kanamiNameEl) {
        kanamiNameEl.textContent = profileData.kanami.fullName || profileData.kanami.accountName || 'KANAMI';
      }
    }

    // Update KANAMI header title (use accountName)
    if (profileData.kanami && profileData.kanami.accountName) {
      const kanamiHeaderEl = document.querySelector('#screen-profile-kanami .header-title');
      if (kanamiHeaderEl) {
        kanamiHeaderEl.textContent = profileData.kanami.accountName;
      }
    }

    // Update KANAMI avatar
    if (profileData.kanami && profileData.kanami.avatar) {
      const kanamiAvatarEl = document.querySelector('#screen-profile-kanami .profile-avatar');
      if (kanamiAvatarEl) {
        kanamiAvatarEl.style.backgroundImage = `url('${profileData.kanami.avatar}')`;
      }
    }

    // Update KANAMI bio
    if (profileData.kanami && profileData.kanami.bio) {
      const kanamiBioEl = document.querySelector('#screen-profile-kanami .profile-bio');
      const kanamiReadMoreBtn = document.querySelector('#screen-profile-kanami .profile-read-more');
      if (kanamiBioEl) {
        // 改行を<br>タグに変換
        kanamiBioEl.innerHTML = profileData.kanami.bio.replace(/\n/g, '<br>');

        // Check if content is truncated (more than 3 lines)
        // line-clamp is set to 4, so if scrollHeight > clientHeight, it means content is clamped
        if (kanamiReadMoreBtn) {
          const isTruncated = kanamiBioEl.scrollHeight > kanamiBioEl.clientHeight;
          kanamiReadMoreBtn.style.display = isTruncated ? 'flex' : 'none';
        }
      }
    }

    // Update RIKI name (large display - use fullName if available)
    if (profileData.riki) {
      const rikiNameEl = document.querySelector('#screen-profile-riki .profile-name-large');
      if (rikiNameEl) {
        rikiNameEl.textContent = profileData.riki.fullName || profileData.riki.accountName || 'RIKI';
      }
    }

    // Update RIKI header title (use accountName)
    if (profileData.riki && profileData.riki.accountName) {
      const rikiHeaderEl = document.querySelector('#screen-profile-riki .header-title');
      if (rikiHeaderEl) {
        rikiHeaderEl.textContent = profileData.riki.accountName;
      }
    }

    // Update RIKI avatar
    if (profileData.riki && profileData.riki.avatar) {
      const rikiAvatarEl = document.querySelector('#screen-profile-riki .profile-avatar');
      if (rikiAvatarEl) {
        rikiAvatarEl.style.backgroundImage = `url('${profileData.riki.avatar}')`;
      }
    }

    // Update RIKI bio
    if (profileData.riki && profileData.riki.bio) {
      const rikiBioEl = document.querySelector('#screen-profile-riki .profile-bio');
      const rikiReadMoreBtn = document.querySelector('#screen-profile-riki .profile-read-more');
      if (rikiBioEl) {
        // 改行を<br>タグに変換
        rikiBioEl.innerHTML = profileData.riki.bio.replace(/\n/g, '<br>');

        // Check if content is truncated (more than 3 lines)
        // line-clamp is set to 4, so if scrollHeight > clientHeight, it means content is clamped
        if (rikiReadMoreBtn) {
          const isTruncated = rikiBioEl.scrollHeight > rikiBioEl.clientHeight;
          rikiReadMoreBtn.style.display = isTruncated ? 'flex' : 'none';
        }
      }
    }

    // Update profile details
    updateProfileDetails('kanami');
    updateProfileDetails('riki');

    // Show dynamic content after loading
    document.querySelectorAll('.dynamic-content').forEach(el => {
      el.classList.add('loaded');
    });
  }

  // Update profile details dynamically
  function updateProfileDetails(author) {
    const detailsContainer = document.querySelector(`#screen-profile-${author} .profile-details`);
    if (!detailsContainer) return;

    const details = profileData[author]?.details || [];
    if (details.length === 0) return;

    let html = '';
    details.forEach(detail => {
      html += `
        <div class="detail-row">
          <span class="detail-label">${detail.label.toUpperCase()}</span>
          <span class="detail-value">${detail.value}</span>
        </div>
      `;
    });

    detailsContainer.innerHTML = html;
  }

  // Filter posts by criteria
  function getPostsByFilter(filterFn) {
    return postsData.posts.filter(filterFn).map(post => {
      // Get dynamic author display name from profileData
      let authorDisplayName = post.authorDisplay; // fallback to original
      if (post.author === 'kanami') {
        authorDisplayName = profileData.kanami?.accountName || 'KANAMI';
      } else if (post.author === 'riki') {
        authorDisplayName = profileData.riki?.accountName || 'RIKI';
      } else if (post.author === 'both') {
        const kanamiName = profileData.kanami?.accountName || 'KANAMI';
        const rikiName = profileData.riki?.accountName || 'RIKI';
        authorDisplayName = `${rikiName} ＋ ${kanamiName}`;
      }

      return {
        number: parseInt(post.number),
        date: post.date,
        author: authorDisplayName,
        authorType: post.author, // 'kanami', 'riki', or 'both'
        content: post.content,
        contentMore: post.contentMore || '',
        photos: post.images.length,
        hasSlider: post.images.length > 1,
        images: post.images
      };
    });
  }

  // Get posts for HOME screen
  function getHomePosts() {
    const posts = getPostsByFilter(post => post.displayIn.home);
    // Sort by date (newest first)
    return posts.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA; // Descending order
    });
  }

  // Get posts for KANAMI profile
  function getKanamiPosts() {
    const posts = getPostsByFilter(post => post.displayIn.kanamiPosts);
    return posts.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA; // Descending order
    });
  }

  // Get posts for RIKI profile
  function getRikiPosts() {
    const posts = getPostsByFilter(post => post.displayIn.rikiPosts);
    return posts.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA; // Descending order
    });
  }

  // Get favorites for KANAMI
  function getKanamiFavorites() {
    const posts = getPostsByFilter(post => post.displayIn.kanamiFavorites);
    return posts.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA; // Descending order
    });
  }

  // Get favorites for RIKI
  function getRikiFavorites() {
    const posts = getPostsByFilter(post => post.displayIn.rikiFavorites);
    return posts.sort((a, b) => {
      const dateA = new Date(a.date.replace(/\./g, '-'));
      const dateB = new Date(b.date.replace(/\./g, '-'));
      return dateB - dateA; // Descending order
    });
  }

  // Generate avatar HTML based on author
  function getAvatarHTML(authorType, isSingle = false) {
    const kanamiAvatar = profileData.kanami?.avatar || '';
    const rikiAvatar = profileData.riki?.avatar || '';

    if (authorType === 'both') {
      // Show both avatars
      const kanamiStyle = kanamiAvatar ? `style="background-image: url('${kanamiAvatar}'); background-size: cover; background-position: center;"` : '';
      const rikiStyle = rikiAvatar ? `style="background-image: url('${rikiAvatar}'); background-size: cover; background-position: center;"` : '';
      return `
        <div class="avatar-placeholder" ${kanamiStyle}></div>
        <div class="avatar-placeholder offset" ${rikiStyle}></div>
      `;
    } else if (authorType === 'kanami') {
      const style = kanamiAvatar ? `style="background-image: url('${kanamiAvatar}'); background-size: cover; background-position: center;"` : '';
      return `<div class="avatar-placeholder${isSingle ? ' single' : ''}" ${style}></div>`;
    } else if (authorType === 'riki') {
      const style = rikiAvatar ? `style="background-image: url('${rikiAvatar}'); background-size: cover; background-position: center;"` : '';
      return `<div class="avatar-placeholder${isSingle ? ' single' : ''}" ${style}></div>`;
    }
    return '<div class="avatar-placeholder"></div>';
  }

  // Render a single post HTML
  function renderPost(post, displayNumber) {
    const hasMore = post.contentMore ? true : false;
    const readMoreHTML = hasMore ? '<div class="read-more">続きを読む</div>' : '';
    // 改行を<br>タグに変換
    const content = post.content.replace(/\n/g, '<br>');
    const contentMore = post.contentMore ? post.contentMore.replace(/\n/g, '<br>') : '';
    const contentMoreHTML = hasMore ? `<span class="content-more">${contentMore}</span>` : '';

    if (post.hasSlider) {
      // Generate slider images
      const sliderImagesHTML = post.images.map((imagePath, idx) =>
        `<div class="post-image-placeholder">
          <img src="${imagePath}" alt="photo ${idx + 1}">
          <span class="placeholder-text" style="display: none;">photo ${idx + 1} — 4:5</span>
        </div>`
      ).join('');

      // Generate pagination dots
      const dotsHTML = post.images.map((_, idx) =>
        `<span class="dot${idx === 0 ? ' active' : ''}" data-index="${idx}"></span>`
      ).join('');

      return `
        <article class="post" data-post-id="${post.number}">
          <div class="post-header">
            <span class="post-number">${String(displayNumber).padStart(2, '0')}</span>
            <span class="post-date">${post.date}</span>
          </div>
          <div class="post-slider" data-post-id="${post.number}">
            <div class="slider-container">
              <div class="slider-track">
                ${sliderImagesHTML}
              </div>
            </div>
            <div class="gradient-overlay"></div>
            <div class="post-authors" data-author="${post.authorType}" style="cursor: pointer;">
              ${getAvatarHTML(post.authorType, true)}
              <span class="author-names">${post.author}</span>
            </div>
          </div>
          <div class="post-meta">
            <span class="photo-count">${post.photos} PHOTOS</span>
            <div class="pagination-dots" data-post-id="${post.number}">
              ${dotsHTML}
            </div>
          </div>
          <div class="post-content">
            ${content}${contentMoreHTML}
          </div>
          ${readMoreHTML}
        </article>
      `;
    } else {
      // Single image post
      return `
        <article class="post" data-post-id="${post.number}">
          <div class="post-header">
            <span class="post-number">${String(displayNumber).padStart(2, '0')}</span>
            <span class="post-date">${post.date}</span>
          </div>
          <div class="post-image-placeholder">
            <img src="${post.images[0]}" alt="photo">
            <span class="placeholder-text" style="display: none;">photo — 4:5</span>
            <div class="gradient-overlay"></div>
            <div class="post-authors" data-author="${post.authorType}" style="cursor: pointer;">
              ${getAvatarHTML(post.authorType, true)}
              <span class="author-names">${post.author}</span>
            </div>
          </div>
          <div class="post-meta">
            <span class="photo-count">${post.photos} PHOTO${post.photos > 1 ? 'S' : ''}</span>
          </div>
          <div class="post-content">
            ${content}${contentMoreHTML}
          </div>
          ${readMoreHTML}
        </article>
      `;
    }
  }

  // Show post detail - now shows all posts in the collection
  function showPostDetail(postNumber, postType = 'posts', author = 'kanami') {
    const postDetailTitle = document.getElementById('post-detail-title');
    const postDetailCount = document.getElementById('post-detail-count');
    const postDetailContent = document.getElementById('post-detail-content');

    // Store which profile we came from
    if (author === 'riki') {
      previousProfileScreen = 'profileRiki';
    } else {
      previousProfileScreen = 'profileKanami';
    }

    // Determine which post collection to use
    let posts = [];
    let titleText = '';

    if (postType === 'favorites') {
      posts = author === 'riki' ? getRikiFavorites() : getKanamiFavorites();
      titleText = 'FAVORITES';
    } else {
      posts = author === 'riki' ? getRikiPosts() : getKanamiPosts();
      titleText = 'POSTS';
    }

    if (postDetailTitle) {
      postDetailTitle.textContent = titleText;
    }

    if (postDetailCount) {
      postDetailCount.textContent = `${posts.length} ${titleText}`;
    }

    // Render all posts (same structure as HOME screen)
    if (postDetailContent) {
      const contentHTML = posts.map((post, index) => renderPost(post, index + 1)).join('') + '<div class="bottom-spacer"></div>';
      postDetailContent.innerHTML = contentHTML;

      // Re-initialize post sliders for the dynamically added content
      setTimeout(() => {
        initPostSliders();
        setupReadMore();
      }, 100);

      // Scroll to the clicked post
      setTimeout(() => {
        const targetPost = postDetailContent.querySelector(`article[data-post-id="${postNumber}"]`);
        if (targetPost) {
          const postDetailScreen = document.getElementById('screen-post-detail');
          if (postDetailScreen) {
            const headerHeight = 50; // Header height
            const targetPosition = targetPost.offsetTop - headerHeight;
            postDetailScreen.scrollTop = targetPosition;
          }
        }
      }, 150);
    }

    showScreen('postDetail');
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
    if (seatsInfo) seatsInfo.textContent = `${table.guests.length} SEATS`;
    if (tableDescription) tableDescription.textContent = table.category;

    // Hide table photos area
    const tablePhotos = document.querySelector('.table-photos');
    const tablePhotoMeta = document.querySelector('.table-photo-meta');
    if (tablePhotos) {
      tablePhotos.style.display = 'none';
    }
    if (tablePhotoMeta) {
      tablePhotoMeta.style.display = 'none';
    }

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
        // For odd number of seats, offset by half a seat angle so no seat is at 12 o'clock
        const angleStep = 360 / guestCount;
        const angleOffset = guestCount % 2 === 1 ? angleStep / 2 : 0;
        const angle = angleStep * index + angleOffset;
        const radius = 85;
        const x = 107 + radius * Math.sin(angle * Math.PI / 180);
        const y = 115 - radius * Math.cos(angle * Math.PI / 180);

        // Highlight selected guest from search
        const isHighlighted = selectedGuestForHighlight && guest.id === selectedGuestForHighlight;
        const highlightStyle = isHighlighted ? 'background:#0A0A0A; color:#fff; border-color:#0A0A0A;' : '';

        // Use sequential numbering (1, 2, 3...) instead of original seat numbers
        seatsHTML += `<div class="seat-position" style="left:${x}px; top:${y}px; ${highlightStyle}">${index + 1}</div>`;
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
        const relation = guest.relation ? `<span class="guest-role">${guest.relation}</span>` : '';
        const isHighlighted = selectedGuestForHighlight && guest.id === selectedGuestForHighlight;
        const highlightStyle = isHighlighted ? ' style="font-weight: 700;"' : '';
        const guestHTML = `
          <div class="guest-item"${highlightStyle}>
            <span class="seat-number">${index + 1}</span>
            <span class="guest-name">${guest.name}${honorific}</span>
            ${relation}
          </div>
        `;
        guestList.insertAdjacentHTML('beforeend', guestHTML);
      });
    }
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
    backToSeatsBtn.addEventListener('click', () => {
      showScreen('seats', true); // Restore scroll position
    });
  }

  const backToHomeBtns = document.querySelectorAll('.back-to-home');
  backToHomeBtns.forEach(btn => {
    btn.addEventListener('click', () => showScreen('home', true)); // Restore scroll position
  });

  // Use event delegation for back to profile button
  document.addEventListener('click', (e) => {
    const backBtn = e.target.closest('.back-to-profile');
    if (backBtn) {
      console.log('Back to profile button clicked!');
      console.log('previousProfileScreen:', previousProfileScreen);
      console.log('currentScreen:', currentScreen);
      e.preventDefault();
      e.stopPropagation();
      // Go back to the profile screen we came from
      if (previousProfileScreen) {
        console.log('Going back to:', previousProfileScreen);
        showScreen(previousProfileScreen, true);
      } else {
        console.log('No previous profile, going to profileKanami');
        showScreen('profileKanami', true);
      }
    }
  });

  // Event listeners - Posts (click to show profile)
  const posts = document.querySelectorAll('.post');
  posts.forEach(post => {
    // Don't navigate when clicking on slider (but allow clicks on .post-authors)
    const slider = post.querySelector('.slider-container');
    if (slider) {
      slider.addEventListener('click', (e) => {
        // Allow clicks on post-authors to pass through
        if (!e.target.closest('.post-authors')) {
          e.stopPropagation();
        }
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

      // Reset scroll position to start immediately and after images load
      container.scrollLeft = 0;

      // Also reset after a brief delay to ensure images have loaded
      setTimeout(() => {
        container.scrollLeft = 0;
      }, 50);

      let isScrolling = false;

      container.addEventListener('scroll', () => {
        if (isScrolling) return;

        isScrolling = true;
        requestAnimationFrame(() => {
          const scrollLeft = container.scrollLeft;
          const width = container.clientWidth;
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

    // Get all guests and sort alphabetically by kana
    const guests = getAllGuests();
    guests.sort((a, b) => a.kana.localeCompare(b.kana, 'ja'));

    // Render all guests
    guests.forEach(guest => {
      const honorific = guest.honorific || '';
      const itemHTML = `
        <div class="guest-list-item" data-table-id="${guest.tableId}" data-guest-id="${guest.id}">
          <div class="guest-list-info">
            <div class="guest-list-name">${guest.name}${honorific}</div>
            <div class="guest-list-relation">${guest.relation}</div>
          </div>
          <div class="guest-list-table">${guest.tableLabel} — ${guest.seatIndex}</div>
        </div>
      `;
      tableListContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Add click handlers
    const guestItems = tableListContainer.querySelectorAll('.guest-list-item');
    guestItems.forEach(item => {
      item.addEventListener('click', () => {
        const tableId = item.getAttribute('data-table-id');
        const guestId = item.getAttribute('data-guest-id');
        selectedGuestForHighlight = guestId;
        showTableDetail(tableId);
      });
    });
  }

  // Search functionality
  let selectedGuestForHighlight = null;

  function showSearch() {
    selectedGuestForHighlight = null;
    showScreen('search');
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

    // Clear results if no query
    if (!query) {
      resultsContainer.innerHTML = '';
      resultsCount.textContent = '';
      return;
    }

    let guests = getAllGuests();

    // Filter by query
    const queryKatakana = hiraganaToKatakana(query);
    guests = guests.filter(guest =>
      guest.name.includes(query) ||
      guest.kana.includes(query) ||
      guest.kana.includes(queryKatakana)
    );

    // Update count
    const countText = `${guests.length} RESULT${guests.length !== 1 ? 'S' : ''}`;
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

        // For iOS Safari: Show search screen SYNCHRONOUSLY before calling focus()
        // iOS requires the input element to be visible when focus() is called
        selectedGuestForHighlight = null;

        // Hide all other screens immediately
        Object.values(screens).forEach(screen => {
          screen.classList.remove('active');
        });

        // Show search screen synchronously (no requestAnimationFrame)
        const searchScreen = screens['search'];
        if (searchScreen) {
          searchScreen.classList.add('active');
          currentScreen = 'search';
        }

        // Update nav buttons
        updateNavButtons('seats');

        // Clear search results
        renderSearchResults('');

        // NOW focus the input (it's visible)
        const searchInput = document.getElementById('search-header-input');
        if (searchInput) {
          searchInput.removeAttribute('readonly');
          searchInput.value = '';
          searchInput.focus();
        }
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
        // Restore readonly attribute for iOS workaround
        const searchInput = document.getElementById('search-header-input');
        if (searchInput) {
          searchInput.setAttribute('readonly', 'readonly');
        }
        showScreen('seats', true); // Restore scroll position
      });
    }
  }

  // Profile tab switching
  // Profile tabs removed - now only showing POSTS
  // function setupProfileTabs() {
  //   const allTabs = document.querySelectorAll('.profile-tab');
  //   allTabs.forEach(tab => {
  //     tab.addEventListener('click', () => {
  //       const tabName = tab.getAttribute('data-tab');
  //       const profileScreen = tab.closest('.screen');
  //       if (profileScreen && tabName) {
  //         const tabs = profileScreen.querySelectorAll('.profile-tab');
  //         tabs.forEach(t => t.classList.remove('active'));
  //         tab.classList.add('active');
  //         const grids = profileScreen.querySelectorAll('.profile-grid');
  //         grids.forEach(g => {
  //           if (g.getAttribute('data-grid') === tabName) {
  //             g.classList.add('active');
  //           } else {
  //             g.classList.remove('active');
  //           }
  //         });
  //       }
  //     });
  //   });
  // }

  function setupMenuTabs() {
    // Handle menu tabs (COURSE / DRINK)
    const menuTabs = document.querySelectorAll('.menu-tab');
    menuTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const tabName = tab.getAttribute('data-tab');

        // Update tabs
        menuTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        // Update content
        const contents = document.querySelectorAll('.menu-content');
        contents.forEach(c => {
          if (c.getAttribute('data-content') === tabName) {
            c.classList.add('active');
          } else {
            c.classList.remove('active');
          }
        });
      });
    });
  }

  // Profile grid item clicks
  function setupProfileGrids() {
    const gridItems = document.querySelectorAll('.grid-item');
    gridItems.forEach(item => {
      item.addEventListener('click', () => {
        const grid = item.closest('.profile-grid');
        const profileScreen = item.closest('.screen');
        const postId = item.getAttribute('data-post-id');

        if (grid && profileScreen && postId) {
          const gridType = grid.getAttribute('data-grid'); // 'posts' or 'favorites'
          const author = profileScreen.id.includes('riki') ? 'riki' : 'kanami';

          showPostDetail(parseInt(postId), gridType, author);
        }
      });
      item.style.cursor = 'pointer';
    });
  }

  // Setup post author click to navigate to profile
  function setupPostAuthorClicks() {
    const postAuthors = document.querySelectorAll('.post-authors[data-author]');
    postAuthors.forEach(authorEl => {
      authorEl.addEventListener('click', (e) => {
        e.stopPropagation();
        const authorType = authorEl.getAttribute('data-author');

        // Navigate to appropriate profile screen
        if (authorType === 'kanami') {
          showScreen('profileKanami');
        } else if (authorType === 'riki') {
          showScreen('profileRiki');
        } else if (authorType === 'both') {
          // For 'both', default to KANAMI profile
          showScreen('profileKanami');
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

  // Render HOME screen posts
  function renderHomePosts() {
    const homePostsContainer = document.querySelector('#screen-home .content');
    if (!homePostsContainer) return;

    const posts = getHomePosts();
    const contentHTML = posts.map((post, index) => renderPost(post, index + 1)).join('') + '<div class="bottom-spacer"></div>';
    homePostsContainer.innerHTML = contentHTML;

    // Re-initialize sliders and event listeners for newly rendered posts
    initPostSliders();
    setupReadMore();
    setupPostAuthorClicks();

    // Show content after loading
    homePostsContainer.classList.add('loaded');
  }

  // Render profile grid
  function renderProfileGrid(author, gridType) {
    const screenId = author === 'riki' ? 'screen-profile-riki' : 'screen-profile-kanami';
    const grid = document.querySelector(`#${screenId} .profile-grid[data-grid="${gridType}"]`);
    if (!grid) return;

    let posts = [];
    if (gridType === 'posts') {
      posts = author === 'riki' ? getRikiPosts() : getKanamiPosts();
    } else if (gridType === 'favorites') {
      posts = author === 'riki' ? getRikiFavorites() : getKanamiFavorites();
    }

    if (posts.length === 0) {
      // 投稿が0件の場合はグリッドを非表示
      grid.style.display = 'none';
      grid.innerHTML = '';
      return;
    }

    // 投稿がある場合はグリッドを表示
    grid.style.display = '';

    const gridHTML = posts.map((post, index) => `
      <div class="grid-item" data-post-id="${post.number}">
        <div class="grid-image" style="background-image: url('${post.images[0]}');">
          <span class="grid-number">${String(index + 1).padStart(2, '0')}</span>
        </div>
      </div>
    `).join('');

    grid.innerHTML = gridHTML;
  }

  // Render all profile grids
  function renderAllProfileGrids() {
    renderProfileGrid('kanami', 'posts');
    renderProfileGrid('kanami', 'favorites');
    renderProfileGrid('riki', 'posts');
    renderProfileGrid('riki', 'favorites');

    // Re-setup grid click events after rendering
    setupProfileGrids();
  }

  // Initialize from URL hash
  async function init() {
    // Load all data first
    await loadPostsData();
    await loadProfileData();
    await loadSeatingData();

    // Render dynamic content
    renderHomePosts();
    renderAllProfileGrids();
    updateProfileBios();

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

    // Profile tabs removed - now only showing POSTS
    // setupProfileTabs();

    // Setup menu tabs
    setupMenuTabs();

    // Setup profile grids
    setupProfileGrids();

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
