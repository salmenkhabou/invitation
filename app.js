document.addEventListener('DOMContentLoaded', () => {
  
  // ==========================================================================
  // 1. Floating Gold Dust Particle Engine (HTML5 Canvas)
  // ==========================================================================
  const canvas = document.getElementById('canvas-particles');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  const particleCount = 40;
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Particle {
    constructor() {
      this.reset();
      this.y = Math.random() * canvas.height; // Random start Y on init
    }
    
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = canvas.height + 10;
      this.size = Math.random() * 2.5 + 0.5;
      this.speedY = Math.random() * 0.6 + 0.2;
      this.speedX = Math.random() * 0.4 - 0.2;
      this.opacity = Math.random() * 0.5 + 0.2;
      this.wobble = Math.random() * Math.PI;
      this.wobbleSpeed = Math.random() * 0.02 + 0.005;
    }
    
    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.15;
      
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198, 167, 123, ${this.opacity})`;
      ctx.shadowBlur = this.size * 2;
      ctx.shadowColor = 'rgba(198, 167, 123, 0.4)';
      ctx.fill();
    }
  }
  
  // Pre-seed particles
  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }
  
  function animateParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // Clear shadow settings
    ctx.shadowBlur = 0;
    
    particles.forEach(p => {
      p.update();
      p.draw();
    });
    requestAnimationFrame(animateParticles);
  }
  
  animateParticles();

  // ==========================================================================
  // 2. DOM Elements & State
  // ==========================================================================
  const envelopeWrapper = document.getElementById('envelope-wrapper');
  const envelope = document.getElementById('envelope');
  const waxSealBtn = document.getElementById('wax-seal-btn');
  const mainContent = document.getElementById('main-content');
  
  const musicToggle = document.getElementById('music-toggle');
  const musicIcon = document.getElementById('music-icon');
  const bgMusic = document.getElementById('bg-music');
  
  const openMapBtn = document.getElementById('open-map-btn');
  const mapModal = document.getElementById('map-modal');
  const mapCloseBtn = document.getElementById('map-close-btn');
  
  const openRsvpBtn = document.getElementById('open-rsvp-btn');
  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpCloseBtn = document.getElementById('rsvp-close-btn');
  
  const copyRibBtn = document.getElementById('copy-rib-btn');
  const copyBtnText = document.getElementById('copy-btn-text');
  
  const songForm = document.getElementById('song-form');
  const songSubmitBtn = document.getElementById('song-submit-btn');
  const songResponse = document.getElementById('song-response');
  
  // Card Deck Buttons
  const deckRsvpBtn = document.getElementById('deck-rsvp-btn');
  const deckMapBtn = document.getElementById('deck-map-btn');
  const deckEnterBtn = document.getElementById('deck-enter-btn');
  
  let isPlaying = false;
  let activeGuest = null;

  // ==========================================================================
  // 3. Envelope Animation & Site Reveal
  // ==========================================================================
  
  // Open envelope on seal click (reveal fanned-out interactive cards)
  waxSealBtn.addEventListener('click', () => {
    envelope.classList.add('open');
    playMusic();
  });

  // Action: Enter the main scrolling invitation website
  function enterSite() {
    envelopeWrapper.style.opacity = '0';
    envelopeWrapper.style.pointerEvents = 'none';
    
    mainContent.classList.add('visible');
    
    // Trigger scroll reveals for cards within viewport immediately
    setTimeout(() => {
      triggerScrollReveals();
    }, 100);
    
    // Remove wrapper from screen space completely
    setTimeout(() => {
      envelopeWrapper.style.display = 'none';
    }, 1000);
  }

  // Wire fanned cards interactive buttons
  if (deckEnterBtn) {
    deckEnterBtn.addEventListener('click', enterSite);
  }
  
  if (deckMapBtn) {
    deckMapBtn.addEventListener('click', () => {
      openModal(mapModal);
    });
  }

  if (deckRsvpBtn) {
    deckRsvpBtn.addEventListener('click', () => {
      if (activeGuest) {
        // If guest is preloaded from URL, bypass search stage
        selectGuest(activeGuest);
        openModal(rsvpModal);
      } else {
        resetRsvpForm();
        openModal(rsvpModal);
      }
    });
  }

  // URL Query Parameters Guest Auto-loader
  function checkUrlForGuest() {
    const params = new URLSearchParams(window.location.search);
    const guestQuery = params.get('guest') || params.get('g');
    
    if (guestQuery) {
      fetch(`/api/guests/search?name=${encodeURIComponent(guestQuery)}`)
        .then(res => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then(matches => {
          if (matches && matches.length > 0) {
            // Take first matching guest
            const guest = matches[0];
            activeGuest = guest;
            
            const rsvpTitle = document.getElementById('deck-rsvp-title');
            const rsvpSubtitle = document.getElementById('deck-rsvp-subtitle');
            
            if (rsvpTitle) {
              rsvpTitle.textContent = guest.name;
              rsvpTitle.style.fontSize = '0.6rem';
            }
            if (rsvpSubtitle) {
              rsvpSubtitle.textContent = `Accès : ${guest.maxGuests} pers.`;
            }
            if (deckRsvpBtn) {
              if (guest.status === 'confirmed') {
                deckRsvpBtn.textContent = 'Modif. Réponse';
              } else if (guest.status === 'declined') {
                deckRsvpBtn.textContent = 'Modif. Réponse';
              } else {
                deckRsvpBtn.textContent = 'Répondre';
              }
            }
          }
        })
        .catch(err => {
          console.error("Error auto-loading guest details:", err);
        });
    }
  }

  // Run on page initialization
  checkUrlForGuest();

  // Grid Envelope (Save the Date) Interaction
  const gridWaxSealBtn = document.getElementById('grid-wax-seal-btn');
  const gridEnvelope = document.getElementById('grid-envelope');
  
  if (gridWaxSealBtn && gridEnvelope) {
    gridWaxSealBtn.addEventListener('click', () => {
      gridEnvelope.classList.toggle('open');
    });
  }

  // ==========================================================================
  // 4. Background Music Loop Controller
  // ==========================================================================
  function playMusic() {
    bgMusic.play()
      .then(() => {
        isPlaying = true;
        musicIcon.textContent = 'pause';
        musicToggle.classList.add('audio-playing');
      })
      .catch(err => {
        console.log("Autoplay music blocked: ", err);
      });
  }
  
  function toggleMusic() {
    if (isPlaying) {
      bgMusic.pause();
      isPlaying = false;
      musicIcon.textContent = 'music_note';
      musicToggle.classList.remove('audio-playing');
    } else {
      playMusic();
    }
  }
  
  musicToggle.addEventListener('click', toggleMusic);

  // ==========================================================================
  // 5. Wedding Countdown Ticker
  // ==========================================================================
  // Target: July 11, 2026 at 19:00:00 (Tunisian local/server time)
  const targetDate = new Date('July 11, 2026 19:00:00').getTime();
  
  function updateCountdown() {
    const now = new Date().getTime();
    const diff = targetDate - now;
    
    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      return;
    }
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    document.getElementById('days').textContent = days.toString().padStart(2, '0');
    document.getElementById('hours').textContent = hours.toString().padStart(2, '0');
    document.getElementById('minutes').textContent = minutes.toString().padStart(2, '0');
    document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
  }
  
  updateCountdown();
  setInterval(updateCountdown, 1000);

  // ==========================================================================
  // 6. Copy Bank RIB Code
  // ==========================================================================
  if (copyRibBtn) {
    copyRibBtn.addEventListener('click', () => {
      const code = document.getElementById('rib-code').textContent;
      
      navigator.clipboard.writeText(code)
        .then(() => {
          copyBtnText.textContent = 'RIB Copié !';
          copyRibBtn.style.backgroundColor = 'rgba(198, 167, 123, 0.15)';
          
          setTimeout(() => {
            copyBtnText.textContent = 'Copier le RIB';
            copyRibBtn.style.backgroundColor = '#ffffff';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
          // Fallback selection copy
          const tempArea = document.createElement('textarea');
          tempArea.value = code;
          document.body.appendChild(tempArea);
          tempArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempArea);
          
          copyBtnText.textContent = 'RIB Copié !';
          setTimeout(() => {
            copyBtnText.textContent = 'Copier le RIB';
          }, 2000);
        });
    });
  }

  // ==========================================================================
  // 7. Modals Overlay Controller
  // ==========================================================================
  function openModal(modalEl) {
    modalEl.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal(modalEl) {
    modalEl.classList.remove('active');
    document.body.style.overflow = '';
  }
  
  openMapBtn.addEventListener('click', () => openModal(mapModal));
  mapCloseBtn.addEventListener('click', () => closeModal(mapModal));
  
  openRsvpBtn.addEventListener('click', () => {
    resetRsvpForm();
    openModal(rsvpModal);
  });
  rsvpCloseBtn.addEventListener('click', () => closeModal(rsvpModal));
  
  // Background overlay click exit
  [mapModal, rsvpModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
  
  // Escape key exit
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(mapModal);
      closeModal(rsvpModal);
    }
  });

  // ==========================================================================
  // 8. Song Suggestion Submission
  // ==========================================================================
  if (songForm) {
    songForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      songSubmitBtn.disabled = true;
      songSubmitBtn.textContent = 'Envoi...';
      
      const payload = {
        name: document.getElementById('song-guest-name').value,
        title: document.getElementById('song-title').value,
        artist: document.getElementById('song-artist').value
      };
      
      fetch('/api/song', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      .then(res => {
        if (!res.ok) throw new Error('Error saving song request.');
        return res.json();
      })
      .then(data => {
        songResponse.textContent = 'Merci ! Votre suggestion a été ajoutée à notre playlist.';
        songResponse.className = 'form-response success';
        songResponse.classList.remove('hidden');
        songForm.reset();
      })
      .catch(err => {
        console.error(err);
        songResponse.textContent = 'Oups, un problème est survenu. Veuillez réessayer.';
        songResponse.className = 'form-response error';
        songResponse.classList.remove('hidden');
      })
      .finally(() => {
        songSubmitBtn.disabled = false;
        songSubmitBtn.textContent = 'Suggérer';
        
        setTimeout(() => {
          songResponse.classList.add('hidden');
        }, 5000);
      });
    });
  }

  // ==========================================================================
  // 9. Premium RSVP Guest List Flow
  // ==========================================================================
  const searchStage = document.getElementById('rsvp-stage-search');
  const confirmStage = document.getElementById('rsvp-stage-confirm');
  const successStage = document.getElementById('rsvp-stage-success');
  
  const searchInput = document.getElementById('guest-search-input');
  const searchBtn = document.getElementById('guest-search-btn');
  const searchErrorBox = document.getElementById('search-error-msg');
  
  const searchResultsDiv = document.getElementById('search-results');
  const resultsContainer = document.getElementById('results-container');
  
  const confirmForm = document.getElementById('rsvp-confirm-form');
  const seatsLimitText = document.getElementById('rsvp-seats-limit-text');
  const confirmedCountSelect = document.getElementById('rsvp-confirmed-count');
  const rsvpStatusRadios = document.getElementsByName('rsvp-status');
  const confirmedGuestsGroup = document.getElementById('confirmed-guests-group');
  
  function resetRsvpForm() {
    activeGuest = null;
    searchInput.value = '';
    searchErrorBox.classList.add('hidden');
    searchResultsDiv.classList.add('hidden');
    resultsContainer.innerHTML = '';
    
    confirmForm.reset();
    
    searchStage.classList.remove('hidden');
    confirmStage.classList.add('hidden');
    successStage.classList.add('hidden');
  }
  
  // Toggle guests attending number count based on status choice
  rsvpStatusRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'confirmed') {
        confirmedGuestsGroup.classList.remove('hidden');
      } else {
        confirmedGuestsGroup.classList.add('hidden');
      }
    });
  });
  
  // Search Action
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      showSearchError("Veuillez saisir votre nom pour rechercher.");
      return;
    }
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Recherche...';
    searchErrorBox.classList.add('hidden');
    searchResultsDiv.classList.add('hidden');
    resultsContainer.innerHTML = '';
    
    fetch(`/api/guests/search?name=${encodeURIComponent(query)}`)
      .then(res => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(matches => {
        if (matches.length === 0) {
          showSearchError("Désolé, nous n'avons trouvé aucun invité correspondant à ce nom. Veuillez vérifier l'orthographe.");
          return;
        }
        
        // Show matching lists
        searchResultsDiv.classList.remove('hidden');
        matches.forEach(guest => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-guest-result';
          btn.innerHTML = `${guest.name} <span class="material-symbols-outlined">arrow_forward_ios</span>`;
          btn.addEventListener('click', () => selectGuest(guest));
          resultsContainer.appendChild(btn);
        });
      })
      .catch(err => {
        showSearchError("Erreur de connexion lors de la recherche. Veuillez réessayer.");
      })
      .finally(() => {
        searchBtn.disabled = false;
        searchBtn.textContent = 'Rechercher';
      });
  }
  
  function showSearchError(msg) {
    searchErrorBox.textContent = msg;
    searchErrorBox.classList.remove('hidden');
  }
  
  // Select Guest from search results
  function selectGuest(guest) {
    activeGuest = guest;
    
    // Transition stage
    searchStage.classList.add('hidden');
    confirmStage.classList.remove('hidden');
    
    // Header
    document.getElementById('rsvp-guest-title-display').textContent = `Invitation pour ${guest.name}`;
    
    // Allowance limits info
    seatsLimitText.textContent = `Votre invitation comprend un maximum de ${guest.maxGuests} personne(s).`;
    
    // Populate seat select count
    confirmedCountSelect.innerHTML = '';
    for (let i = 1; i <= guest.maxGuests; i++) {
      const opt = document.createElement('option');
      opt.value = i;
      opt.textContent = `${i} personne(s)`;
      if (i === guest.maxGuests) opt.selected = true;
      confirmedCountSelect.appendChild(opt);
    }
    
    // Preset previous entries if any
    if (guest.status !== 'pending') {
      const isAttending = guest.status === 'confirmed';
      document.querySelector(`input[name="rsvp-status"][value="${guest.status}"]`).checked = true;
      
      if (isAttending) {
        confirmedGuestsGroup.classList.remove('hidden');
        confirmedCountSelect.value = guest.confirmedGuests || guest.maxGuests;
      } else {
        confirmedGuestsGroup.classList.add('hidden');
      }
      
      document.getElementById('rsvp-email').value = guest.email || '';
      document.getElementById('rsvp-dietary').value = guest.dietary || '';
      document.getElementById('rsvp-message').value = guest.message || '';
    } else {
      // Default reset
      document.querySelector('input[name="rsvp-status"][value="confirmed"]').checked = true;
      confirmedGuestsGroup.classList.remove('hidden');
      document.getElementById('rsvp-email').value = '';
      document.getElementById('rsvp-dietary').value = '';
      document.getElementById('rsvp-message').value = '';
    }
  }
  
  // Submit Confirmation details
  confirmForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!activeGuest) return;
    
    const submitBtn = confirmForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Envoi...';
    
    const rsvpStatus = document.querySelector('input[name="rsvp-status"]:checked').value;
    const confirmedCount = rsvpStatus === 'confirmed' ? parseInt(confirmedCountSelect.value) : 0;
    
    const payload = {
      guestId: activeGuest.id,
      status: rsvpStatus,
      confirmedGuests: confirmedCount,
      email: document.getElementById('rsvp-email').value.trim(),
      dietary: document.getElementById('rsvp-dietary').value.trim(),
      message: document.getElementById('rsvp-message').value.trim()
    };
    
    fetch('/api/guests/confirm', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    .then(res => {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(data => {
      // Success
      confirmStage.classList.add('hidden');
      successStage.classList.remove('hidden');
      
      const updatedGuest = data.guest;
      activeGuest = updatedGuest; // Update active state locally
      
      // Update deck card RSVP button text to reflect updated state
      if (deckRsvpBtn) {
        deckRsvpBtn.textContent = 'Modif. Réponse';
      }
      
      document.getElementById('rsvp-success-thank-you').textContent = `Merci ${updatedGuest.name} ! Votre réponse a bien été prise en compte.`;
      
      const badge = document.getElementById('summary-status-badge');
      if (updatedGuest.status === 'confirmed') {
        badge.textContent = 'Présent';
        badge.style.color = 'var(--gold-dark)';
        document.getElementById('summary-guests-line').classList.remove('hidden');
        document.getElementById('summary-guests-count').textContent = updatedGuest.confirmedGuests;
      } else {
        badge.textContent = 'Absent';
        badge.style.color = '#ef4444';
        document.getElementById('summary-guests-line').classList.add('hidden');
      }
    })
    .catch(err => {
      console.error(err);
      alert("Une erreur est survenue lors de la confirmation. Veuillez réessayer.");
    })
    .finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirmer';
    });
  });
  
  document.getElementById('success-done-btn').addEventListener('click', () => {
    closeModal(rsvpModal);
  });

  // ==========================================================================
  // 10. Card Fade & Scroll Reveal Engine
  // ==========================================================================
  const observerOptions = {
    root: null,
    threshold: 0.05,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const cardObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  function triggerScrollReveals() {
    const revealCards = document.querySelectorAll('.reveal-card');
    revealCards.forEach(card => {
      cardObserver.observe(card);
      
      // Fallback for items that are already visible in viewport initially
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight) {
        card.classList.add('revealed');
      }
    });
  }
});
