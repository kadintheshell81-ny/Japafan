import { supabaseService } from './supabase-client.js';

import {
  initAOS,
  animateCardGrid,
  animateHeroEntrance,
  initCardTilt,
  initScrollRevealSections,
  initStarfield,
  animateTabSwitch,
  pulseElement,
} from './src/animations.js';


/* ==========================================================================
   JAPAFAN APPLICATION ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 0. SECURITY & UTILITY HELPERS
  // ==========================================================================

  /**
   * safeText — Sets an element's text content safely, preventing XSS.
   * NEVER use innerHTML with user-controlled data. Use this instead.
   * @param {HTMLElement} el
   * @param {string} text
   */
  function safeText(el, text) {
    el.textContent = String(text ?? '');
    return el;
  }

  /**
   * debounce — Limits how often a function fires.
   * Used to throttle Jikan API search calls to prevent HTTP 429 rate-limit errors.
   * @param {Function} fn
   * @param {number} delay - milliseconds
   */
  function debounce(fn, delay) {
    let timer;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  // ==========================================================================
  // 0A. ANIMATION INIT (Runs on first load)
  // ==========================================================================

  // Init AOS scroll reveals (all data-aos elements)
  initAOS();

  // Starfield particles on hero
  initStarfield('hero-particles');

  // Hero text entrance sequence
  setTimeout(() => animateHeroEntrance(), 100);

  // Section heading scroll reveals
  setTimeout(() => initScrollRevealSections(), 200);

  // ==========================================================================
  // 0B. UTILITY: RELATIVE TIMESTAMPS
  // ==========================================================================

  /**
   * timeAgo — Returns human-readable relative timestamp.
   * "just now" / "5m ago" / "3h ago" / "2 days ago" / "May 12"
   */
  function timeAgo(date) {
    const now = Date.now();
    const d   = date instanceof Date ? date : new Date(date);
    const sec = Math.floor((now - d.getTime()) / 1000);
    if (sec < 60)               return 'just now';
    if (sec < 3600)             return `${Math.floor(sec / 60)}m ago`;
    if (sec < 86400)            return `${Math.floor(sec / 3600)}h ago`;
    if (sec < 604800)           return `${Math.floor(sec / 86400)} days ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // ==========================================================================
  // 1. DATA STATE & CONFIGURATION
  // ==========================================================================

  // Pre-seeded local fallback anime data in case of API failure / rate limits
  const LOCAL_FALLBACK_ANIME = [
    {
      mal_id: 1535,
      title: "Death Note",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/9/9453l.jpg" } },
      score: 8.62,
      rank: 29,
      type: "TV",
      episodes: 37,
      status: "Finished Airing",
      genres: [{ name: "Mystery" }, { name: "Supernatural" }, { name: "Suspense" }],
      synopsis: "A shinigami, as a god of death, can kill any person—provided they see their victim's face and write their victim's name in a notebook called a Death Note. One day, Ryuk, bored by the shinigami lifestyle and interested in seeing how a human would use a Death Note, drops one into the human realm. High school student Light Yagami finds it and tests the deadly notebook by writing a criminal's name in it. When the criminal dies immediately, Light is greatly surprised and quickly recognizes the devastating power that has fallen into his hands.",
      trailer: { embed_url: "https://www.youtube.com/embed/NlJZ-YgAt-c" }
    },
    {
      mal_id: 16498,
      title: "Attack on Titan Season 2",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/4/84177l.jpg" } },
      score: 8.50,
      rank: 112,
      type: "TV",
      episodes: 12,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Drama" }, { name: "Fantasy" }, { name: "Suspense" }],
      synopsis: "For centuries, humanity has been hunted by giant, mindless predators known as Titans. Eren Yeager joins the Scout Regiment to eradicate them all after seeing his mother eaten. Alongside his friends Mikasa and Armin, Eren fights to recover their world, only to discover deep conspiracies regarding the origins of the Titans and his own mysterious powers.",
      trailer: { embed_url: "https://www.youtube.com/embed/z5Dq7_bM5bY" }
    },
    {
      mal_id: 5114,
      title: "Fullmetal Alchemist: Brotherhood",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1223/96541l.jpg" } },
      score: 9.10,
      rank: 1,
      type: "TV",
      episodes: 64,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Drama" }, { name: "Fantasy" }],
      synopsis: "After a horrific alchemy experiment goes wrong in the Elric household, brothers Edward and Alphonse are left in catastrophic states. With his military alchemist status, Edward searches for the Philosopher's Stone alongside his brother to restore their bodies, uncovering a nationwide conspiracy that threatens the lives of millions.",
      trailer: { embed_url: "https://www.youtube.com/embed/2uq34TeWEdQ" }
    },
    {
      mal_id: 20,
      title: "Naruto",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/13/11171l.jpg" } },
      score: 7.99,
      rank: 660,
      type: "TV",
      episodes: 220,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
      synopsis: "Moments before Naruto Uzumaki's birth, a huge demon known as the Nine-Tailed Fox attacked Konoha, the Hidden Leaf Village. In order to save the village, the leader, the Fourth Hokage, sealed the beast inside Naruto. Now, Naruto is a hyperactive ninja trying to gain the respect of his village and fulfill his ultimate dream of becoming the Hokage.",
      trailer: { embed_url: "https://www.youtube.com/embed/-G9BqkgZXRA" }
    },
    {
      mal_id: 11061,
      title: "Hunter x Hunter (2011)",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1337/99013l.jpg" } },
      score: 9.04,
      rank: 9,
      type: "TV",
      episodes: 148,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Adventure" }, { name: "Fantasy" }],
      synopsis: "Gon Freecss aspires to become a Hunter, an exceptional individual licensed to track down secret treasures, rare beasts, and even other individuals. Gon departs on a journey to pass the rigorous Hunter Exam and find his long-lost father, making lifelong companions like Killua, Kurapika, and Leorio along the way.",
      trailer: { embed_url: "https://www.youtube.com/embed/d6kBeJjR070" }
    },
    {
      mal_id: 199,
      title: "Spirited Away",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/6/79593l.jpg" } },
      score: 8.78,
      rank: 45,
      type: "Movie",
      episodes: 1,
      status: "Finished Airing",
      genres: [{ name: "Adventure" }, { name: "Drama" }, { name: "Supernatural" }],
      synopsis: "Stubborn, spoiled, and naive, 10-year-old Chihiro Ogino is less than thrilled when she and her parents discover an abandoned amusement park. After her parents undergo a mysterious transformation into pigs, she must work in a magical bathhouse for spirits to secure their freedom and return to the human world.",
      trailer: { embed_url: "https://www.youtube.com/embed/ByXuk9QqQkk" }
    },
    {
      mal_id: 40748,
      title: "Jujutsu Kaisen",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1171/109222l.jpg" } },
      score: 8.63,
      rank: 75,
      type: "TV",
      episodes: 24,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Fantasy" }],
      synopsis: "Idly indulging in baseless supernatural activities with the Occult Club, high schooler Yuuji Itadori spends his days at either the clubroom or the hospital. However, his life takes a drastic turn when he encounters a cursed object and swallows a finger belonging to the legendary curse Ryomen Sukuna.",
      trailer: { embed_url: "https://www.youtube.com/embed/PkzL761g1Lo" }
    },
    {
      mal_id: 38000,
      title: "Demon Slayer: Kimetsu no Yaiba",
      images: { jpg: { large_image_url: "https://cdn.myanimelist.net/images/anime/1919/104126l.jpg" } },
      score: 8.47,
      rank: 135,
      type: "TV",
      episodes: 26,
      status: "Finished Airing",
      genres: [{ name: "Action" }, { name: "Fantasy" }, { name: "Supernatural" }],
      synopsis: "Ever since the death of his father, the burden of supporting the family has fallen upon Tanjirou Kamado. Though living impoverished on a remote mountain, the Kamado family is able to enjoy a relatively peaceful life. One day, Tanjirou decides to go down to the local village to make a little money, only to return to find his family slaughtered and his sister Nezuko turned into a demon.",
      trailer: { embed_url: "https://www.youtube.com/embed/6vMuWuWlW4I" }
    }
  ];

  // Prepopulated community fan profiles
  const COMMUNITY_FANS = [
    {
      id: "sakurachan",
      name: "SakuraChan 🌸",
      avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=SakuraChan&backgroundColor=ff007f",
      level: "Lv.5 Sensei",
      bio: "Romance & Slice of life enthusiast! Wholesome stories make my heart melt. Standard manga collector.",
      favoriteGenres: ["Romance", "Slice of Life", "Comedy"],
      topAnime: ["Spirited Away", "Naruto"],
      chatStyle: "wholesome",
      responses: {
        recommend: "Oh! You should definitely check out Spirited Away or Horimiya! They are absolute masterpieces! 💖",
        general: "Haii! Welcome to the lobby! Hope everyone is having a wonderful day talking about anime! ✨",
        romance: "Aaaah! Romance anime are my absolute favorite! The feels, the tears! 😭💕",
        fallback: "That sounds so interesting! I'll have to add that to my watch list! Double tab! 😍"
      }
    },
    {
      id: "gokustan",
      name: "GokuStan ⚡",
      avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=GokuStan&backgroundColor=00f0ff",
      level: "Lv.4 Elite",
      bio: "Shonen fights are my oxygen! Power scaling is a science. If it doesn't have training arcs, I'm out.",
      favoriteGenres: ["Action", "Adventure", "Fantasy"],
      topAnime: ["Naruto", "Fullmetal Alchemist: Brotherhood", "Jujutsu Kaisen"],
      chatStyle: "hype",
      responses: {
        recommend: "If you want absolute hype battles, go watch Jujutsu Kaisen or Hunter x Hunter right now! Insane fights!",
        general: "What's up warriors! Who is ready to discuss the strongest characters today? Naruto vs Luffy?! Let's go!",
        shonen: "Shonen actions are the peak of fiction! Nothing compares to a main character screaming and powering up!",
        fallback: "Sounds cool, but can they beat Goku though? Just saying, Goku soloes!"
      }
    },
    {
      id: "lelouchfan",
      name: "CodeGeassEnjoyer 👁️",
      avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lelouch&backgroundColor=8a2be2",
      level: "Lv.6 Sage",
      bio: "All hail Lelouch! Thriller, mind games, and deep philosophical stories only. Death Note is my holy book.",
      favoriteGenres: ["Mystery", "Thriller", "Supernatural"],
      topAnime: ["Death Note", "Fullmetal Alchemist: Brotherhood"],
      chatStyle: "intellectual",
      responses: {
        recommend: "If you seek complex mental warfare and moral grayness, you must watch Death Note immediately.",
        general: "A warm greeting. I am always looking for shows that challenge intellectual boundaries. Any suggestions?",
        mystery: "Mystery and psychological warfare are the only genres that truly captivate the human intellect. Lelouch proves this.",
        fallback: "An intriguing choice. However, does it possess a satisfying intellectual climax, or is it merely standard tropes?"
      }
    },
    {
      id: "cybernneko",
      name: "CyberNeko 🐾",
      avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CyberNeko&backgroundColor=39ff14",
      level: "Lv.3 Adventurer",
      bio: "Sci-Fi fan, mecha geek, and retro cyberpunk aesthetic lover. Let's talk about the future!",
      favoriteGenres: ["Sci-Fi", "Action", "Supernatural"],
      topAnime: ["Attack on Titan Season 2", "Jujutsu Kaisen"],
      chatStyle: "gamer",
      responses: {
        recommend: "Check out Cyberpunk Edgerunners or Evangelion. Absolute cyber vibes! 🤖",
        general: "Meow! System online! Ready to chat about mecha and retro sci-fi! 👾",
        scifi: "Sci-fi is awesome because it shows us what the future might look like. Tech is cool! ⚡",
        fallback: "Hmm, sounds okay, but does it have cool robots or neon cities? That's what I live for! 🐾"
      }
    }
  ];

  // App Central State Object
  const state = {
    user: {
      username: "OtakuGamer",
      avatarSeed: "JapaFanUser",
      bio: "Living in a simulation. Searching for the ultimate episode.",
      favoriteGenres: ["Action", "Adventure", "Fantasy"],
      level: "Lv.3 Sage"
    },
    // Top 5 anime selection: mapping rank index (1 to 5) to anime details (or null)
    tierList: {
      1: null,
      2: null,
      3: null,
      4: null,
      5: null
    },
    // User written reflections for each tier rank
    tierNotes: {
      1: "",
      2: "",
      3: "",
      4: "",
      5: ""
    },
    // Shelved inventory of searched anime ready to rank
    inventory: [],
    // Dynamic discussion comments left on specific anime mal_id
    animeComments: {},
    // Active channel chats
    chatLogs: {
      general: [
        { sender: "SakuraChan 🌸", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=SakuraChan&backgroundColor=ff007f", message: "Haii everyone! Welcome! Has anyone watched the latest season of Demon Slayer?", time: "20:41", self: false },
        { sender: "GokuStan ⚡", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=GokuStan&backgroundColor=00f0ff", message: "Bro, the animation in Demon Slayer is insane! But the storyline in Hunter x Hunter is still king.", time: "20:42", self: false },
        { sender: "CodeGeassEnjoyer 👁️", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=Lelouch&backgroundColor=8a2be2", message: "Animation is merely paint. It is the tactical brilliance of the script that counts. That is why Death Note remains unmatched.", time: "20:42", self: false }
      ],
      shonen: [
        { sender: "GokuStan ⚡", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=GokuStan&backgroundColor=00f0ff", message: "Power scaling time! Naruto Sage Mode vs Luffy Gear 4. Who takes it?", time: "20:30", self: false },
        { sender: "CyberNeko 🐾", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=CyberNeko&backgroundColor=39ff14", message: "Naruto takes it speed-wise, but Gear 4 has insane bounce and durability! 🥊", time: "20:32", self: false }
      ],
      romance: [
        { sender: "SakuraChan 🌸", avatar: "https://api.dicebear.com/7.x/bottts-neutral/svg?seed=SakuraChan&backgroundColor=ff007f", message: "Kimi ni Todoke is so wholesome! I literally cried three times during the confession scene! 😭❤️", time: "20:15", self: false }
      ]
    },
    activeChannel: "general",
    apiCache: {}
  };

  // Local storage prefix
  const STORAGE_KEY = "japafan_app_state";

  // Load state from local storage if exists
  function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.user) state.user = parsed.user;
        if (parsed.tierList) state.tierList = parsed.tierList;
        if (parsed.tierNotes) state.tierNotes = parsed.tierNotes;
        if (parsed.inventory) state.inventory = parsed.inventory;
        if (parsed.animeComments) state.animeComments = parsed.animeComments;
        if (parsed.chatLogs) state.chatLogs = parsed.chatLogs;
        if (parsed.notifications) state.notifications = parsed.notifications;
      } catch (e) {
        console.error("Error loading local storage state: ", e);
      }
    } else {
      // Default seed inventory with some cool titles from fallbacks
      state.inventory = [
        LOCAL_FALLBACK_ANIME[0], // Death Note
        LOCAL_FALLBACK_ANIME[3]  // Naruto
      ];
    }
  }

  // Save current state to local storage
  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      user: state.user,
      tierList: state.tierList,
      tierNotes: state.tierNotes,
      inventory: state.inventory,
      animeComments: state.animeComments,
      chatLogs: state.chatLogs,
      notifications: state.notifications
    }));
  }

  loadState();

  // ==========================================================================
  // 2. DOM SELECTIONS
  // ==========================================================================

  // Tab Shell elements
  const navTabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');

  // Search Discover elements
  const searchInput = document.getElementById('anime-search-input');
  const searchDropdown = document.getElementById('search-results-dropdown');
  const clearSearchBtn = document.getElementById('clear-search-btn');
  const discoverGrid = document.getElementById('discover-anime-grid');
  const catalogLoader = document.getElementById('catalog-loader');
  const activityFeed = document.getElementById('activity-feed');
  const filterPills = document.querySelectorAll('.filter-pill');

  // Ranker page elements
  const dropZones = document.querySelectorAll('.tier-dropzone');
  const noteInputs = document.querySelectorAll('.tier-note-input');
  const inventorySearch = document.getElementById('inventory-search-input');
  const inventoryDropdown = document.getElementById('inventory-search-dropdown');
  const inventoryShelf = document.getElementById('inventory-shelf');
  const exportBadgeBtn = document.getElementById('export-badge-btn');

  // Matchmaker page elements
  const matchmakerUserAvatar = document.getElementById('matchmaker-user-avatar');
  const matchmakerUserName = document.getElementById('matchmaker-user-name');
  const matchmakerUserLevel = document.getElementById('matchmaker-user-level');
  const userTopListSummary = document.getElementById('user-top-list-summary');
  const userGenresSummary = document.getElementById('user-genres-summary');
  const matchesGrid = document.getElementById('matches-grid');
  const refreshMatchesBtn = document.getElementById('refresh-matches-btn');

  // Chat lobby elements
  const channelButtons = document.querySelectorAll('.channel-item');
  const chatMessagesStream = document.getElementById('chat-messages-stream');
  const chatMessageForm = document.getElementById('chat-message-form');
  const chatMessageInput = document.getElementById('chat-message-input');
  const currentChannelTitle = document.getElementById('current-channel-title');
  const currentChannelDesc = document.getElementById('current-channel-desc');
  const chatTypingIndicator = document.getElementById('chat-typing-indicator');
  const typingUserText = chatTypingIndicator.querySelector('.typing-user-text');
  const chatUnreadBadge = document.getElementById('chat-unread');

  // Profile modal settings elements
  const openProfileBtn = document.getElementById('open-profile-btn');
  const chatFooterProfileBtn = document.getElementById('chat-footer-profile-trigger');
  const profileModal = document.getElementById('profile-modal');
  const closeProfileBtn = document.getElementById('close-profile-btn');
  const cancelProfileBtn = document.getElementById('cancel-profile-btn');
  const profileForm = document.getElementById('profile-edit-form');
  const avatarGridPicker = document.getElementById('avatar-grid-picker');
  const selectedAvatarSeed = document.getElementById('selected-avatar-seed');
  const profileUsernameInput = document.getElementById('profile-username');
  const profileBioInput = document.getElementById('profile-bio');
  const profileGenresPicker = document.getElementById('profile-genres-picker');

  // Details Modal elements
  const detailsModal = document.getElementById('details-modal');
  const closeDetailsBtn = document.getElementById('close-details-btn');
  const detailsModalContent = document.getElementById('details-modal-content');

  // Export Modal elements
  const exportModal = document.getElementById('export-modal');
  const closeExportBtn = document.getElementById('close-export-btn');
  const otakuCardExport = document.getElementById('otaku-card-export');
  const copyBadgeCodeBtn = document.getElementById('copy-badge-code-btn');
  const downloadBadgeBtn = document.getElementById('download-badge-btn');

  // Toast Container
  const toastContainer = document.getElementById('toast-container');

  // Global details
  const headerAvatar = document.getElementById('header-avatar');
  const headerUsername = document.getElementById('header-username');
  const chatFooterAvatar = document.getElementById('chat-footer-avatar');
  const chatFooterUsername = document.getElementById('chat-footer-username');


  // ==========================================================================
  // 3. HELPER UTILITIES & UI ALERTS
  // ==========================================================================

  // Rich toast notification system with icons, types, close button
  const TOAST_ICONS = { success: '✓', error: '✕', warning: '⚠', info: '⚡', xp: '⚡' };
  const TOAST_DURATIONS = { success: 3000, error: 5000, warning: 0, info: 3500, xp: 2500 };

  function showToast(message, type = 'info') {
    if (!toastContainer) return;

    // Cap at 3 visible toasts
    while (toastContainer.children.length >= 3) {
      toastContainer.firstChild.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast-message toast-${type}`;

    const icon = document.createElement('span');
    icon.className = 'toast-icon';
    icon.textContent = TOAST_ICONS[type] || '⚡';

    const msg = document.createElement('span');
    msg.className = 'toast-text';
    safeText(msg, message);

    const closeBtn = document.createElement('button');
    closeBtn.className = 'toast-close';
    closeBtn.textContent = '×';
    closeBtn.setAttribute('aria-label', 'Dismiss');

    toast.appendChild(icon);
    toast.appendChild(msg);
    toast.appendChild(closeBtn);
    toastContainer.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => toast.classList.add('toast-visible'));

    function dismiss() {
      toast.classList.remove('toast-visible');
      toast.classList.add('toast-exit');
      setTimeout(() => toast.remove(), 350);
    }

    closeBtn.addEventListener('click', dismiss);

    const duration = TOAST_DURATIONS[type];
    if (duration > 0) setTimeout(dismiss, duration);
  }

  // Update overall profile visual indicators globally
  function updateGlobalProfileUI() {
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed}&backgroundColor=ff007f`;
    
    // Header
    headerAvatar.src = avatarUrl;
    headerUsername.textContent = state.user.username;
    
    // Chat Sidebar Footer
    chatFooterAvatar.src = avatarUrl;
    chatFooterUsername.textContent = state.user.username;

    // Matchmaker Summary
    if (matchmakerUserAvatar) {
      matchmakerUserAvatar.src = avatarUrl;
      matchmakerUserName.textContent = state.user.username;
      matchmakerUserLevel.textContent = state.user.level;
    }

    // Trigger visual progress & chart updates
    renderXPProgress();
    drawGenreDonutSVG();
    drawNarrativeRadarSVG();
  }

  // Award Otaku XP and update level rankings
  function gainXP(amount) {
    if (typeof state.user.xp === 'undefined') state.user.xp = 0;
    
    const oldXp = state.user.xp;
    state.user.xp += amount;
    
    const oldLevel = Math.floor(oldXp / 100) + 1;
    const newLevel = Math.floor(state.user.xp / 100) + 1;
    
    const getLevelTitle = (lvl) => {
      if (lvl === 1) return "Trainee";
      if (lvl === 2) return "Otaku";
      if (lvl === 3) return "Elite";
      if (lvl === 4) return "Sensei";
      return "Sage";
    };
    
    state.user.level = `Lv.${newLevel} ${getLevelTitle(newLevel)}`;
    saveState();
    
    // XP float badge animation
    showXPFloat(amount);

    renderXPProgress();
    updateGlobalProfileUI();
    syncDropdown();
    
    if (newLevel > oldLevel) {
      showToast(`LEVEL UP! You are now a ${state.user.level}! 🎉`, "success");
      logActivity(`<strong>LEVEL UP!</strong> You reached ${state.user.level}!`);
      addNotification('levelup', `Level Up! You are now ${state.user.level}! 🎉`);
    }
  }

  // Draw HSL glowing SVG Donut Genre charts
  function drawGenreDonutSVG() {
    const el = document.getElementById('donut-chart-svg');
    if (!el) return;
    
    const genres = state.user.favoriteGenres || [];
    if (genres.length === 0) {
      el.innerHTML = '<span style="font-size:0.65rem; color:var(--text-muted)">Define favorites!</span>';
      return;
    }
    
    const size = 80;
    const center = size / 2;
    const radius = 24;
    const strokeWidth = 5.5;
    const circ = 2 * Math.PI * radius;
    
    let arcs = '';
    const sliceColors = ['#ff007f', '#00f0ff', '#fff01f'];
    
    const count = genres.length;
    const sliceAngle = circ / count;
    
    let totalOffset = 0;
    genres.forEach((genre, i) => {
      const color = sliceColors[i % sliceColors.length];
      const strokeDash = `${sliceAngle - 2} ${circ - sliceAngle + 2}`;
      const strokeOffset = totalOffset;
      
      arcs += `
        <circle cx="${center}" cy="${center}" r="${radius}" 
          fill="transparent" 
          stroke="${color}" 
          stroke-width="${strokeWidth}" 
          stroke-dasharray="${strokeDash}" 
          stroke-dashoffset="${strokeOffset}" 
          style="transform: rotate(-90deg); transform-origin: center; filter: drop-shadow(0 0 3px ${color}80);"
        />
      `;
      totalOffset -= sliceAngle;
    });
    
    el.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${center}" cy="${center}" r="${radius - 4}" fill="rgba(10, 8, 21, 0.6)" />
        ${arcs}
        <text x="${center}" y="${center + 3}" text-anchor="middle" fill="#ffffff" font-size="8" font-family="var(--font-display)" font-weight="700">${genres.length} SVR</text>
      </svg>
    `;
  }

  // Draw HSL glowing SVG Radar Narrative charts
  function drawNarrativeRadarSVG() {
    const el = document.getElementById('radar-chart-svg');
    if (!el) return;
    
    const categories = ['Act', 'Dep', 'Art', 'Fee', 'Lor'];
    const values = { Act: 50, Dep: 50, Art: 75, Fee: 50, Lor: 50 };
    
    const fg = state.user.favoriteGenres || [];
    fg.forEach(g => {
      if (['Action', 'Adventure', 'Sports'].includes(g)) values.Act += 25;
      if (['Mystery', 'Thriller', 'Supernatural'].includes(g)) values.Dep += 25;
      if (['Drama', 'Romance', 'Slice of Life'].includes(g)) values.Fee += 25;
      if (['Fantasy', 'Sci-Fi'].includes(g)) values.Lor += 25;
    });
    
    for (let r in state.tierList) {
      const anime = state.tierList[r];
      if (anime) {
        const title = anime.title.toLowerCase();
        if (title.includes('naruto') || title.includes('jujutsu') || title.includes('hunter') || title.includes('slayer')) values.Act += 15;
        if (title.includes('death') || title.includes('brotherhood') || title.includes('alchemist')) values.Dep += 15;
        if (title.includes('spirited') || title.includes('away')) values.Fee += 15;
        if (title.includes('titan') || title.includes('attack')) values.Lor += 15;
      }
    }
    
    for (let k in values) {
      if (values[k] > 90) values[k] = 90;
      if (values[k] < 25) values[k] = 25;
    }
    
    const size = 80;
    const center = size / 2;
    const radius = 26;
    
    const getPoint = (index, value) => {
      const angle = (Math.PI * 2 / 5) * index - Math.PI / 2;
      const r = (value / 100) * radius;
      return {
        x: center + Math.cos(angle) * r,
        y: center + Math.sin(angle) * r
      };
    };
    
    let gridPolys = '';
    [0.4, 0.7, 1.0].forEach(scale => {
      const pts = [];
      for (let i = 0; i < 5; i++) {
        const p = getPoint(i, scale * 100);
        pts.push(`${p.x},${p.y}`);
      }
      gridPolys += `<polygon points="${pts.join(' ')}" fill="transparent" stroke="rgba(255, 255, 255, 0.05)" stroke-width="0.75" />`;
    });
    
    const userPts = [];
    for (let i = 0; i < 5; i++) {
      const p = getPoint(i, values[categories[i]]);
      userPts.push(`${p.x},${p.y}`);
    }
    
    let labelsHTML = '';
    const labelDistance = 34;
    categories.forEach((cat, i) => {
      const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
      const lx = center + Math.cos(angle) * labelDistance;
      const ly = center + Math.sin(angle) * labelDistance;
      labelsHTML += `<text x="${lx}" y="${ly + 2}" text-anchor="middle" fill="var(--text-muted)" font-size="6" font-family="var(--font-display)" font-weight="600">${cat}</text>`;
    });
    
    el.innerHTML = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        ${gridPolys}
        <polygon points="${userPts.join(' ')}" 
          fill="rgba(0, 240, 255, 0.12)" 
          stroke="var(--neon-cyan)" 
          stroke-width="1.25" 
          style="filter: drop-shadow(0 0 2px var(--neon-cyan));" 
        />
        ${labelsHTML}
      </svg>
    `;
  }

  // Render Otaku XP progress fills
  function renderXPProgress() {
    const fill = document.getElementById('user-xp-fill');
    const text = document.getElementById('user-xp-text');
    if (!fill || !text) return;
    
    if (typeof state.user.xp === 'undefined') state.user.xp = 0;
    
    const levelXp = state.user.xp % 100;
    fill.style.width = `${levelXp}%`;
    text.textContent = `${levelXp}/100 XP`;
  }


  // ==========================================================================
  // 4. API CONNECTIVITY (JIKAN MAL API V4)
  // ==========================================================================

  // Fetch seasonal trending anime (uses robust caching and local fallback)
  async function fetchTrendingAnime(filter = 'all') {
    // Show skeleton loading grid instead of blank+spinner
    if (catalogLoader) catalogLoader.style.display = 'none';
    if (discoverGrid) {
      discoverGrid.innerHTML = Array(12).fill(0).map(() => `
        <div class="anime-card skeleton-card">
          <div class="skeleton skeleton-poster"></div>
          <div class="anime-card-info">
            <div class="skeleton skeleton-title"></div>
            <div class="skeleton skeleton-meta"></div>
          </div>
        </div>`).join('');
    }
    
    const cacheKey = `trending_${filter}`;
    if (state.apiCache[cacheKey]) {
      renderAnimeGrid(state.apiCache[cacheKey]);
      if (catalogLoader) catalogLoader.style.display = 'none';
      return;
    }

    try {
      // Route through server-side cache proxy to avoid Jikan 3 req/s rate limits
      let url = '/api/jikan-proxy?endpoint=top_anime';
      if (filter === 'movie') {
        url += '&type=movie';
      } else if (filter === 'tv') {
        url += '&type=tv';
      } else if (filter === 'ova') {
        url += '&type=ova';
      } else if (filter === 'score') {
        url += '&order_by=score&sort=desc';
      }

      const response = await fetch(url);
      if (!response.ok) throw new Error("API Limit reached / Response error");
      const json = await response.json();
      
      if (json.data && json.data.length > 0) {
        state.apiCache[cacheKey] = json.data;
        renderAnimeGrid(json.data);
      } else {
        throw new Error("No data returned");
      }
    } catch (error) {
      console.warn("Jikan API error. Loading offline mock catalog data...", error);
      showToast("Syncing offline fallback database...", "info");
      
      // Filter offline data to fit selection
      let filtered = LOCAL_FALLBACK_ANIME;
      if (filter === 'movie') {
        filtered = LOCAL_FALLBACK_ANIME.filter(a => a.type === 'Movie');
      } else if (filter === 'tv') {
        filtered = LOCAL_FALLBACK_ANIME.filter(a => a.type === 'TV');
      }
      
      renderAnimeGrid(filtered);
    } finally {
      if (catalogLoader) catalogLoader.style.display = 'none';
    }
  }

  // Live anime searching with API caching
  async function searchAnimeQuery(query) {
    if (!query || query.trim().length < 3) return [];
    
    const cacheKey = `search_${query.toLowerCase()}`;
    if (state.apiCache[cacheKey]) {
      return state.apiCache[cacheKey];
    }

    // Level 1: Server-side cache proxy
    try {
      const proxyRes = await fetch(`/api/jikan-proxy?endpoint=search&q=${encodeURIComponent(query)}`);
      if (proxyRes.ok) {
        const json = await proxyRes.json();
        if (json.data && json.data.length > 0) {
          state.apiCache[cacheKey] = json.data;
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[Search] Proxy unavailable, trying direct Jikan...', e.message);
    }

    // Level 2: Direct Jikan API fallback
    try {
      const jikanRes = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=10&sfw=true`);
      if (jikanRes.ok) {
        const json = await jikanRes.json();
        if (json.data && json.data.length > 0) {
          state.apiCache[cacheKey] = json.data;
          return json.data;
        }
      }
    } catch (e) {
      console.warn('[Search] Jikan also failed, using local data...', e.message);
    }

    // Level 3: Local fallback
    const term = query.toLowerCase();
    return LOCAL_FALLBACK_ANIME.filter(a =>
      a.title.toLowerCase().includes(term) ||
      a.genres.some(g => g.name.toLowerCase().includes(term))
    );
  }


  // ==========================================================================
  // 5. RENDER COMPONENTS
  // ==========================================================================

  // Build anime items in the Discover Grid
  function renderAnimeGrid(animeList) {
    if (!discoverGrid) return;
    discoverGrid.innerHTML = '';
    
    animeList.forEach(anime => {
      const card = document.createElement('div');
      card.className = 'anime-card';
      card.setAttribute('data-id', anime.mal_id);
      
      const score = anime.score ? anime.score.toFixed(2) : 'N/A';
      const type = anime.type || 'TV';
      const eps = anime.episodes ? `${anime.episodes} eps` : 'Ongoing';
      const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';

      const genres = anime.genres?.slice(0, 2).map(g => `<span class="card-genre-tag">${g.name}</span>`).join('') || '';
      const synopsis = anime.synopsis ? anime.synopsis.substring(0, 110) + '...' : 'No synopsis available.';
      const rank = anime.rank ? `#${anime.rank}` : '';
      card.innerHTML = `
        <div class="anime-card-poster">
          <img src="${poster}" alt="${anime.title}" loading="lazy">
          <div class="anime-card-badge-score">${score}</div>
          ${rank ? `<div class="anime-card-badge-rank">${rank}</div>` : ''}
        </div>
        <div class="anime-card-info">
          <h3 class="anime-card-title">${anime.title}</h3>
          <div class="anime-card-meta">
            <span class="card-type-pill">${type}</span>
            <span>${eps}</span>
          </div>
          <div class="card-genres-row">${genres}</div>
        </div>
        <div class="anime-card-hover-overlay">
          <p class="card-synopsis-preview">${synopsis}</p>
          <div class="card-hover-actions">
            <button class="hover-action-btn view-details-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              Details
            </button>
            <button class="hover-action-btn shelf-btn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="13" height="13"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add to Rank
            </button>
          </div>
        </div>
      `;

      // Event Listeners
      card.querySelector('.view-details-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        openAnimeDetails(anime);
      });

      card.querySelector('.shelf-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        addAnimeToInventory(anime);
      });

      card.addEventListener('click', () => {
        openAnimeDetails(anime);
      });

      discoverGrid.appendChild(card);
    });

    // Animate grid entrance + wire tilt on newly rendered cards
    animateCardGrid('.anime-card');
    initCardTilt('.anime-card');
  }

  // Adds an anime to the quick rank inventory board
  function addAnimeToInventory(anime) {
    // Avoid duplicates in shelf
    if (state.inventory.some(item => item.mal_id === anime.mal_id)) {
      showToast(`${anime.title} is already in your Selection Shelf!`, "info");
      return;
    }

    // Also verify if already ranked
    for (let r in state.tierList) {
      if (state.tierList[r] && state.tierList[r].mal_id === anime.mal_id) {
        showToast(`${anime.title} is already ranked as Rank ${r}!`, "info");
        return;
      }
    }

    state.inventory.push(anime);
    saveState();
    renderInventoryShelf();
    showToast(`Added ${anime.title} to selection bin!`, "success");
    
    // Spark dynamic activity log
    logActivity(`${state.user.username} shelved <strong>${anime.title}</strong> to rank later.`);
  }

  // Render quick rank inventory cards
  function renderInventoryShelf() {
    if (!inventoryShelf) return;
    inventoryShelf.innerHTML = '';

    if (state.inventory.length === 0) {
      inventoryShelf.innerHTML = '<div class="shelf-empty-state">No anime added to list yet. Search above to begin adding!</div>';
      return;
    }

    state.inventory.forEach(anime => {
      const item = document.createElement('div');
      item.className = 'shelved-item';
      item.setAttribute('draggable', 'true');
      item.setAttribute('data-id', anime.mal_id);
      
      const poster = anime.images?.jpg?.image_url || anime.images?.jpg?.small_image_url || '';

      item.innerHTML = `
        <img src="${poster}" alt="${anime.title}">
        <div class="shelved-quick-rank-overlay">
          <button class="rank-trigger-btn" data-rank="1">R1</button>
          <button class="rank-trigger-btn" data-rank="2">R2</button>
          <button class="rank-trigger-btn" data-rank="3">R3</button>
          <button class="rank-trigger-btn" data-rank="4">R4</button>
          <button class="rank-trigger-btn" data-rank="5">R5</button>
        </div>
      `;

      // Click handles for quick buttons
      item.querySelectorAll('.rank-trigger-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const targetRank = parseInt(btn.getAttribute('data-rank'));
          assignAnimeToRank(anime, targetRank);
        });
      });

      // Drag and Drop Event listeners
      item.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', anime.mal_id.toString());
        item.style.opacity = '0.4';
      });

      item.addEventListener('dragend', () => {
        item.style.opacity = '1';
      });

      inventoryShelf.appendChild(item);
    });
  }

  // Render Tier list slots on ranker board
  function renderTierList() {
    for (let rank = 1; rank <= 5; rank++) {
      const dz = document.getElementById(`dz-${rank}`);
      if (!dz) continue;
      
      dz.innerHTML = '';
      const anime = state.tierList[rank];
      
      if (!anime) {
        dz.innerHTML = '<div class="dz-placeholder">Drag & drop or click R1-R5 on shelf item</div>';
      } else {
        const item = document.createElement('div');
        item.className = 'ranked-item';
        item.setAttribute('draggable', 'true');
        item.setAttribute('data-id', anime.mal_id);
        item.setAttribute('data-rank', rank);
        
        const poster = anime.images?.jpg?.image_url || '';

        item.innerHTML = `
          <img src="${poster}" alt="${anime.title}">
          <button class="ranked-item-remove">&times;</button>
        `;

        item.querySelector('.ranked-item-remove').addEventListener('click', (e) => {
          e.stopPropagation();
          const btn = e.currentTarget;
          if (btn.dataset.confirming === 'true') {
            removeAnimeFromRank(rank);
            btn.dataset.confirming = 'false';
            btn.textContent = '\u00D7';
            btn.classList.remove('confirm-danger');
          } else {
            btn.dataset.confirming = 'true';
            btn.textContent = 'Sure?';
            btn.classList.add('confirm-danger');
            setTimeout(() => {
              btn.dataset.confirming = 'false';
              btn.textContent = '\u00D7';
              btn.classList.remove('confirm-danger');
            }, 2500);
          }
        });

        item.addEventListener('dragstart', (e) => {
          e.dataTransfer.setData('text/plain', `ranked-${rank}`);
        });

        dz.appendChild(item);
      }

      // Notes inputs
      const noteInput = document.querySelector(`.tier-note-input[data-rank="${rank}"]`);
      if (noteInput) {
        noteInput.value = state.tierNotes[rank] || '';
      }
    }
  }

  // Move an anime into a rank slot
  function assignAnimeToRank(anime, targetRank) {
    const existing = state.tierList[targetRank];
    
    // Put current occupant back in shelf if exists
    if (existing) {
      state.inventory.push(existing);
    }

    // Remove from shelf
    state.inventory = state.inventory.filter(item => item.mal_id !== anime.mal_id);
    
    // Clear out from any other rank positions to prevent duplicates
    for (let r in state.tierList) {
      if (state.tierList[r] && state.tierList[r].mal_id === anime.mal_id) {
        state.tierList[r] = null;
      }
    }

    // Place inside target rank slot
    state.tierList[targetRank] = anime;
    saveState();
    
    renderTierList();
    renderInventoryShelf();
    
    showToast(`Ranked ${anime.title} as your Top #${targetRank}!`, "success");
    // Pulse the drop zone briefly
    const dz = document.getElementById(`dz-${targetRank}`);
    if (dz) { dz.classList.add('rank-pulse'); setTimeout(() => dz.classList.remove('rank-pulse'), 600); }
    logActivity(`You ranked <strong>${anime.title}</strong> as your absolute #${targetRank}!`);
    gainXP(15);
  }

  // Remove ranked anime and push back to shelf
  function removeAnimeFromRank(rank) {
    const anime = state.tierList[rank];
    if (!anime) return;

    state.tierList[rank] = null;
    state.inventory.push(anime);
    saveState();

    renderTierList();
    renderInventoryShelf();
    showToast(`Removed ${anime.title} from Rank ${rank}`, "info");
  }


  // ==========================================================================
  // 6. DRAG AND DROP HANDLERS
  // ==========================================================================

  dropZones.forEach(dz => {
    const rank = parseInt(dz.id.replace('dz-', ''));
    
    dz.addEventListener('dragover', (e) => {
      e.preventDefault();
      dz.classList.add('dragover');
    });

    dz.addEventListener('dragleave', () => {
      dz.classList.remove('dragover');
    });

    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('dragover');
      
      const dataStr = e.dataTransfer.getData('text/plain');
      
      if (dataStr.startsWith('ranked-')) {
        // Rearranging existing rank
        const oldRank = parseInt(dataStr.replace('ranked-', ''));
        if (oldRank === rank) return;
        
        const movingAnime = state.tierList[oldRank];
        const replacingAnime = state.tierList[rank];
        
        state.tierList[rank] = movingAnime;
        state.tierList[oldRank] = replacingAnime;
        saveState();
        renderTierList();
        showToast(`Swapped rank positions!`, "success");
      } else {
        // Dropping new anime from shelf inventory
        const malId = parseInt(dataStr);
        const anime = state.inventory.find(item => item.mal_id === malId);
        if (anime) {
          assignAnimeToRank(anime, rank);
        }
      }
    });
  });


  // ==========================================================================
  // 7. SOCIAL HUB & TASTE MATCHMAKER ALGORITHM
  // ==========================================================================

  // Refresh user stats cards on matchmaker
  function renderUserTasteSummary() {
    if (!userTopListSummary || !userGenresSummary) return;

    userTopListSummary.innerHTML = '';
    userGenresSummary.innerHTML = '';

    // Ranked list
    let empty = true;
    for (let r = 1; r <= 5; r++) {
      const anime = state.tierList[r];
      if (anime) {
        empty = false;
        const li = document.createElement('li');
        // Safe DOM construction — anime.title from Jikan API but still sanitized
        const rankBold = document.createElement('strong');
        rankBold.textContent = `#${r}`;
        li.appendChild(rankBold);
        li.appendChild(document.createTextNode(' - '));
        li.appendChild(document.createTextNode(anime.title));
        userTopListSummary.appendChild(li);
      }
    }
    if (empty) {
      userTopListSummary.innerHTML = '<li class="text-muted" style="list-style:none">No anime ranked yet. Add some in My Rank!</li>';
    }

    // Favorite genres
    if (state.user.favoriteGenres.length === 0) {
      userGenresSummary.innerHTML = '<span class="text-muted">None specified in Profile settings</span>';
    } else {
      state.user.favoriteGenres.forEach(genre => {
        const pill = document.createElement('span');
        pill.className = 'genre-pill';
        pill.textContent = genre;
        userGenresSummary.appendChild(pill);
      });
    }
  }

  // Core taste matchmaking algorithm comparing profile overlaps
  function calculateCompatibility(fan) {
    let score = 50; // base score

    // 1. Compare favorite genres overlap
    const userGenres = state.user.favoriteGenres;
    const fanGenres = fan.favoriteGenres;
    let genreOverlapCount = 0;
    
    userGenres.forEach(g => {
      if (fanGenres.includes(g)) genreOverlapCount++;
    });
    score += genreOverlapCount * 12; // +12% per shared genre

    // 2. Compare ranked titles overlap
    const userRankedTitles = [];
    for (let r in state.tierList) {
      if (state.tierList[r]) userRankedTitles.push(state.tierList[r].title.toLowerCase());
    }

    let titleOverlapCount = 0;
    fan.topAnime.forEach(title => {
      if (userRankedTitles.some(uTitle => uTitle.includes(title.toLowerCase()) || title.toLowerCase().includes(uTitle))) {
        titleOverlapCount++;
      }
    });
    score += titleOverlapCount * 20; // +20% per shared anime title

    // Clamp score safely
    if (score > 99) score = 99;
    if (score < 40) score = 40 + Math.floor(Math.random() * 8);

    return score;
  }

  // Build the list of global community matching cards
  function renderCommunityMatches() {
    if (!matchesGrid) return;
    matchesGrid.innerHTML = '';

    // Calculate score details for all fans and sort descending
    const rankedMatches = COMMUNITY_FANS.map(fan => {
      return {
        ...fan,
        scorePercent: calculateCompatibility(fan)
      };
    }).sort((a, b) => b.scorePercent - a.scorePercent);

    rankedMatches.forEach(fan => {
      const card = document.createElement('div');
      card.className = 'match-card';
      
      const sharedGenres = fan.favoriteGenres.filter(g => state.user.favoriteGenres.includes(g));
      const sharedGenresList = sharedGenres.length > 0 
        ? sharedGenres.map(g => `<span class="genre-pill pink">${g}</span>`).join('')
        : `<span class="text-muted" style="font-size:0.7rem">Shared interests</span>`;

      card.innerHTML = `
        <div class="match-card-header">
          <div class="match-card-meta">
            <div class="match-card-avatar">
              <img src="${fan.avatar}" alt="${fan.name}">
            </div>
            <div class="match-card-user">
              <span class="match-card-username">${fan.name}</span>
              <span class="match-card-lvl">${fan.level}</span>
            </div>
          </div>
          <div class="compatibility-meter">
            <div class="match-compatibility-ring">
              <span class="match-compat-value" data-target="${fan.scorePercent}">${fan.scorePercent}%</span>
            </div>
            <span class="percent-label">Match</span>
          </div>
        </div>
        <p class="match-card-bio">"${fan.bio}"</p>
        <div class="match-card-shared">
          <div class="match-card-shared-title">Overlapping Genres</div>
          <div class="shared-list">${sharedGenresList}</div>
        </div>
        <div class="match-card-actions">
          <button class="match-action-btn compare-btn">Compare</button>
          <button class="match-action-btn chat-btn">Chat Lobby</button>
          <button class="match-send-msg-btn" data-user="${fan.name}">💬 Message</button>
        </div>
      `;

      card.querySelector('.compare-btn').addEventListener('click', () => {
        compareTastesModal(fan);
      });

      card.querySelector('.chat-btn').addEventListener('click', () => {
        // Go directly to chat lobby with channel context if they match
        switchTab('lobby');
        // Pre-fill user input to say hello to specific person
        if (chatMessageInput) {
          chatMessageInput.value = `Hey ${fan.name}, saw we matched ${fan.scorePercent}% on Matchmaker!`;
          chatMessageInput.focus();
        }
      });

      card.querySelector('.match-send-msg-btn').addEventListener('click', () => {
        const username = fan.name;
        switchTab('lobby');
        if (chatMessageInput) {
          chatMessageInput.value = `@${username} `;
          chatMessageInput.focus();
        }
      });

      matchesGrid.appendChild(card);
    });

    // Animate compatibility percentages with GSAP countUp
    document.querySelectorAll('.match-compat-value').forEach(el => {
      const target = parseInt(el.dataset.target || el.textContent);
      el.textContent = '0%';
      if (typeof gsap !== 'undefined') {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: target,
          duration: 1.2,
          ease: 'power2.out',
          delay: 0.3,
          onUpdate: () => { el.textContent = Math.round(obj.val) + '%'; },
        });
      } else {
        el.textContent = target + '%';
      }
    });
  }

  // Taste comparison details popup modal sheet
  function compareTastesModal(fan) {
    const fanTopList = fan.topAnime.map((title, i) => `<li><strong>#${i+1}</strong>: ${title}</li>`).join('');
    
    let userTopList = '';
    let hasRank = false;
    for (let r = 1; r <= 5; r++) {
      if (state.tierList[r]) {
        hasRank = true;
        userTopList += `<li><strong>#${r}</strong>: ${state.tierList[r].title}</li>`;
      }
    }
    if (!hasRank) {
      userTopList = '<li class="text-muted">No ranked shows yet!</li>';
    }

    const modalHTML = `
      <div style="position: relative; z-index: 10;">
        <h2 style="font-family: var(--font-display); margin-bottom: 20px; color: var(--neon-pink); border-bottom: 1px solid var(--border-glass); padding-bottom: 10px;">Taste Comparison: ${fan.name}</h2>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 25px;">
          <div style="background: rgba(10, 8, 21, 0.4); padding: 15px; border-radius: 8px; border: 1px solid var(--border-glass);">
            <h4 style="color: var(--neon-cyan); font-family: var(--font-display); margin-bottom: 10px;">Your Ranks</h4>
            <ul style="padding-left: 15px; font-size: 0.85rem; line-height: 1.8;">${userTopList}</ul>
          </div>
          <div style="background: rgba(10, 8, 21, 0.4); padding: 15px; border-radius: 8px; border: 1px solid var(--border-glass);">
            <h4 style="color: var(--neon-pink); font-family: var(--font-display); margin-bottom: 10px;">${fan.name}'s Ranks</h4>
            <ul style="padding-left: 15px; font-size: 0.85rem; line-height: 1.8;">${fanTopList}</ul>
          </div>
        </div>
        <h4 style="font-family: var(--font-display); margin-bottom: 8px;">Favorite Genres Overlap</h4>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 25px;">
          ${fan.favoriteGenres.map(g => {
            const shared = state.user.favoriteGenres.includes(g);
            return `<span class="genre-pill ${shared ? 'pink' : ''}" style="opacity: ${shared ? '1' : '0.4'}">${g} ${shared ? '✓' : ''}</span>`;
          }).join('')}
        </div>
        <div style="display:flex; justify-content:flex-end">
          <button class="glass-btn btn-secondary" onclick="document.getElementById('details-modal').classList.remove('active')">Close Detail View</button>
        </div>
      </div>
    `;

    if (detailsModalContent) {
      detailsModalContent.innerHTML = modalHTML;
      detailsModal.classList.add('active');
    }
  }


  // ==========================================================================
  // 8. SOCIAL CHATROOM LOBBY SIMULATOR
  // ==========================================================================

  // Populate active messages stream in panel
  function renderChatMessages() {
    if (!chatMessagesStream) return;
    chatMessagesStream.innerHTML = '';

    const logs = state.chatLogs[state.activeChannel] || [];
    
    if (logs.length === 0) {
      chatMessagesStream.innerHTML = '<div class="chat-message system"><div class="chat-msg-system-bubble">Room created. Share your thoughts here!</div></div>';
      return;
    }

    logs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `chat-message ${msg.self ? 'self' : ''}`;

      // === SAFE DOM CONSTRUCTION (XSS-protected) ===
      // Never inject msg.sender, msg.message, or msg.avatar via innerHTML.
      // All user-controlled fields are set via textContent or validated attributes.

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'chat-msg-avatar';
      const avatarImg = document.createElement('img');
      // Validate avatar URL is a safe absolute URL before setting
      const safeAvatar = (typeof msg.avatar === 'string' && msg.avatar.startsWith('https://')) ? msg.avatar : '';
      avatarImg.src = safeAvatar;
      avatarImg.alt = '';
      avatarDiv.appendChild(avatarImg);

      const bodyDiv = document.createElement('div');
      bodyDiv.className = 'chat-msg-body';

      const metaDiv = document.createElement('div');
      metaDiv.className = 'chat-msg-sender-meta';
      const senderSpan = document.createElement('span');
      senderSpan.className = 'chat-msg-sender';
      safeText(senderSpan, msg.sender);
      const timeSpan = document.createElement('span');
      timeSpan.className = 'chat-msg-time';
      safeText(timeSpan, msg.time);
      metaDiv.appendChild(senderSpan);
      metaDiv.appendChild(timeSpan);

      const bubbleDiv = document.createElement('div');
      bubbleDiv.className = 'chat-msg-bubble';
      safeText(bubbleDiv, msg.message);

      bodyDiv.appendChild(metaDiv);
      bodyDiv.appendChild(bubbleDiv);
      msgDiv.appendChild(avatarDiv);
      msgDiv.appendChild(bodyDiv);
      chatMessagesStream.appendChild(msgDiv);
    });

    // Auto scroll bottom
    chatMessagesStream.scrollTop = chatMessagesStream.scrollHeight;
  }

  // Trigger automated fan responses based on user query keywords
  function simulateChatResponses(userMsg) {
    const text = userMsg.toLowerCase();
    
    // Choose correct simulated responding character based on keywords
    let responder = null;
    let triggerKey = 'fallback';

    if (text.includes('recommend') || text.includes('what watch') || text.includes('suggest')) {
      responder = COMMUNITY_FANS[Math.floor(Math.random() * COMMUNITY_FANS.length)];
      triggerKey = 'recommend';
    } else if (text.includes('death note') || text.includes('lelouch') || text.includes('code geass') || text.includes('mystery') || text.includes('psychological')) {
      responder = COMMUNITY_FANS.find(f => f.id === 'lelouchfan');
      triggerKey = text.includes('mystery') ? 'mystery' : 'fallback';
    } else if (text.includes('shonen') || text.includes('naruto') || text.includes('fight') || text.includes('battle') || text.includes('goku') || text.includes('luffy')) {
      responder = COMMUNITY_FANS.find(f => f.id === 'gokustan');
      triggerKey = text.includes('shonen') ? 'shonen' : 'fallback';
    } else if (text.includes('romance') || text.includes('love') || text.includes('wholesome') || text.includes('spirited away') || text.includes('tears')) {
      responder = COMMUNITY_FANS.find(f => f.id === 'sakurachan');
      triggerKey = text.includes('romance') ? 'romance' : 'fallback';
    } else if (text.includes('scifi') || text.includes('robot') || text.includes('mecha') || text.includes('cyber') || text.includes('neon')) {
      responder = COMMUNITY_FANS.find(f => f.id === 'cybernneko');
      triggerKey = text.includes('scifi') ? 'scifi' : 'fallback';
    } else {
      // Pick a random fan to say a general query or fallback
      responder = COMMUNITY_FANS[Math.floor(Math.random() * COMMUNITY_FANS.length)];
      triggerKey = Math.random() > 0.4 ? 'general' : 'fallback';
    }

    if (!responder) return;

    const delayTyping = 1000 + Math.floor(Math.random() * 1500); // 1 to 2.5s typing delay
    
    setTimeout(() => {
      // Show typing indicator
      if (chatTypingIndicator) {
        typingUserText.textContent = `${responder.name} is typing...`;
        chatTypingIndicator.style.display = 'flex';
        chatMessagesStream.scrollTop = chatMessagesStream.scrollHeight;
      }

      setTimeout(() => {
        // Hide typing indicator
        if (chatTypingIndicator) chatTypingIndicator.style.display = 'none';

        // Add message log
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const replyText = responder.responses[triggerKey] || responder.responses['fallback'];
        
        state.chatLogs[state.activeChannel].push({
          sender: responder.name,
          avatar: responder.avatar,
          message: replyText,
          time: timeNow,
          self: false
        });

        saveState();
        renderChatMessages();

        // Increment unread badge if not in tab
        const activeTab = document.querySelector('.nav-tab.active');
        if (activeTab && activeTab.getAttribute('data-tab') !== 'lobby') {
          if (chatUnreadBadge) {
            chatUnreadBadge.style.display = 'inline-block';
            const count = parseInt(chatUnreadBadge.textContent) || 0;
            chatUnreadBadge.textContent = count + 1;
          }
        }

      }, 1500); // typing duration simulation

    }, delayTyping);
  }

  // Periodically inject subtle background conversations to make room feel alive
  function launchChatBackgroundSimulation() {
    setInterval(() => {
      const activeTab = document.querySelector('.nav-tab.active');
      const isLobby = activeTab && activeTab.getAttribute('data-tab') === 'lobby';
      
      // 15% chance to post a background comment if the user is in general channel
      if (Math.random() < 0.15) {
        const poster = COMMUNITY_FANS[Math.floor(Math.random() * COMMUNITY_FANS.length)];
        
        // Pick a dynamic short message
        const remarks = [
          "Just finished reading Berserk. Absolute peak artwork.",
          "Who else is hyped for the upcoming movie releases? 🍿",
          "Hot take: Anime soundtracks can make a mid show look like 10/10.",
          "I need a good action recommendation that isn't mainstream!",
          "Currently listening to Neon Genesis soundtracks on repeat. Pure art.",
          "Hope everyone has ranked their Top 5 list! Let's compare percentages."
        ];
        
        const randomComment = remarks[Math.floor(Math.random() * remarks.length)];
        const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        state.chatLogs.general.push({
          sender: poster.name,
          avatar: poster.avatar,
          message: randomComment,
          time: timeNow,
          self: false
        });
        
        saveState();
        
        if (isLobby && state.activeChannel === 'general') {
          renderChatMessages();
        } else {
          // Increment unread badge
          if (chatUnreadBadge) {
            chatUnreadBadge.style.display = 'inline-block';
            const count = parseInt(chatUnreadBadge.textContent) || 0;
            chatUnreadBadge.textContent = count + 1;
          }
        }
      }
    }, 30000); // Check every 30 seconds
  }

  launchChatBackgroundSimulation();


  // ==========================================================================
  // 9. ACTIVITY FEED & TICKERS
  // ==========================================================================

  // Log user activity into discover sidebar feed
  function logActivity(activityHTML) {
    if (!activityFeed) return;
    
    const item = document.createElement('div');
    item.className = 'activity-item';
    
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed}&backgroundColor=ff007f`;

    item.innerHTML = `
      <div class="activity-avatar">
        <img src="${avatarUrl}" alt="User">
      </div>
      <div class="activity-details">
        <span>${activityHTML}</span>
        <span class="activity-time">${timeNow}</span>
      </div>
    `;

    activityFeed.insertBefore(item, activityFeed.firstChild);
    
    // Cap feed items
    if (activityFeed.children.length > 8) {
      activityFeed.lastChild.remove();
    }
  }

  // Pre-seed some initial visual feeds
  function preseedActivityFeed() {
    if (!activityFeed) return;
    activityFeed.innerHTML = '';
    
    const feeds = [
      { name: "SakuraChan 🌸", action: "marked <strong>Spirited Away</strong> as Rank #1.", time: "20:30" },
      { name: "GokuStan ⚡", action: "added <strong>Jujutsu Kaisen</strong> to their inventory.", time: "20:25" },
      { name: "CodeGeassEnjoyer 👁️", action: "wrote an extensive comment on <strong>Death Note</strong>.", time: "20:11" },
      { name: "CyberNeko 🐾", action: "synchronized their mal inventory listing.", time: "19:55" }
    ];

    feeds.forEach(f => {
      const item = document.createElement('div');
      item.className = 'activity-item';
      
      const seed = f.name.replace(/[^a-zA-Z]/g, '');
      const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=00f0ff`;

      item.innerHTML = `
        <div class="activity-avatar">
          <img src="${avatarUrl}" alt="${f.name}">
        </div>
        <div class="activity-details">
          <span><strong class="activity-user">${f.name}</strong> ${f.action}</span>
          <span class="activity-time">${f.time}</span>
        </div>
      `;
      activityFeed.appendChild(item);
    });
  }

  preseedActivityFeed();


  // ==========================================================================
  // 10. ANIME DETAILS MODAL AND COMMENTING SYSTEM
  // ==========================================================================

  // Build detail card content overlay
  function openAnimeDetails(anime) {
    if (!detailsModalContent) return;

    const score = anime.score ? anime.score.toFixed(2) : 'N/A';
    const rank = anime.rank || 'N/A';
    const eps = anime.episodes ? `${anime.episodes} episodes` : 'Ongoing';
    const status = anime.status || 'Unknown';
    const studio = anime.studios ? anime.studios.map(s => s.name).join(', ') : 'MAL Standard';
    const genresList = anime.genres ? anime.genres.map(g => `<span class="genre-pill">${g.name}</span>`).join('') : '';
    const poster = anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '';
    
    // YouTube embed logic
    let trailerHTML = `<div class="trailer-error-message">Trailer not available in public index</div>`;
    if (anime.trailer && anime.trailer.embed_url) {
      // Security sanitize embed URL
      const embed = anime.trailer.embed_url;
      trailerHTML = `<iframe src="${embed}" allowfullscreen></iframe>`;
    }

    // Load dynamic comments
    const malId = anime.mal_id;
    const comments = state.animeComments[malId] || [
      { author: "SakuraChan 🌸", text: "Truly a remarkable show! Cried so much at the end 😭❤️", time: "2 days ago" },
      { author: "CodeGeassEnjoyer 👁️", text: "Decent pacing, but the character motivations felt a bit contrived in episode 12.", time: "1 day ago" }
    ];

    const commentsHTML = comments.map(c => `
      <div class="detail-review-item">
        <div class="review-header">
          <span class="review-author">${c.author}</span>
          <span class="review-time">${c.time}</span>
        </div>
        <p class="review-body">${c.text}</p>
      </div>
    `).join('');

    const modalHTML = `
      <div class="details-hero">
        <div class="details-poster">
          <img src="${poster}" alt="${anime.title}">
        </div>
        <div class="details-main-info">
          <h1>${anime.title}</h1>
          <div class="details-genres">${genresList}</div>
          <p style="font-size: 0.8rem; color: var(--text-muted)">Studio: <strong>${studio}</strong> | Type: <strong>${anime.type || 'TV'}</strong></p>
          
          <div class="details-stats-row">
            <div class="details-stat-box">
              <span>MAL Score</span>
              <strong class="stat-score">${score}</strong>
            </div>
            <div class="details-stat-box">
              <span>Global Rank</span>
              <strong class="stat-rank">#${rank}</strong>
            </div>
            <div class="details-stat-box">
              <span>Status</span>
              <strong style="color: var(--neon-pink); font-size: 0.75rem;">${status}</strong>
            </div>
          </div>
        </div>
      </div>

      <div class="details-block">
        <h3>Story Summary</h3>
        <p class="details-synopsis">${anime.synopsis || 'No summary available in public database index.'}</p>
      </div>

      <div class="details-block">
        <h3>Promotional Trailer</h3>
        <div class="trailer-placeholder">
          ${trailerHTML}
        </div>
      </div>

      <div class="details-block">
        <h3>Fan Discussion (${comments.length})</h3>
        <div class="details-discussion" id="modal-discussion-box">
          ${commentsHTML}
        </div>
        
        <div class="comment-input-area">
          <textarea id="new-comment-textarea" placeholder="Add to the discussion... What did you think of this anime?"></textarea>
          <button class="glass-btn btn-magenta" id="post-comment-btn" style="padding: 8px 16px; font-size: 0.8rem; align-self: flex-end;">Post Comment</button>
        </div>
      </div>

      <div style="display:flex; gap:12px; margin-top:20px; border-top:1px solid var(--border-glass); padding-top:20px">
        <button class="glass-btn btn-magenta" id="detail-add-rank-btn" style="flex:1">Rank This Anime</button>
        <button class="glass-btn btn-secondary" id="detail-close-modal-btn">Close details</button>
      </div>
    `;

    detailsModalContent.innerHTML = modalHTML;
    detailsModal.classList.add('active');

    // Attach inner actions
    document.getElementById('detail-close-modal-btn').addEventListener('click', () => {
      detailsModal.classList.remove('active');
    });

    document.getElementById('detail-add-rank-btn').addEventListener('click', () => {
      addAnimeToInventory(anime);
      detailsModal.classList.remove('active');
      switchTab('ranker');
    });

    const postBtn = document.getElementById('post-comment-btn');
    const commentArea = document.getElementById('new-comment-textarea');
    postBtn.addEventListener('click', () => {
      const val = commentArea.value.trim();
      if (!val) return;

      if (!state.animeComments[malId]) {
        state.animeComments[malId] = comments; // preseed with initial mock reviews first
      }

      state.animeComments[malId].push({
        author: `${state.user.username} (You)`,
        text: val,
        time: "Just now"
      });

      saveState();
      
      // Re-trigger details to render list
      openAnimeDetails(anime);
      showToast("Comment posted!", "success");
      
      logActivity(`You commented on <strong>${anime.title}</strong>: "${val.slice(0,35)}..."`);
      gainXP(10);
    });
  }


  // ==========================================================================
  // 11. PROFILE SETTINGS CONTROLS
  // ==========================================================================

  // Populate avatar options inside form picker
  function populateAvatarPicker() {
    if (!avatarGridPicker) return;
    avatarGridPicker.innerHTML = '';
    
    const seeds = ["JapaFanUser", "OtakuKing", "KawaiNeko", "MechaPilot", "ShonenHero", "CyberNinja"];
    
    seeds.forEach(seed => {
      const div = document.createElement('div');
      div.className = `avatar-picker-item ${state.user.avatarSeed === seed ? 'selected' : ''}`;
      div.setAttribute('data-seed', seed);
      
      div.innerHTML = `
        <img src="https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${seed}&backgroundColor=ff007f" alt="${seed}">
      `;

      div.addEventListener('click', () => {
        document.querySelectorAll('.avatar-picker-item').forEach(item => item.classList.remove('selected'));
        div.classList.add('selected');
        selectedAvatarSeed.value = seed;
      });

      avatarGridPicker.appendChild(div);
    });
  }

  // Pre-open profile form and seed fields
  function openProfileSettings() {
    profileUsernameInput.value = state.user.username;
    profileBioInput.value = state.user.bio;
    selectedAvatarSeed.value = state.user.avatarSeed;
    populateAvatarPicker();

    // Check pre-selected favorite genres
    document.querySelectorAll('.genre-checkbox-pill').forEach(pill => {
      const genreName = pill.getAttribute('data-genre');
      if (state.user.favoriteGenres.includes(genreName)) {
        pill.classList.add('selected');
      } else {
        pill.classList.remove('selected');
      }
    });

    profileModal.classList.add('active');
  }

  // Handle genre multiselect toggles (max 3)
  document.querySelectorAll('.genre-checkbox-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const selected = document.querySelectorAll('.genre-checkbox-pill.selected');
      
      if (pill.classList.contains('selected')) {
        pill.classList.remove('selected');
      } else {
        if (selected.length >= 3) {
          showToast("Maximum of 3 favorite genres allowed!", "info");
          return;
        }
        pill.classList.add('selected');
      }
    });
  });

  // Save profile modifications
  if (profileForm) {
    profileForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const newUsername = profileUsernameInput.value.trim();
      const newBio = profileBioInput.value.trim();
      const newSeed = selectedAvatarSeed.value;

      // Extract genres
      const checkedGenres = [];
      document.querySelectorAll('.genre-checkbox-pill.selected').forEach(pill => {
        checkedGenres.push(pill.getAttribute('data-genre'));
      });

      state.user.username = newUsername || "OtakuGamer";
      state.user.bio = newBio || "No bio yet.";
      state.user.avatarSeed = newSeed;
      state.user.favoriteGenres = checkedGenres;
      
      saveState();
      updateGlobalProfileUI();
      
      profileModal.classList.remove('active');
      showToast("Profile settings updated successfully!", "success");
      
      // Calculate taste summaries for matchmaker
      renderUserTasteSummary();
      renderCommunityMatches();
    });
  }

  // Modal open triggers
  if (openProfileBtn) openProfileBtn.addEventListener('click', openProfileSettings);
  if (chatFooterProfileBtn) chatFooterProfileBtn.addEventListener('click', openProfileSettings);
  if (closeProfileBtn) closeProfileBtn.addEventListener('click', () => profileModal.classList.remove('active'));
  if (cancelProfileBtn) cancelProfileBtn.addEventListener('click', () => profileModal.classList.remove('active'));


  // ==========================================================================
  // 12. NAVIGATION & TABS ENGINE
  // ==========================================================================

  function switchTab(tabId) {
    // Nav bar active transitions
    navTabs.forEach(tab => {
      if (tab.getAttribute('data-tab') === tabId) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });

    // Body content tabs — smooth fade transition
    const outgoing = document.querySelector('.tab-content.active');
    if (outgoing && outgoing.id !== `tab-${tabId}`) {
      outgoing.classList.add('tab-fade-out');
      setTimeout(() => { outgoing.classList.remove('active', 'tab-fade-out'); }, 160);
    }
    tabContents.forEach(content => {
      const cid = content.id.replace('tab-', '');
      if (cid === tabId) {
        setTimeout(() => {
          content.classList.add('active');
          animateTabSwitch(content);
        }, outgoing ? 160 : 0);
      } else if (content !== outgoing) {
        content.classList.remove('active');
      }
    });

    // Perform target refreshes when loading specific sections
    if (tabId === 'discover') {
      // Dynamic catalog
    } else if (tabId === 'ranker') {
      renderTierList();
      renderInventoryShelf();
    } else if (tabId === 'matchmaker') {
      renderUserTasteSummary();
      renderCommunityMatches();
    } else if (tabId === 'lobby') {
      renderChatMessages();
      // Clear unread badge
      if (chatUnreadBadge) {
        chatUnreadBadge.style.display = 'none';
        chatUnreadBadge.textContent = '0';
      }
    }
  }

  navTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      switchTab(tabId);
    });
  });


  // ==========================================================================
  // 13. SELECTION & FILTER ACTION HANDLERS
  // ==========================================================================

  // Live discovering debouncer
  let searchTimeout = null;
  searchInput.addEventListener('input', () => {
    const val = searchInput.value.trim();
    
    if (val.length === 0) {
      clearSearchBtn.style.display = 'none';
      searchDropdown.classList.remove('active');
      return;
    }
    
    clearSearchBtn.style.display = 'block';
    
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(async () => {
      const results = await searchAnimeQuery(val);
      renderSearchDropdown(results);
    }, 450); // 450ms debounce
  });

  // Clear search textbox
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearSearchBtn.style.display = 'none';
    searchDropdown.classList.remove('active');
    searchInput.focus();
  });

  // Build search autocomplete dropdown list
  function renderSearchDropdown(results) {
    if (!searchDropdown) return;
    searchDropdown.innerHTML = '';

    if (results.length === 0) {
      searchDropdown.innerHTML = '<div style="padding: 15px; color: var(--text-muted); font-size: 0.85rem; text-align: center;">No anime found. Try another query!</div>';
      searchDropdown.classList.add('active');
      return;
    }

    results.forEach(anime => {
      const item = document.createElement('div');
      item.className = 'search-result-item';
      
      const poster = anime.images?.jpg?.small_image_url || anime.images?.jpg?.image_url || '';
      const year = anime.year ? `, ${anime.year}` : '';
      const type = anime.type || 'TV';

      const scoreColor = anime.score >= 8 ? 'var(--neon-green)' : anime.score >= 6 ? 'var(--neon-yellow)' : 'var(--text-muted)';
      const animeGenres = anime.genres?.slice(0, 2).map(g => `<span class="search-genre-tag">${g.name}</span>`).join('') || '';
      item.innerHTML = `
        <img src="${poster}" alt="${anime.title}" class="search-result-poster">
        <div class="search-result-info">
          <span class="search-result-title">${anime.title}</span>
          <div class="search-result-row2">
            <span class="search-type-pill">${type}</span>
            ${anime.episodes ? `<span class="search-eps">${anime.episodes} eps</span>` : ''}
            ${year ? `<span class="search-year">${anime.year}</span>` : ''}
          </div>
          <div class="search-result-row3">
            ${animeGenres}
            ${anime.score ? `<span class="search-score-badge" style="color:${scoreColor}">★ ${anime.score}</span>` : ''}
          </div>
        </div>
      `;

      item.addEventListener('click', () => {
        searchDropdown.classList.remove('active');
        searchInput.value = '';
        clearSearchBtn.style.display = 'none';
        openAnimeDetails(anime);
      });

      searchDropdown.appendChild(item);
    });

    searchDropdown.classList.add('active');
  }

  // Document click closes autocomplete dropdowns
  document.addEventListener('click', (e) => {
    if (searchDropdown && !e.target.closest('.search-bar-container')) {
      searchDropdown.classList.remove('active');
    }
    if (inventoryDropdown && !e.target.closest('.inventory-search-box')) {
      inventoryDropdown.classList.remove('active');
    }
  });

  // Animated sliding pill indicator
  function updateFilterPill(activeBtn) {
    const track = document.getElementById('filter-pill-track');
    const pill  = document.getElementById('filter-active-pill');
    if (!track || !pill || !activeBtn) return;
    const trackRect = track.getBoundingClientRect();
    const btnRect   = activeBtn.getBoundingClientRect();
    const leftPos   = btnRect.left - trackRect.left;
    if (typeof gsap !== 'undefined') {
      gsap.to(pill, { x: leftPos, width: btnRect.width, duration: 0.28, ease: 'power2.out' });
    } else {
      pill.style.cssText += `;transform:translateX(${leftPos}px);width:${btnRect.width}px`;
    }
  }

  // Category filter pills
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      updateFilterPill(pill);
      const filter = pill.getAttribute('data-filter');
      fetchTrendingAnime(filter);
    });
  });

  // Init pill position on first render
  setTimeout(() => {
    const activePill = document.querySelector('.filter-pill.active');
    if (activePill) updateFilterPill(activePill);
  }, 400);


  // ==========================================================================
  // 14. RANKER WORKSPACE TEXTAREA & SHELF SEARCH
  // ==========================================================================

  // Save reflections note updates
  noteInputs.forEach(input => {
    input.addEventListener('change', () => {
      const rank = parseInt(input.getAttribute('data-rank'));
      state.tierNotes[rank] = input.value.trim();
      saveState();
      showToast(`Rank ${rank} reflection notes saved!`, "success");
    });
  });

  // Inner search for shelf selection
  let invTimeout = null;
  inventorySearch.addEventListener('input', () => {
    const val = inventorySearch.value.trim();
    if (val.length < 3) {
      inventoryDropdown.classList.remove('active');
      return;
    }

    clearTimeout(invTimeout);
    invTimeout = setTimeout(async () => {
      const results = await searchAnimeQuery(val);
      renderInventoryDropdown(results);
    }, 450);
  });

  // Render inventory search autocomplete items
  function renderInventoryDropdown(results) {
    if (!inventoryDropdown) return;
    inventoryDropdown.innerHTML = '';

    if (results.length === 0) {
      inventoryDropdown.innerHTML = '<div style="padding: 10px; color: var(--text-muted); font-size: 0.8rem;">No results found.</div>';
      inventoryDropdown.classList.add('active');
      return;
    }

    results.forEach(anime => {
      const item = document.createElement('div');
      item.className = 'inventory-dropdown-item';
      
      const poster = anime.images?.jpg?.small_image_url || '';
      const year = anime.year ? ` (${anime.year})` : '';

      item.innerHTML = `
        <img src="${poster}" alt="${anime.title}">
        <span>${anime.title}${year}</span>
      `;

      item.addEventListener('click', () => {
        inventoryDropdown.classList.remove('active');
        inventorySearch.value = '';
        addAnimeToInventory(anime);
      });

      inventoryDropdown.appendChild(item);
    });

    inventoryDropdown.classList.add('active');
  }


  // ==========================================================================
  // 15. CHAT FORM ACTIONS
  // ==========================================================================

  // Send message on form submission
  if (chatMessageForm) {
    chatMessageForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const text = chatMessageInput.value.trim();
      if (!text) return;

      const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed}&backgroundColor=ff007f`;

      // Log messages
      state.chatLogs[state.activeChannel].push({
        sender: `${state.user.username} (You)`,
        avatar: avatarUrl,
        message: text,
        time: timeNow,
        self: true
      });

      saveState();
      renderChatMessages();

      // Sync to Supabase real-time chat (non-blocking — local-first)
      if (supabaseService.initialized) {
        supabaseService.sendChatMessage(state.activeChannel, text)
          .catch(err => console.warn('[Chat] Supabase sync failed:', err));
      }

      chatMessageInput.value = '';
      chatMessageInput.focus();

      // Trigger automatic reply sequences
      simulateChatResponses(text);
      gainXP(5);
    });
  }

  // Switch chat channels
  channelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      channelButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      const channel = btn.getAttribute('data-channel');
      state.activeChannel = channel;
      
      // Update descriptors
      const label = btn.querySelector('.channel-name').textContent;
      const desc = btn.querySelector('.channel-desc').textContent;
      
      currentChannelTitle.textContent = label;
      currentChannelDesc.textContent = desc;

      renderChatMessages();
    });
  });


  // ==========================================================================
  // 16. EXPORT BADGE CARD MAKER
  // ==========================================================================

  // Generate visual badge representation code
  function buildExportBadge() {
    if (!otakuCardExport) return;
    
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed}&backgroundColor=ff007f`;
    
    // Rank rows
    let rankRowsHTML = '';
    let hasRank = false;

    for (let r = 1; r <= 5; r++) {
      const anime = state.tierList[r];
      if (anime) {
        hasRank = true;
        const note = state.tierNotes[r] ? ` - "${state.tierNotes[r].slice(0, 30)}..."` : '';
        rankRowsHTML += `
          <div class="badge-rank-item">
            <span class="badge-rank-num r${r}">#${r}</span>
            <div class="badge-rank-title">${anime.title}</div>
          </div>
        `;
      }
    }

    if (!hasRank) {
      rankRowsHTML = `
        <div style="text-align: center; color: var(--text-muted); font-size: 0.8rem; padding: 20px 0; border: 1px dashed var(--border-glass); border-radius: 8px; font-style: italic;">
          No anime ranked on your board yet! Put titles in My Rank to build badge.
        </div>
      `;
    }

    const currentYear = new Date().getFullYear();

    otakuCardExport.innerHTML = `
      <div class="badge-header">
        <div class="badge-avatar">
          <img src="${avatarUrl}" alt="Avatar">
        </div>
        <div class="badge-user-info">
          <h3>${state.user.username}</h3>
          <span>${state.user.level}</span>
        </div>
      </div>
      <p class="badge-quote">"${state.user.bio || 'Anime is life.'}"</p>
      
      <div class="badge-rankings">
        <h4>Top Series Rankings</h4>
        <div class="badge-rank-list">
          ${rankRowsHTML}
        </div>
      </div>

      <div class="badge-footer">
        <span>GENRES: ${state.user.favoriteGenres.join(', ') || 'General'}</span>
        <span>JAPAFAN ID // ${currentYear}</span>
      </div>
    `;
  }

  // Copy share code
  if (copyBadgeCodeBtn) {
    copyBadgeCodeBtn.addEventListener('click', () => {
      const shareCode = `[JapaFan Profile Badge: ${state.user.username} // Ranks: ${Object.values(state.tierList).filter(a=>a).map((a,i)=>`#${i+1}: ${a.title}`).join(', ') || 'Empty'}]`;
      navigator.clipboard.writeText(shareCode).then(() => {
        showToast("Badge details code copied to clipboard!", "success");
      });
    });
  }

  let selectedBadgeTheme = 'cyberpunk';
  document.querySelectorAll('.theme-select-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.theme-select-pill').forEach(p => {
        p.classList.remove('active');
        p.style.borderColor = 'var(--border-glass)';
        p.style.color = 'var(--text-muted)';
      });
      pill.classList.add('active');
      selectedBadgeTheme = pill.getAttribute('data-theme');
      
      // Set indicator borders dynamically
      if (selectedBadgeTheme === 'cyberpunk') {
        pill.style.borderColor = 'var(--neon-cyan)';
        pill.style.color = 'var(--neon-cyan)';
      } else if (selectedBadgeTheme === 'retro') {
        pill.style.borderColor = 'var(--neon-green)';
        pill.style.color = 'var(--neon-green)';
      } else if (selectedBadgeTheme === 'cozy') {
        pill.style.borderColor = 'var(--neon-pink)';
        pill.style.color = 'var(--neon-pink)';
      }
      
      showToast(`Expressed theme: ${selectedBadgeTheme.toUpperCase()}`, "info");
    });
  });

  if (downloadBadgeBtn) {
    downloadBadgeBtn.addEventListener('click', () => {
      showToast(`Generating ${selectedBadgeTheme} profile badge...`, "info");
      const success = window.downloadBadgeImage(state, selectedBadgeTheme);
      if (success) {
        showToast("Profile badge downloaded successfully!", "success");
      } else {
        showToast("Error generating badge canvas.", "error");
      }
    });
  }

  // Trigger export model popup
  if (exportBadgeBtn) {
    exportBadgeBtn.addEventListener('click', () => {
      buildExportBadge();
      exportModal.classList.add('active');
    });
  }

  if (closeExportBtn) {
    closeExportBtn.addEventListener('click', () => {
      exportModal.classList.remove('active');
    });
  }

  // Global modals close on clicking backdrop overlay
  window.addEventListener('click', (e) => {
    if (e.target === detailsModal) detailsModal.classList.remove('active');
    if (e.target === profileModal) profileModal.classList.remove('active');
    if (e.target === exportModal) exportModal.classList.remove('active');
    if (e.target === authModal) closeAuth();
  });

  if (closeDetailsBtn) {
    closeDetailsBtn.addEventListener('click', () => {
      detailsModal.classList.remove('active');
    });
  }

  // Refresh matchmaking compatibility scores
  if (refreshMatchesBtn) {
    refreshMatchesBtn.addEventListener('click', () => {
      showToast("Analyzing community overlaps...", "info");
      renderCommunityMatches();
    });
  }


  // ==========================================================================
  // 17. SUPABASE AUTHENTICATION & CONNECTION HANDLERS
  // ==========================================================================

  const authModal = document.getElementById('auth-modal');
  const connectCloudBtn = document.getElementById('connect-cloud-btn');
  const closeAuthBtn = document.getElementById('close-auth-btn');
  const cancelSigninBtn = document.getElementById('cancel-signin-btn');
  const cancelSignupBtn = document.getElementById('cancel-signup-btn');
  
  const tabSigninTrigger = document.getElementById('tab-signin-trigger');
  const tabSignupTrigger = document.getElementById('tab-signup-trigger');
  const signinForm = document.getElementById('auth-signin-form');
  const signupForm = document.getElementById('auth-signup-form');

  // Real-time Supabase Auth Listener (captures Google and standard sessions)
  if (supabaseService.initialized && supabaseService.client) {
    supabaseService.client.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        console.log("Supabase Auth State Change: Logged in", event, session.user);
        const user = session.user;
        
        // Sync our local user state
        state.user.username = user.user_metadata?.username || user.user_metadata?.full_name || user.email.split('@')[0];
        state.user.avatarSeed = user.user_metadata?.avatar_seed || `JapaFan-${state.user.username}`;
        state.user.bio = user.user_metadata?.bio || "Cloud Authenticated Otaku // Ranks sync active.";
        
        // Switch to authenticated header state
        setAuthState(true);
        // Update header avatar
        const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed || 'JapaFanUser'}&backgroundColor=ff007f`;
        const headerAvatar = document.getElementById('header-avatar');
        const headerUsername = document.getElementById('header-username');
        if (headerAvatar) headerAvatar.src = avatarUrl;
        if (headerUsername) headerUsername.textContent = state.user.username;
        
        // Load additional custom profile details from database users table if any
        try {
          const profile = await supabaseService.getMyProfile();
          if (profile) {
            if (profile.username) state.user.username = profile.username;
            if (profile.avatar_seed) state.user.avatarSeed = profile.avatar_seed;
            if (profile.bio) state.user.bio = profile.bio;
          }
        } catch (err) {
          console.warn("Could not fetch extended user profile details:", err.message);
        }

        // Determine if this is a Google Sign-in or Standard Cloud Sign-in
        const isGoogle = user.app_metadata?.provider === 'google' || 
                         (user.identities && user.identities.some(id => id.provider === 'google'));

        if (isGoogle) {
          if (!state.user.googleAuthAwarded) {
            state.user.googleAuthAwarded = true;
            gainXP(35); // +35 XP for Google authentication!
            showToast("Authenticated via Google Sign In!", "success");
          }
        } else {
          if (!state.user.cloudAuthAwarded) {
            state.user.cloudAuthAwarded = true;
            gainXP(25); // +25 XP for standard cloud auth link!
            showToast("Synchronized with cloud database!", "success");
          }
        }

        saveState();
        updateGlobalProfileUI();
      }
    });
  }

  // Open Auth Modal
  if (connectCloudBtn) {
    connectCloudBtn.addEventListener('click', () => {
      authModal.classList.add('active');
    });
  }

  // Close Auth Modal
  const closeAuth = () => {
    if (authModal) authModal.classList.remove('active');
  };
  if (closeAuthBtn) closeAuthBtn.addEventListener('click', closeAuth);
  if (cancelSigninBtn) cancelSigninBtn.addEventListener('click', closeAuth);
  if (cancelSignupBtn) cancelSignupBtn.addEventListener('click', closeAuth);

  // Sign In / Sign Up Form Tab Swaps
  if (tabSigninTrigger && tabSignupTrigger) {
    tabSigninTrigger.addEventListener('click', () => {
      tabSigninTrigger.style.color = 'var(--neon-cyan)';
      tabSigninTrigger.style.borderBottom = '2px solid var(--neon-cyan)';
      tabSigninTrigger.style.fontWeight = '700';
      
      tabSignupTrigger.style.color = 'var(--text-muted)';
      tabSignupTrigger.style.borderBottom = 'none';
      tabSignupTrigger.style.fontWeight = '500';
      
      if (signinForm) signinForm.style.display = 'block';
      if (signupForm) signupForm.style.display = 'none';
    });

    tabSignupTrigger.addEventListener('click', () => {
      tabSignupTrigger.style.color = 'var(--neon-pink)';
      tabSignupTrigger.style.borderBottom = '2px solid var(--neon-pink)';
      tabSignupTrigger.style.fontWeight = '700';
      
      tabSigninTrigger.style.color = 'var(--text-muted)';
      tabSigninTrigger.style.borderBottom = 'none';
      tabSigninTrigger.style.fontWeight = '500';
      
      if (signinForm) signinForm.style.display = 'none';
      if (signupForm) signupForm.style.display = 'block';
    });
  }

  // Handle login inputs
  if (signinForm) {
    signinForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const email = document.getElementById('signin-email').value.trim();
      const pass = document.getElementById('signin-password').value.trim();
      
      showToast("Verifying Cloud sync...", "info");
      
      if (supabaseService.initialized) {
        const { error } = await supabaseService.signIn(email, pass);
        if (error) {
          showToast(`Signin failed: ${error}`, "error");
        } else {
          closeAuth();
        }
      } else {
        setTimeout(() => {
          state.user.username = email.split('@')[0];
          state.user.bio = "Cloud Authenticated Otaku // Profile sync active.";
          state.user.avatarSeed = `JapaFan-${state.user.username}`;
          saveState();
          
          // Switch visual headers
          if (connectCloudBtn) connectCloudBtn.style.display = 'none';
          if (openProfileBtn) openProfileBtn.style.display = 'flex';
          
          updateGlobalProfileUI();
          closeAuth();
          showToast("Synchronized with cloud database!", "success");
          if (!state.user.cloudAuthAwarded) {
            state.user.cloudAuthAwarded = true;
            gainXP(25); // Gain 25 XP for linking cloud!
          }
        }, 1000);
      }
    });
  }

  // Handle register inputs
  if (signupForm) {
    signupForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const username = document.getElementById('signup-username').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const pass = document.getElementById('signup-password').value.trim();
      
      showToast("Registering account details...", "info");
      
      if (supabaseService.initialized) {
        const { error } = await supabaseService.signUp(email, pass, username, `JapaFan-${username}`);
        if (error) {
          showToast(`Registration failed: ${error}`, "error");
        } else {
          showToast("Account created! Please check your email to verify.", "success");
          closeAuth();
        }
      } else {
        setTimeout(() => {
          state.user.username = username;
          state.user.bio = "Freshly registered Otaku // Profile sync active.";
          state.user.avatarSeed = `JapaFan-${username}`;
          saveState();
          
          if (connectCloudBtn) connectCloudBtn.style.display = 'none';
          if (openProfileBtn) openProfileBtn.style.display = 'flex';
          
          updateGlobalProfileUI();
          closeAuth();
          showToast("Account created successfully!", "success");
          if (!state.user.cloudAuthAwarded) {
            state.user.cloudAuthAwarded = true;
            gainXP(30); // Gain 30 XP for registering!
          }
        }, 1000);
      }
    });
  }

  // Handle Google OAuth Sign In
  const googleLoginBtn = document.getElementById('google-login-btn');
  if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
      showToast("Redirecting to Google Secure Nodes...", "info");
      
      if (supabaseService.initialized) {
        const { error } = await supabaseService.signInWithGoogle();
        if (error) {
          showToast(`Google Sign-In failed: ${error}`, "error");
        }
      } else {
        setTimeout(() => {
          state.user.username = "GoogleOtaku";
          state.user.bio = "Securely linked with Google Account // Ranks sync active.";
          state.user.avatarSeed = "JapaFan-GoogleUser";
          saveState();
          
          if (connectCloudBtn) connectCloudBtn.style.display = 'none';
          if (openProfileBtn) openProfileBtn.style.display = 'flex';
          
          updateGlobalProfileUI();
          closeAuth();
          showToast("Authenticated via Google Sign In!", "success");
          if (!state.user.googleAuthAwarded) {
            state.user.googleAuthAwarded = true;
            gainXP(35); // Gain 35 XP for Google authentication!
          }
        }, 1200);
      }
    });
  }


  // ==========================================================================
  // 18. INITIAL BOOTSTRAP INVOCATIONS
  // ==========================================================================

  // Perform initial system renders
  updateGlobalProfileUI();
  fetchTrendingAnime();
  renderTierList();
  renderInventoryShelf();


  // ==========================================================================
  // PHASE 1 — PROFILE DROPDOWN + LOGOUT + AUTH STATE + KEYBOARD SEARCH
  // ==========================================================================

  // ── Dropdown refs ──────────────────────────────────────────────────────────
  const profileDropdownWrapper = document.getElementById('profile-dropdown-wrapper');
  const profileDropdownTrigger = document.getElementById('profile-dropdown-trigger');
  const profileDropdownMenu    = document.getElementById('profile-dropdown-menu');
  const dropdownSignoutBtn     = document.getElementById('dropdown-signout-btn');
  const dropdownEditProfile    = document.getElementById('dropdown-edit-profile');
  const dropdownMyRank         = document.getElementById('dropdown-my-rank');
  const dropdownExportBadge    = document.getElementById('dropdown-export-badge');
  const dropdownAvatar         = document.getElementById('dropdown-avatar');
  const dropdownUsername       = document.getElementById('dropdown-username');
  const dropdownLevel          = document.getElementById('dropdown-level');
  const dropdownXpCount        = document.getElementById('dropdown-xp-count');
  const dropdownXpFill         = document.getElementById('dropdown-xp-fill');

  /** Sync dropdown panel data from current state */
  function syncDropdown() {
    const xp  = state.user.xp || 0;
    const pct = ((xp % 100) / 100 * 100).toFixed(0);
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${state.user.avatarSeed || 'JapaFanUser'}&backgroundColor=ff007f`;

    if (dropdownAvatar)   dropdownAvatar.src = avatarUrl;
    if (dropdownUsername) dropdownUsername.textContent = state.user.username || 'OtakuFan';
    if (dropdownLevel)    dropdownLevel.textContent    = state.user.level    || 'Lv.1 Trainee';
    if (dropdownXpCount)  dropdownXpCount.textContent  = `${xp} XP`;
    if (dropdownXpFill)   dropdownXpFill.style.width   = `${pct}%`;
  }

  /** Show/hide header elements based on auth state */
  function setAuthState(loggedIn) {
    const connectBtn = document.getElementById('connect-cloud-btn');
    if (connectBtn)              connectBtn.style.display          = loggedIn ? 'none'  : 'flex';
    if (profileDropdownWrapper)  profileDropdownWrapper.style.display = loggedIn ? 'flex' : 'none';
    if (loggedIn) syncDropdown();
  }

  // Toggle dropdown open/closed
  if (profileDropdownTrigger) {
    profileDropdownTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = profileDropdownWrapper.classList.toggle('open');
      profileDropdownTrigger.setAttribute('aria-expanded', isOpen);
      if (isOpen) syncDropdown();
    });
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (profileDropdownWrapper && !profileDropdownWrapper.contains(e.target)) {
      profileDropdownWrapper.classList.remove('open');
      if (profileDropdownTrigger) profileDropdownTrigger.setAttribute('aria-expanded', 'false');
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && profileDropdownWrapper?.classList.contains('open')) {
      profileDropdownWrapper.classList.remove('open');
      profileDropdownTrigger?.focus();
    }
  });

  // ── Dropdown action buttons ─────────────────────────────────────────────────
  if (dropdownEditProfile) {
    dropdownEditProfile.addEventListener('click', () => {
      profileDropdownWrapper.classList.remove('open');
      if (profileModal) profileModal.classList.add('active');
    });
  }
  if (dropdownMyRank) {
    dropdownMyRank.addEventListener('click', () => {
      profileDropdownWrapper.classList.remove('open');
      document.querySelector('[data-tab="ranker"]')?.click();
    });
  }
  if (dropdownExportBadge) {
    dropdownExportBadge.addEventListener('click', () => {
      profileDropdownWrapper.classList.remove('open');
      document.getElementById('export-badge-btn')?.click();
    });
  }

  // ── Sign Out → Guest Mode (no reload) ──────────────────────────────────────
  if (dropdownSignoutBtn) {
    dropdownSignoutBtn.addEventListener('click', async () => {
      profileDropdownWrapper.classList.remove('open');

      // Sign out from Supabase (non-blocking)
      if (supabaseService.initialized) {
        supabaseService.signOut().catch(err => console.warn('Supabase sign out error:', err));
      }

      // Reset to guest state — preserve XP and username locally
      state.user.cloudAuthAwarded  = false;
      state.user.googleAuthAwarded = false;
      saveState();

      // Switch header back to logged-out state
      setAuthState(false);

      showToast('Signed out. You\'re now in guest mode.', 'info');
    });
  }

  // ── Keyboard navigation for search dropdown ─────────────────────────────────
  let searchHighlightIndex = -1;

  function getSearchItems() {
    return searchDropdown ? Array.from(searchDropdown.querySelectorAll('.search-result-item')) : [];
  }

  function highlightSearchItem(index) {
    const items = getSearchItems();
    items.forEach((item, i) => {
      item.classList.toggle('keyboard-highlighted', i === index);
      if (i === index) item.scrollIntoView({ block: 'nearest' });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      const items = getSearchItems();
      if (!searchDropdown?.classList.contains('active') || items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        searchHighlightIndex = Math.min(searchHighlightIndex + 1, items.length - 1);
        highlightSearchItem(searchHighlightIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        searchHighlightIndex = Math.max(searchHighlightIndex - 1, 0);
        highlightSearchItem(searchHighlightIndex);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (searchHighlightIndex >= 0 && items[searchHighlightIndex]) {
          items[searchHighlightIndex].click();
          searchHighlightIndex = -1;
        }
      } else if (e.key === 'Escape') {
        searchDropdown.classList.remove('active');
        searchHighlightIndex = -1;
      }
    });

    // Reset highlight index on new input
    searchInput.addEventListener('input', () => { searchHighlightIndex = -1; });
  }

  // ── XP Float Badge ─────────────────────────────────────────────────────────
  function showXPFloat(amount, anchorEl) {
    const badge = document.createElement('div');
    badge.className = 'xp-float-badge';
    badge.textContent = `+${amount} XP ⚡`;

    // Position near XP bar or header
    const rect = (anchorEl || document.querySelector('.app-header'))?.getBoundingClientRect();
    badge.style.left = rect ? `${rect.left + rect.width / 2}px` : '50%';
    badge.style.top  = rect ? `${rect.top}px` : '80px';

    document.body.appendChild(badge);
    badge.addEventListener('animationend', () => badge.remove());
  }


  // ==========================================================================
  // PHASE 2 - CHAT SCROLL-TO-BOTTOM + EMPTY STATES
  // ==========================================================================

  const chatScrollBottomBtn = document.getElementById('chat-scroll-bottom-btn');

  function scrollChatToBottom(smooth) {
    var stream = document.getElementById('chat-messages-stream');
    if (!stream) return;
    stream.scrollTo({ top: stream.scrollHeight, behavior: smooth ? 'smooth' : 'instant' });
  }

  if (chatScrollBottomBtn) {
    var chatStream = document.getElementById('chat-messages-stream');
    if (chatStream) {
      chatStream.addEventListener('scroll', function() {
        var distFromBottom = chatStream.scrollHeight - chatStream.scrollTop - chatStream.clientHeight;
        chatScrollBottomBtn.classList.toggle('visible', distFromBottom > 120);
      });
    }
    chatScrollBottomBtn.addEventListener('click', function() {
      scrollChatToBottom(true);
      chatScrollBottomBtn.classList.remove('visible');
    });
  }

  function createEmptyState(icon, title, sub, ctaText, ctaAction) {
    var div = document.createElement('div');
    div.className = 'empty-state';
    div.innerHTML = '<div class="empty-state-icon">' + icon + '</div>' +
      '<div class="empty-state-title">' + title + '</div>' +
      '<p class="empty-state-sub">' + sub + '</p>' +
      (ctaText ? '<button class="empty-state-cta empty-state-cta-js">' + ctaText + '</button>' : '');
    if (ctaText && ctaAction) {
      setTimeout(function() {
        var btn = div.querySelector('.empty-state-cta-js');
        if (btn) btn.addEventListener('click', ctaAction);
      }, 0);
    }
    return div;
  }


  // ==========================================================================
  // PHASE 3 — MICRO-INTERACTIONS & POLISH
  // ==========================================================================

  // '/' keyboard shortcut focuses search from anywhere
  document.addEventListener('keydown', function(e) {
    if (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA') {
      e.preventDefault();
      var si = document.getElementById('anime-search-input');
      if (si) { si.focus(); switchTab('discover'); }
    }
  });

  // Level-up visual flash on profile area
  var _origGainXP_levelup = gainXP;
  function triggerLevelUpEffect() {
    var wrapper = document.getElementById('profile-dropdown-wrapper') || document.querySelector('.app-header');
    if (wrapper) {
      wrapper.classList.add('levelup-flash');
      setTimeout(function() { wrapper.classList.remove('levelup-flash'); }, 800);
    }
  }

  // Add / hint span inside search bar
  (function() {
    var sbc = document.querySelector('.search-bar-container');
    if (sbc && !sbc.querySelector('.search-slash-hint')) {
      var hint = document.createElement('span');
      hint.className = 'search-slash-hint';
      hint.textContent = '/';
      hint.title = 'Press / to search';
      sbc.appendChild(hint);
    }
  })();


  // ==========================================================================
  // PHASE 4.4 + 4.5 — BACK-TO-TOP + FILTER PILL INIT
  // ==========================================================================

  const backToTopBtn = document.getElementById('back-to-top-btn');

  function initBackToTop() {
    if (!backToTopBtn) return;
    var mainEl = document.querySelector('main') || document.documentElement;

    window.addEventListener('scroll', function() {
      var scrollY = window.scrollY || window.pageYOffset;
      if (scrollY > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }, { passive: true });

    backToTopBtn.addEventListener('click', function() {
      if (typeof gsap !== 'undefined' && gsap.plugins && gsap.plugins.scrollTo) {
        gsap.to(window, { scrollTo: 0, duration: 0.8, ease: 'power2.inOut' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  initBackToTop();

  // ==========================================================================
  // PHASE 4.2 — PUBLIC PROFILE PAGES (hash routing)
  // ==========================================================================

  function renderPublicProfile(profileData) {
    // profileData: { username, level, xp, avatarSeed, tierList, genres }
    const xp  = profileData.xp || 0;
    const pct = Math.round((xp % 100));
    const avatarUrl = `https://api.dicebear.com/7.x/bottts-neutral/svg?seed=${profileData.avatarSeed || profileData.username}&backgroundColor=ff007f`;

    const pvAvatar    = document.getElementById('pv-avatar');
    const pvUsername  = document.getElementById('pv-username');
    const pvLevel     = document.getElementById('pv-level');
    const pvXpCount   = document.getElementById('pv-xp-count');
    const pvXpPct     = document.getElementById('pv-xp-pct');
    const pvXpFill    = document.getElementById('pv-xp-fill');
    const pvRankings  = document.getElementById('pv-rankings');
    const pvGenres    = document.getElementById('pv-genres');

    if (pvAvatar)   pvAvatar.src              = avatarUrl;
    if (pvUsername) pvUsername.textContent     = profileData.username || 'OtakuFan';
    if (pvLevel)    pvLevel.textContent        = profileData.level    || 'Lv.1 Trainee';
    if (pvXpCount)  pvXpCount.textContent      = `${xp} XP`;
    if (pvXpPct)    pvXpPct.textContent        = `${pct}%`;

    // Animate XP bar
    if (pvXpFill) {
      pvXpFill.style.width = '0%';
      setTimeout(() => { pvXpFill.style.width = `${pct}%`; }, 200);
    }

    // Rankings grid
    if (pvRankings) {
      const tierList = profileData.tierList || {};
      const ranked = Object.entries(tierList).filter(([, v]) => v).slice(0, 5);
      pvRankings.innerHTML = ranked.length
        ? ranked.map(([rank, anime]) => {
            const poster = anime.images?.jpg?.image_url || '';
            return `<div class="pv-rank-item"><span class="pv-rank-num">#${rank}</span><img src="${poster}" alt="${anime.title}" title="${anime.title}"></div>`;
          }).join('')
        : '<p class="pv-empty">No rankings yet.</p>';
    }

    // Genre tags
    if (pvGenres) {
      const genres = profileData.genres || [];
      pvGenres.innerHTML = genres.slice(0, 8).map(g =>
        `<span class="pv-genre-tag">${g.name || g}</span>`
      ).join('') || '<p class="pv-empty">No genre data.</p>';
    }

    // Show profile view
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    const pvTab = document.getElementById('tab-profile');
    if (pvTab) { pvTab.style.display = 'block'; pvTab.classList.add('active'); }
  }

  function showMyPublicProfile() {
    // Build profile data from current state
    const genres = Object.entries(state.genreTaste || {}).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    renderPublicProfile({
      username:   state.user.username,
      level:      state.user.level,
      xp:         state.user.xp,
      avatarSeed: state.user.avatarSeed,
      tierList:   state.tierList,
      genres,
    });
  }

  // Hash routing: #profile → show own profile
  function handleHashChange() {
    const hash = window.location.hash;
    if (hash === '#profile' || hash === '#profile/me') {
      showMyPublicProfile();
    }
  }
  window.addEventListener('hashchange', handleHashChange);

  // Profile view back button
  const profileViewBackBtn = document.getElementById('profile-view-back');
  if (profileViewBackBtn) {
    profileViewBackBtn.addEventListener('click', () => {
      const pvTab = document.getElementById('tab-profile');
      if (pvTab) { pvTab.style.display = 'none'; pvTab.classList.remove('active'); }
      window.history.replaceState(null, '', window.location.pathname);
      switchTab('discover');
    });
  }

  // Share button
  const pvShareBtn = document.getElementById('pv-share-btn');
  if (pvShareBtn) {
    pvShareBtn.addEventListener('click', () => {
      const url = window.location.origin + window.location.pathname + '#profile';
      navigator.clipboard?.writeText(url).then(() => showToast('Profile link copied!', 'success'));
    });
  }

  // Wire dropdown "Edit Profile" to show own profile
  const dropdownMyRankBtn = document.getElementById('dropdown-my-rank');
  // (already wired in Phase 1 — keep as is)

  // ==========================================================================
  // PHASE 4.1 — NOTIFICATION CENTER
  // ==========================================================================

  const NOTIF_TYPES = {
    levelup:  { icon: '🏆', color: 'var(--neon-purple)' },
    xp:       { icon: '⚡', color: 'var(--neon-cyan)' },
    chat:     { icon: '💬', color: 'var(--neon-green)' },
    match:    { icon: '🎯', color: 'var(--neon-pink)' },
    trending: { icon: '🔥', color: '#f59e0b' },
    system:   { icon: '⚙️', color: 'var(--text-muted)' },
  };

  const notifBellBtn     = document.getElementById('notif-bell-btn');
  const notifUnreadBadge = document.getElementById('notif-unread-badge');
  const notifPanel       = document.getElementById('notif-panel');
  const notifBackdrop    = document.getElementById('notif-backdrop');
  const notifList        = document.getElementById('notif-list');
  const notifMarkAllBtn  = document.getElementById('notif-mark-all-btn');
  const notifCloseBtn    = document.getElementById('notif-close-btn');

  // Notifications stored in state
  if (!state.notifications) state.notifications = [];

  function addNotification(type, message, link) {
    const notif = {
      id:      Date.now(),
      type:    type || 'system',
      message: message,
      link:    link || null,
      read:    false,
      time:    new Date().toISOString(),
    };
    state.notifications.unshift(notif);
    if (state.notifications.length > 20) state.notifications = state.notifications.slice(0, 20);
    saveState();
    renderNotifications();
    updateNotifBadge();
    // Ring the bell
    if (notifBellBtn) {
      notifBellBtn.classList.add('notif-bell-ring');
      setTimeout(() => notifBellBtn.classList.remove('notif-bell-ring'), 700);
    }
  }

  function updateNotifBadge() {
    const unread = state.notifications.filter(n => !n.read).length;
    if (notifUnreadBadge) {
      notifUnreadBadge.textContent = unread > 9 ? '9+' : unread;
      notifUnreadBadge.style.display = unread > 0 ? 'flex' : 'none';
    }
  }

  function renderNotifications() {
    if (!notifList) return;
    if (!state.notifications.length) {
      notifList.innerHTML = '<div class="notif-empty-state"><span class="notif-empty-icon">🔔</span><p>No notifications yet</p></div>';
      return;
    }
    notifList.innerHTML = state.notifications.map(n => {
      const t = NOTIF_TYPES[n.type] || NOTIF_TYPES.system;
      return `
        <div class="notif-item ${n.read ? 'notif-read' : 'notif-unread'}" data-id="${n.id}">
          <span class="notif-item-icon" style="color:${t.color}">${t.icon}</span>
          <div class="notif-item-body">
            <p class="notif-item-msg">${n.message}</p>
            <span class="notif-item-time">${timeAgo(new Date(n.time))}</span>
          </div>
          ${!n.read ? '<span class="notif-unread-dot"></span>' : ''}
        </div>`;
    }).join('');

    // Mark as read on click
    notifList.querySelectorAll('.notif-item').forEach(el => {
      el.addEventListener('click', () => {
        const id = parseInt(el.dataset.id);
        const notif = state.notifications.find(n => n.id === id);
        if (notif) { notif.read = true; saveState(); renderNotifications(); updateNotifBadge(); }
      });
    });
  }

  function openNotifPanel() {
    if (!notifPanel) return;
    notifPanel.classList.add('open');
    notifBackdrop.classList.add('open');
    notifBellBtn.setAttribute('aria-expanded', 'true');
    notifPanel.setAttribute('aria-hidden', 'false');
    // GSAP slide in from right
    if (typeof gsap !== 'undefined') {
      gsap.fromTo(notifPanel, { x: 320, opacity: 0 }, { x: 0, opacity: 1, duration: 0.32, ease: 'power3.out' });
    }
    renderNotifications();
  }

  function closeNotifPanel() {
    if (!notifPanel) return;
    if (typeof gsap !== 'undefined') {
      gsap.to(notifPanel, { x: 320, opacity: 0, duration: 0.22, ease: 'power2.in', onComplete: () => {
        notifPanel.classList.remove('open');
        notifBackdrop.classList.remove('open');
      }});
    } else {
      notifPanel.classList.remove('open');
      notifBackdrop.classList.remove('open');
    }
    notifBellBtn.setAttribute('aria-expanded', 'false');
    notifPanel.setAttribute('aria-hidden', 'true');
  }

  if (notifBellBtn) notifBellBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPanel.classList.contains('open') ? closeNotifPanel() : openNotifPanel();
  });
  if (notifCloseBtn)  notifCloseBtn.addEventListener('click', closeNotifPanel);
  if (notifBackdrop)  notifBackdrop.addEventListener('click', closeNotifPanel);
  if (notifMarkAllBtn) notifMarkAllBtn.addEventListener('click', () => {
    state.notifications.forEach(n => n.read = true);
    saveState();
    renderNotifications();
    updateNotifBadge();
  });

  // Wire into existing events: level up, XP, chat
  // Seed welcome notification on first load
  if (!state.notifications.length) {
    addNotification('system', 'Welcome to JapaFan! Explore trending anime and build your tier list.');
  }

  // Initialize badge
  updateNotifBadge();

});
