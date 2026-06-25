document.addEventListener('DOMContentLoaded', () => {
  
  const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz5n5-RrzdaNefnWm7l-kUMR2mP9VpkECkamka0yagbAZUOJPDva6yboNIJus8Gklft/exec";
  
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
      this.size = Math.random() * 3.5 + 0.5; // Slightly larger for soft pearl bokeh
      this.speedY = Math.random() * 0.5 + 0.15;
      this.speedX = Math.random() * 0.3 - 0.15;
      this.opacity = Math.random() * 0.5 + 0.15;
      this.wobble = Math.random() * Math.PI;
      this.wobbleSpeed = Math.random() * 0.015 + 0.003;
      this.type = Math.random() > 0.35 ? 'pearl' : 'gold'; // Mix of pearl and gold
    }
    
    update() {
      this.y -= this.speedY;
      this.wobble += this.wobbleSpeed;
      this.x += this.speedX + Math.sin(this.wobble) * 0.12;
      
      if (this.y < -10 || this.x < -10 || this.x > canvas.width + 10) {
        this.reset();
      }
    }
    
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      if (this.type === 'pearl') {
        // Soft white pearlescent bokeh bubble
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity * 0.6})`;
        ctx.shadowBlur = this.size * 2;
        ctx.shadowColor = 'rgba(255, 255, 255, 0.4)';
      } else {
        // Champagne gold dust speck
        ctx.fillStyle = `rgba(205, 179, 145, ${this.opacity})`;
        ctx.shadowBlur = this.size * 1.5;
        ctx.shadowColor = 'rgba(205, 179, 145, 0.3)';
      }
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
  
  const rsvpModal = document.getElementById('rsvp-modal');
  const rsvpCloseBtn = document.getElementById('rsvp-close-btn');
  
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
    
    // Show the downward arrow inside the envelope scene after a small delay
    const envNavArrow = document.getElementById('envelope-nav-arrow');
    if (envNavArrow) {
      setTimeout(() => {
        envNavArrow.classList.add('visible');
      }, 1500);
    }
  });

  // Action: Enter the main scrolling invitation website
  function enterSite() {
    envelopeWrapper.style.opacity = '0';
    envelopeWrapper.style.pointerEvents = 'none';
    
    mainContent.classList.add('visible');
    
    // Show back button, hide down arrow
    const backBtn = document.getElementById('floating-back-btn-container');
    if (backBtn) backBtn.classList.add('visible');
    
    const envNavArrow = document.getElementById('envelope-nav-arrow');
    if (envNavArrow) envNavArrow.classList.remove('visible');

    // Trigger scroll reveals for cards within viewport immediately
    setTimeout(() => {
      triggerScrollReveals();
    }, 100);
    
    // Hide wrapper after transition completes
    setTimeout(() => {
      envelopeWrapper.style.display = 'none';
    }, 1000);
  }

  // Action: Return to the envelope page
  function showEnvelope() {
    // Reveal envelope wrapper first
    envelopeWrapper.style.display = 'flex';
    
    // Hide back button
    const backBtn = document.getElementById('floating-back-btn-container');
    if (backBtn) backBtn.classList.remove('visible');

    // Show down arrow inside envelope again
    const envNavArrow = document.getElementById('envelope-nav-arrow');
    if (envNavArrow) {
      setTimeout(() => {
        envNavArrow.classList.add('visible');
      }, 1000);
    }

    setTimeout(() => {
      envelopeWrapper.style.opacity = '1';
      envelopeWrapper.style.pointerEvents = 'auto';
      mainContent.classList.remove('visible');
      
      // Scroll back to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);
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
        selectGuest(activeGuest);
        openModal(rsvpModal);
      } else {
        resetRsvpForm();
        openModal(rsvpModal);
      }
    });
  }

  // Wire downward nav arrow button
  const scrollToDetailsBtn = document.getElementById('scroll-to-details-btn');
  if (scrollToDetailsBtn) {
    scrollToDetailsBtn.addEventListener('click', enterSite);
  }

  // Wire back to envelope button
  const backToEnvelopeBtn = document.getElementById('back-to-envelope-btn');
  if (backToEnvelopeBtn) {
    backToEnvelopeBtn.addEventListener('click', showEnvelope);
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
  if (rsvpCloseBtn) {
    rsvpCloseBtn.addEventListener('click', () => closeModal(rsvpModal));
  }
  
  // Background overlay click exit
  [mapModal, rsvpModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeModal(modal);
        }
      });
    }
  });
  
  // Escape key exit
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal(mapModal);
      closeModal(rsvpModal);
      closeLightbox();
    }
  });

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
    if (searchInput) searchInput.value = '';
    if (searchErrorBox) searchErrorBox.classList.add('hidden');
    if (searchResultsDiv) searchResultsDiv.classList.add('hidden');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
    if (confirmForm) confirmForm.reset();
    
    if (searchStage) searchStage.classList.remove('hidden');
    if (confirmStage) confirmStage.classList.add('hidden');
    if (successStage) successStage.classList.add('hidden');
  }
  
  // Toggle guests attending number count based on status choice
  rsvpStatusRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
      if (e.target.value === 'confirmed') {
        if (confirmedGuestsGroup) confirmedGuestsGroup.classList.remove('hidden');
      } else {
        if (confirmedGuestsGroup) confirmedGuestsGroup.classList.add('hidden');
      }
    });
  });
  
  // Search Action
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
  if (searchInput) {
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
  }
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) {
      showSearchError("Veuillez saisir votre nom pour rechercher.");
      return;
    }
    
    searchBtn.disabled = true;
    searchBtn.textContent = 'Recherche...';
    if (searchErrorBox) searchErrorBox.classList.add('hidden');
    if (searchResultsDiv) searchResultsDiv.classList.add('hidden');
    if (resultsContainer) resultsContainer.innerHTML = '';
    
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
        if (searchResultsDiv) searchResultsDiv.classList.remove('hidden');
        matches.forEach(guest => {
          const btn = document.createElement('button');
          btn.type = 'button';
          btn.className = 'btn-guest-result';
          btn.innerHTML = `${guest.name} <span class="material-symbols-outlined">arrow_forward_ios</span>`;
          btn.addEventListener('click', () => selectGuest(guest));
          if (resultsContainer) resultsContainer.appendChild(btn);
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
    if (searchErrorBox) {
      searchErrorBox.textContent = msg;
      searchErrorBox.classList.remove('hidden');
    }
  }
  
  // Select Guest from search results
  function selectGuest(guest) {
    activeGuest = guest;
    
    // Transition stage
    if (searchStage) searchStage.classList.add('hidden');
    if (confirmStage) confirmStage.classList.remove('hidden');
    
    // Header
    const displayEl = document.getElementById('rsvp-guest-title-display');
    if (displayEl) displayEl.textContent = `Invitation pour ${guest.name}`;
    
    // Allowance limits info
    if (seatsLimitText) seatsLimitText.textContent = `Votre invitation comprend un maximum de ${guest.maxGuests} personne(s).`;
    
    // Populate seat select count
    if (confirmedCountSelect) {
      confirmedCountSelect.innerHTML = '';
      for (let i = 1; i <= guest.maxGuests; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = `${i} personne(s)`;
        if (i === guest.maxGuests) opt.selected = true;
        confirmedCountSelect.appendChild(opt);
      }
    }
    
    // Preset previous entries if any
    if (guest.status !== 'pending') {
      const isAttending = guest.status === 'confirmed';
      const statusInput = document.querySelector(`input[name="rsvp-status"][value="${guest.status}"]`);
      if (statusInput) statusInput.checked = true;
      
      if (isAttending) {
        if (confirmedGuestsGroup) confirmedGuestsGroup.classList.remove('hidden');
        if (confirmedCountSelect) confirmedCountSelect.value = guest.confirmedGuests || guest.maxGuests;
      } else {
        if (confirmedGuestsGroup) confirmedGuestsGroup.classList.add('hidden');
      }
      
      const emailEl = document.getElementById('rsvp-email');
      const dietaryEl = document.getElementById('rsvp-dietary');
      const msgEl = document.getElementById('rsvp-message');
      
      if (emailEl) emailEl.value = guest.email || '';
      if (dietaryEl) dietaryEl.value = guest.dietary || '';
      if (msgEl) msgEl.value = guest.message || '';
    } else {
      // Default reset
      const statusInput = document.querySelector('input[name="rsvp-status"][value="confirmed"]');
      if (statusInput) statusInput.checked = true;
      if (confirmedGuestsGroup) confirmedGuestsGroup.classList.remove('hidden');
      
      const emailEl = document.getElementById('rsvp-email');
      const dietaryEl = document.getElementById('rsvp-dietary');
      const msgEl = document.getElementById('rsvp-message');
      
      if (emailEl) emailEl.value = '';
      if (dietaryEl) dietaryEl.value = '';
      if (msgEl) msgEl.value = '';
    }
  }
  
  // Submit Confirmation details
  if (confirmForm) {
    confirmForm.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!activeGuest) return;
      
      const submitBtn = confirmForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Envoi...';
      }
      
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
        if (confirmStage) confirmStage.classList.add('hidden');
        if (successStage) successStage.classList.remove('hidden');
        
        const updatedGuest = data.guest;
        activeGuest = updatedGuest; // Update active state locally
        
        // Update deck card RSVP button text to reflect updated state
        if (deckRsvpBtn) {
          deckRsvpBtn.textContent = 'Modif. Réponse';
        }
        
        const successThankYou = document.getElementById('rsvp-success-thank-you');
        if (successThankYou) successThankYou.textContent = `Merci ${updatedGuest.name} ! Votre réponse a bien été prise en compte.`;
        
        const badge = document.getElementById('summary-status-badge');
        if (badge) {
          if (updatedGuest.status === 'confirmed') {
            badge.textContent = 'Présent';
            badge.style.color = 'var(--gold-dark)';
            const summaryLine = document.getElementById('summary-guests-line');
            const summaryCount = document.getElementById('summary-guests-count');
            if (summaryLine) summaryLine.classList.remove('hidden');
            if (summaryCount) summaryCount.textContent = updatedGuest.confirmedGuests;
          } else {
            badge.textContent = 'Absent';
            badge.style.color = '#ef4444';
            const summaryLine = document.getElementById('summary-guests-line');
            if (summaryLine) summaryLine.classList.add('hidden');
          }
        }
      })
      .catch(err => {
        console.error(err);
        alert("Une erreur est survenue lors de la confirmation. Veuillez réessayer.");
      })
      .finally(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Confirmer';
        }
      });
    });
  }
  
  const successDoneBtn = document.getElementById('success-done-btn');
  if (successDoneBtn) {
    successDoneBtn.addEventListener('click', () => {
      closeModal(rsvpModal);
    });
  }

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

  // ==========================================================================
  // 11. Image Upload & Gallery Engine (Google Drive & Local Node Backend)
  // ==========================================================================
  const deckUploadZone = document.getElementById('deck-upload-zone');
  const deckPhotoInput = document.getElementById('deck-photo-input');
  const deckShareBtn = document.getElementById('deck-share-btn');
  const lightboxModal = document.getElementById('lightbox-modal');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCloseBtn = document.getElementById('lightbox-close-btn');
  const galleryGrid = document.getElementById('gallery-grid');

  function uploadPhoto(file) {
    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner un fichier image (JPG, PNG, WEBP, GIF).');
      return;
    }
    
    if (file.size > 10 * 1024 * 1024) {
      alert('La taille de l\'image ne doit pas dépasser 10 Mo.');
      return;
    }

    const uploadIcon = deckUploadZone ? deckUploadZone.querySelector('span') : null;
    const uploadText = deckUploadZone ? deckUploadZone.querySelector('p') : null;

    const originalIcon = uploadIcon ? uploadIcon.textContent : 'add_a_photo';
    const originalText = uploadText ? uploadText.textContent : 'Glissez-déposez ou cliquez';

    if (uploadIcon) {
      uploadIcon.textContent = 'sync';
      uploadIcon.classList.add('spin');
    }
    if (uploadText) {
      uploadText.textContent = 'Envoi...';
    }

    const reader = new FileReader();
    reader.onload = function(e) {
      const dataUrl = e.target.result;
      const base64Raw = dataUrl.split(',')[1];
      
      const appsScriptPayload = {
        base64: base64Raw,
        mimeType: file.type,
        fileName: file.name
      };

      fetch(APPS_SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8'
        },
        body: JSON.stringify(appsScriptPayload)
      })
      .then(res => res.json())
      .then(driveData => {
        if (driveData.success) {
          if (uploadIcon) {
            uploadIcon.classList.remove('spin');
            uploadIcon.textContent = 'check_circle';
          }
          if (uploadText) {
            uploadText.textContent = 'Téléversé !';
          }
        } else {
          throw new Error(driveData.error || 'Server error');
        }
      })
      .catch(err => {
        console.error('Upload failed:', err);
        if (uploadIcon) {
          uploadIcon.classList.remove('spin');
          uploadIcon.textContent = 'error';
        }
        if (uploadText) {
          uploadText.textContent = 'Erreur !';
        }
      })
      .finally(() => {
        setTimeout(() => {
          if (uploadIcon) {
            uploadIcon.classList.remove('spin');
            uploadIcon.textContent = originalIcon;
          }
          if (uploadText) {
            uploadText.textContent = originalText;
          }
        }, 3000);
      });
    };
    
    reader.onerror = function() {
      alert('Échec de la lecture du fichier.');
      if (uploadIcon) {
        uploadIcon.classList.remove('spin');
        uploadIcon.textContent = originalIcon;
      }
      if (uploadText) {
        uploadText.textContent = originalText;
      }
    };
    
    reader.readAsDataURL(file);
  }

  function setupDragDrop(zone) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, (e) => {
        e.preventDefault();
        e.stopPropagation();
      }, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.add('drag-over'), false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      zone.addEventListener(eventName, () => zone.classList.remove('drag-over'), false);
    });

    zone.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files.length > 0) {
        uploadPhoto(files[0]);
      }
    });
  }

  if (deckUploadZone && deckPhotoInput) {
    deckUploadZone.addEventListener('click', () => deckPhotoInput.click());
    deckPhotoInput.addEventListener('change', () => {
      if (deckPhotoInput.files.length > 0) {
        uploadPhoto(deckPhotoInput.files[0]);
      }
    });
    setupDragDrop(deckUploadZone);
  }

  // Lightbox controllers
  function openLightbox(photoUrl) {
    if (lightboxImg && lightboxModal) {
      lightboxImg.src = photoUrl;
      lightboxModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  // Handle gallery grid item clicks using event delegation
  if (galleryGrid) {
    galleryGrid.addEventListener('click', (e) => {
      const item = e.target.closest('.gallery-item');
      if (item) {
        const img = item.querySelector('img');
        if (img) {
          openLightbox(img.getAttribute('src'));
        }
      }
    });
  }

  function closeLightbox() {
    if (lightboxModal) {
      lightboxModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (lightboxModal) {
    lightboxModal.addEventListener('click', (e) => {
      if (e.target === lightboxModal) {
        closeLightbox();
      }
    });
  }

  // Copy website link logic for Share Card
  if (deckShareBtn) {
    deckShareBtn.addEventListener('click', () => {
      const siteUrl = "https://invitation-rm.netlify.app/";
      navigator.clipboard.writeText(siteUrl)
        .then(() => {
          deckShareBtn.textContent = 'Lien Copié !';
          deckShareBtn.style.backgroundColor = 'var(--gold-dark)';
          setTimeout(() => {
            deckShareBtn.textContent = 'Copier le Lien';
            deckShareBtn.style.backgroundColor = 'var(--gold)';
          }, 2000);
        })
        .catch(err => {
          console.error('Failed to copy link:', err);
          const tempArea = document.createElement('textarea');
          tempArea.value = siteUrl;
          document.body.appendChild(tempArea);
          tempArea.select();
          document.execCommand('copy');
          document.body.removeChild(tempArea);
          
          deckShareBtn.textContent = 'Lien Copié !';
          setTimeout(() => {
            deckShareBtn.textContent = 'Copier le Lien';
          }, 2000);
        });
    });
  }

  // 12. Zoom Card functionality for mobile/desktop legibility
  const cardDeck = document.querySelector('.envelope-card-deck');
  const cards = document.querySelectorAll('.deck-card');

  if (cardDeck && cards.length > 0) {
    cards.forEach(card => {
      card.addEventListener('click', (e) => {
        // Only trigger if envelope is open
        if (!envelope.classList.contains('open')) return;

        // If clicked on an interactive button, input, or drag-zone, don't toggle zoom
        if (e.target.closest('.deck-card-btn') || 
            e.target.closest('.btn-share-action') || 
            e.target.closest('#deck-photo-input') || 
            e.target.closest('#deck-upload-zone')) {
          return;
        }

        e.stopPropagation();

        const isZoomed = card.classList.contains('active-zoom');

        // Reset other zoomed cards
        cards.forEach(c => c.classList.remove('active-zoom'));

        if (!isZoomed) {
          card.classList.add('active-zoom');
          cardDeck.classList.add('has-zoomed-card');
        } else {
          cardDeck.classList.remove('has-zoomed-card');
        }
      });
    });

    // Close zoom when clicking the backdrop overlay
    cardDeck.addEventListener('click', (e) => {
      if (e.target === cardDeck) {
        cards.forEach(c => c.classList.remove('active-zoom'));
        cardDeck.classList.remove('has-zoomed-card');
      }
    });
  }
});
