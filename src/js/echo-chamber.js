/**
 * Echo Chamber //回声室 - Main JavaScript
 * A postmodern philosophical experience
 */

class EchoChamber {
  constructor() {
    this.quotes = [];
    this.echoes = new Map();
    this.currentFilter = 'all';
    this.isInitialized = false;
    this.selectedQuoteId = null;
    
    // Performance tracking
    this.performanceMetrics = {
      loadStart: performance.now(),
      interactionCount: 0
    };
    
    // Initialize the chamber
    this.init();
  }

  async init() {
    try {
      // Hide loading screen after minimum display time
      setTimeout(() => this.hideLoadingScreen(), 1500);
      
      // Load quotes data
      await this.loadQuotes();
      
      // Set up event listeners
      this.setupEventListeners();
      
      // Initialize filters
      this.initializeFilters();
      
      // Start background animations
      this.startBackgroundAnimations();
      
      // Load saved theme
      this.loadSavedTheme();
      
      // Mark as initialized
      this.isInitialized = true;
      
      // Performance tracking
      this.performanceMetrics.loadEnd = performance.now();
      this.logPerformance('Initial load', this.performanceMetrics.loadEnd - this.performanceMetrics.loadStart);
      
      // Announce ready state for screen readers
      this.announceToScreenReader('Echo Chamber is ready. Explore philosophical quotes and add your echoes.');
      
    } catch (error) {
      console.error('Failed to initialize Echo Chamber:', error);
      this.showError('Failed to initialize the philosophical resonance. Please refresh and try again.');
    }
  }

  hideLoadingScreen() {
    const loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.classList.add('hidden');
      setTimeout(() => {
        loadingScreen.style.display = 'none';
      }, 600);
    }
  }

  async loadQuotes() {
    try {
      // In a static site, quotes are already available in the DOM
      // We'll extract them and enhance with dynamic features
      const quoteElements = document.querySelectorAll('.quote-entity');
      
      quoteElements.forEach((element, index) => {
        const quoteData = {
          id: element.dataset.id || index + 1,
          text: element.querySelector('.quote-text')?.textContent || '',
          translation: element.querySelector('.quote-translation')?.textContent || '',
          author: element.querySelector('.author-name')?.textContent || '',
          period: element.dataset.period || 'Unknown',
          category: element.dataset.category || 'general',
          language: element.querySelector('.quote-text')?.getAttribute('lang') || 'en'
        };
        
        this.quotes.push(quoteData);
        this.echoes.set(quoteData.id, []);
      });
      
      console.log(`Loaded ${this.quotes.length} quotes`);
    } catch (error) {
      console.error('Error loading quotes:', error);
      throw error;
    }
  }

  setupEventListeners() {
    // Echo triggers
    document.addEventListener('click', (e) => {
      if (e.target.closest('.echo-trigger')) {
        const trigger = e.target.closest('.echo-trigger');
        const quoteId = trigger.dataset.quoteId;
        this.handleEchoTrigger(quoteId);
      }
    });

    // Filter navigation
    document.addEventListener('click', (e) => {
      if (e.target.closest('.nav-crystal')) {
        const crystal = e.target.closest('.nav-crystal');
        const filter = crystal.dataset.filter;
        this.applyFilter(filter, crystal);
      }
    });

    // Generate more quotes
    const generateButton = document.getElementById('generateMore');
    if (generateButton) {
      generateButton.addEventListener('click', () => this.generateMoreQuotes());
    }

    // Echo form handling
    const echoForm = document.getElementById('echoForm');
    if (echoForm) {
      echoForm.addEventListener('submit', (e) => this.handleEchoSubmit(e));
    }

    const echoCancel = document.getElementById('echoCancel');
    if (echoCancel) {
      echoCancel.addEventListener('click', () => this.hideEchoForm());
    }

    // Theme toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    // Philosophy orb click - using arrow function to preserve 'this' context
    const philosophyOrb = document.querySelector('.philosophy-orb');
    console.log('Philosophy orb found:', philosophyOrb);
    if (philosophyOrb) {
      const handleOrbClickBound = () => {
        console.log('Philosophy orb clicked! Context:', this);
        this.handleOrbClick();
      };
      
      philosophyOrb.addEventListener('click', (e) => {
        console.log('Philosophy orb click event fired!');
        e.preventDefault();
        e.stopPropagation();
        handleOrbClickBound();
      });
      
      // Also add keyboard support
      philosophyOrb.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          console.log('Philosophy orb activated with keyboard!');
          handleOrbClickBound();
        }
      });
      
      // Test click handler directly
      console.log('Testing orb click handler directly...');
      setTimeout(() => {
        console.log('Direct handleOrbClick test:');
        this.handleOrbClick();
      }, 2000);
      
      console.log('Philosophy orb event listeners added');
    } else {
      console.error('Philosophy orb not found!');
    }

    // Keyboard navigation
    document.addEventListener('keydown', (e) => this.handleKeyboardNavigation(e));

    // Accessibility enhancements
    this.setupAccessibilityFeatures();
  }

  handleEchoTrigger(quoteId) {
    this.performanceMetrics.interactionCount++;
    
    // Add visual feedback
    const trigger = document.querySelector(`[data-quote-id="${quoteId}"]`);
    if (trigger) {
      trigger.classList.add('triggered');
      setTimeout(() => trigger.classList.remove('triggered'), 300);
    }

    // Show echo form
    this.selectedQuoteId = quoteId;
    this.showEchoForm();
    
    // Log interaction
    this.logInteraction('echo_trigger', { quoteId });
  }

  showEchoForm() {
    const container = document.getElementById('echoInputContainer');
    const input = document.getElementById('echoInput');
    
    if (container && input) {
      container.style.display = 'block';
      setTimeout(() => {
        input.focus();
        this.announceToScreenReader('Echo form opened. Type your response to this quote.');
      }, 100);
    }
  }

  hideEchoForm() {
    const container = document.getElementById('echoInputContainer');
    const input = document.getElementById('echoInput');
    
    if (container && input) {
      container.style.display = 'none';
      input.value = '';
      this.selectedQuoteId = null;
    }
  }

  handleEchoSubmit(e) {
    e.preventDefault();
    
    const input = document.getElementById('echoInput');
    const echoText = input.value.trim();
    
    if (echoText && this.selectedQuoteId) {
      const echo = {
        id: Date.now(),
        text: echoText,
        timestamp: new Date(),
        quoteId: this.selectedQuoteId
      };
      
      // Add echo to data
      if (!this.echoes.has(this.selectedQuoteId)) {
        this.echoes.set(this.selectedQuoteId, []);
      }
      this.echoes.get(this.selectedQuoteId).push(echo);
      
      // Update UI
      this.updateEchoCount(this.selectedQuoteId);
      this.addEchoToStream(echo);
      
      // Hide form
      this.hideEchoForm();
      
      // Announce success
      this.announceToScreenReader('Echo added successfully. Your thought has been captured in the chamber.');
      
      // Log interaction
      this.logInteraction('echo_added', { 
        quoteId: this.selectedQuoteId, 
        echoLength: echoText.length 
      });
      
      // Animate the quote card
      this.animateQuoteCard(this.selectedQuoteId);
    }
  }

  updateEchoCount(quoteId) {
    const countElement = document.querySelector(`[data-quote-id="${quoteId}"]`)
      ?.closest('.quote-entity')
      ?.querySelector('.count-number');
    
    if (countElement) {
      const count = this.echoes.get(quoteId)?.length || 0;
      countElement.textContent = count;
      
      // Add pulse animation
      countElement.classList.add('pulse');
      setTimeout(() => countElement.classList.remove('pulse'), 500);
    }
  }

  addEchoToStream(echo) {
    const stream = document.getElementById('echoStream');
    const placeholder = stream?.querySelector('.echo-placeholder');
    
    if (stream) {
      // Remove placeholder if it exists
      if (placeholder) {
        placeholder.remove();
      }
      
      // Create echo element
      const echoElement = this.createEchoElement(echo);
      stream.insertBefore(echoElement, stream.firstChild);
      
      // Animate in
      setTimeout(() => {
        echoElement.classList.add('visible');
      }, 10);
      
      // Limit number of visible echoes
      const echoes = stream.querySelectorAll('.echo-item');
      if (echoes.length > 10) {
        echoes[echoes.length - 1].remove();
      }
    }
  }

  createEchoElement(echo) {
    const quote = this.quotes.find(q => q.id == echo.quoteId);
    const element = document.createElement('div');
    element.className = 'echo-item';
    element.innerHTML = `
      <div class="echo-content">
        <p class="echo-text">${this.escapeHtml(echo.text)}</p>
        <div class="echo-meta">
          <span class="echo-quote">In response to: "${quote?.author || 'Unknown'}"</span>
          <time class="echo-time">${this.formatTime(echo.timestamp)}</time>
        </div>
      </div>
      <div class="echo-pulse" aria-hidden="true"></div>
    `;
    return element;
  }

  animateQuoteCard(quoteId) {
    const card = document.querySelector(`[data-id="${quoteId}"]`);
    if (card) {
      card.classList.add('echo-added');
      setTimeout(() => card.classList.remove('echo-added'), 1000);
    }
  }

  applyFilter(filter, crystalElement) {
    this.currentFilter = filter;
    
    // Update active state
    document.querySelectorAll('.nav-crystal').forEach(crystal => {
      crystal.classList.remove('active');
      crystal.setAttribute('aria-pressed', 'false');
    });
    
    crystalElement.classList.add('active');
    crystalElement.setAttribute('aria-pressed', 'true');
    
    // Filter quote entities
    const quotes = document.querySelectorAll('.quote-entity');
    let visibleCount = 0;
    
    quotes.forEach(quote => {
      const category = quote.dataset.category;
      const shouldShow = filter === 'all' || category === filter;
      
      // Use opacity and transform for smooth transitions
      if (shouldShow) {
        quote.style.display = 'block';
        quote.style.opacity = '1';
        quote.style.transform = 'translateY(0)';
        visibleCount++;
      } else {
        quote.style.opacity = '0';
        quote.style.transform = 'translateY(-20px)';
        setTimeout(() => {
          if (quote.style.opacity === '0') {
            quote.style.display = 'none';
          }
        }, 300);
      }
    });
    
    // Announce filter change
    this.announceToScreenReader(`Filter applied: ${filter}. Showing ${visibleCount} quotes.`);
    
    // Log interaction
    this.logInteraction('filter_applied', { filter, visibleCount });
    console.log(`Filter applied: ${filter}, showing ${visibleCount} quotes`);
  }

  generateMoreQuotes() {
    const button = document.getElementById('generateMore');
    if (button) {
      // Add loading state
      const originalText = button.querySelector('.control-text').textContent;
      button.querySelector('.control-text').textContent = 'Summoning...';
      button.disabled = true;
      button.style.opacity = '0.7';
      
      console.log('Generating more quotes...');
      
      // Simulate loading (in real app, this would fetch new quotes)
      setTimeout(() => {
        // Shuffle existing quotes to create illusion of new content
        this.shuffleQuotes();
        
        // Add some visual feedback
        const quotes = document.querySelectorAll('.quote-entity');
        quotes.forEach((quote, index) => {
          setTimeout(() => {
            quote.style.animation = 'quote-appear 0.5s ease-out';
          }, index * 100);
        });
        
        // Reset button
        button.querySelector('.control-text').textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
        
        this.announceToScreenReader('New philosophical thoughts have emerged in the chamber.');
        console.log('Quote shuffle complete');
      }, 2000);
    }
    
    this.logInteraction('generate_more_quotes');
  }

  shuffleQuotes() {
    const container = document.querySelector('.universe-grid');
    const quotes = Array.from(container.children);
    
    // Shuffle array
    for (let i = quotes.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [quotes[i], quotes[j]] = [quotes[j], quotes[i]];
    }
    
    // Re-append in new order
    quotes.forEach(quote => container.appendChild(quote));
  }

  initializeFilters() {
    // Set initial filter state
    const allFilter = document.querySelector('[data-filter="all"]');
    if (allFilter) {
      allFilter.classList.add('active');
      allFilter.setAttribute('aria-pressed', 'true');
    }
  }

  loadSavedTheme() {
    const savedTheme = localStorage.getItem('echo-chamber-theme') || 'dark';
    const html = document.documentElement;
    const button = document.getElementById('themeToggle');
    
    html.setAttribute('data-theme', savedTheme);
    if (button) {
      button.setAttribute('aria-pressed', savedTheme === 'light' ? 'true' : 'false');
    }
    
    console.log('Loaded theme:', savedTheme);
  }

  toggleTheme() {
    const html = document.documentElement;
    const button = document.getElementById('themeToggle');
    
    // Check current theme
    const currentTheme = html.getAttribute('data-theme') || 'dark';
    
    if (currentTheme === 'dark') {
      html.setAttribute('data-theme', 'light');
      if (button) button.setAttribute('aria-pressed', 'true');
      this.announceToScreenReader('Switched to light theme');
    } else {
      html.setAttribute('data-theme', 'dark');
      if (button) button.setAttribute('aria-pressed', 'false');
      this.announceToScreenReader('Switched to dark theme');
    }
    
    // Save preference
    localStorage.setItem('echo-chamber-theme', html.getAttribute('data-theme'));
    
    console.log('Theme toggled to:', html.getAttribute('data-theme'));
    this.logInteraction('theme_toggle', { theme: html.getAttribute('data-theme') });
  }

  startBackgroundAnimations() {
    // Add subtle parallax effect to background elements
    let ticking = false;
    
    const updateBackground = () => {
      const scrollY = window.pageYOffset;
      const particles = document.querySelector('.bg-particles');
      const waves = document.querySelector('.bg-waves');
      
      if (particles) {
        particles.style.transform = `translateY(${scrollY * 0.1}px)`;
      }
      
      if (waves) {
        waves.style.transform = `translateY(${scrollY * 0.05}px)`;
      }
      
      ticking = false;
    };
    
    const requestTick = () => {
      if (!ticking) {
        requestAnimationFrame(updateBackground);
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', requestTick, { passive: true });
  }

  handleKeyboardNavigation(e) {
    // ESC key closes echo form
    if (e.key === 'Escape' && this.selectedQuoteId) {
      this.hideEchoForm();
    }
    
    // Enter key in echo form submits
    if (e.key === 'Enter' && e.ctrlKey && this.selectedQuoteId) {
      const form = document.getElementById('echoForm');
      if (form) {
        form.dispatchEvent(new Event('submit'));
      }
    }
  }

  setupAccessibilityFeatures() {
    // Add ARIA live region for dynamic announcements
    const announcements = document.getElementById('announcements');
    if (!announcements) {
      const liveRegion = document.createElement('div');
      liveRegion.id = 'announcements';
      liveRegion.className = 'sr-only';
      liveRegion.setAttribute('aria-live', 'polite');
      document.body.appendChild(liveRegion);
    }
    
    // Enhance quote cards with proper ARIA
    document.querySelectorAll('.quote-entity').forEach((card, index) => {
      card.setAttribute('role', 'article');
      card.setAttribute('aria-labelledby', `quote-${index}-author`);
      
      const author = card.querySelector('.author-name');
      if (author) {
        author.id = `quote-${index}-author`;
      }
    });
  }

  announceToScreenReader(message) {
    const announcements = document.getElementById('announcements');
    if (announcements) {
      announcements.textContent = message;
      setTimeout(() => {
        announcements.textContent = '';
      }, 1000);
    }
  }

  // Utility functions
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatTime(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  }

  logInteraction(action, data = {}) {
    if (!navigator.doNotTrack) {
      console.log('Interaction:', action, data);
      // In a real app, this would send to analytics
    }
  }

  logPerformance(label, duration) {
    console.log(`Performance - ${label}: ${duration.toFixed(2)}ms`);
  }

  handleOrbClick() {
    console.log('handleOrbClick called');
    // Show a random philosophical inspiration from postmodern philosophers in original languages
    const inspirations = [
      "Cogito ergo sum... (Descartes)",
      "L'existence précède l'essence... (Sartre)",
      "Was mich nicht umbringt... (Nietzsche)",
      "La liberté, c'est le choix... (Sartre)",
      "Être-pour-la-mort... (Heidegger)",
      "L'enfer, c'est les autres... (Sartre)",
      "Die Grenzen meiner Sprache... (Wittgenstein)",
      "Nous ne savons jamais d'avance... (Deleuze)",
      "The obscenity of the superego... (Žižek)",
      "Il n'y a pas de hors-texte... (Derrida)",
      "Le pouvoir, ce n'est pas... (Foucault)",
      "La carte précède le territoire... (Baudrillard)",
      "La différance n'est ni un mot... (Derrida)",
      "Savoir c'est pouvoir... (Foucault)",
      "La fin des grands récits... (Lyotard)",
      "Le désert du réel... (Baudrillard)",
      "Wovon man nicht sprechen kann... (Wittgenstein)",
      "Gott ist tot... (Nietzsche)",
      "Das Sein selbst bleibt... (Heidegger)",
      "L'inconscient est structuré... (Lacan)"
    ];
    
    const randomInspiration = inspirations[Math.floor(Math.random() * inspirations.length)];
    console.log('Random inspiration:', randomInspiration);
    this.showTooltip(randomInspiration);
    this.logInteraction('orb_clicked');
  }

  showTooltip(message) {
    console.log('showTooltip called with message:', message);
    
    // Remove existing tooltip
    const existingTooltip = document.querySelector('.orb-tooltip');
    if (existingTooltip) {
      console.log('Removing existing tooltip');
      existingTooltip.remove();
    }

    // Create new tooltip
    const tooltip = document.createElement('div');
    tooltip.className = 'orb-tooltip';
    tooltip.textContent = message;
    console.log('Created tooltip element:', tooltip);
    
    const orb = document.querySelector('.philosophy-orb');
    console.log('Found orb for tooltip:', orb);
    if (orb) {
      orb.appendChild(tooltip);
      console.log('Tooltip appended to orb');
      
      // Animate in
      setTimeout(() => {
        tooltip.classList.add('visible');
        console.log('Tooltip made visible');
      }, 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        tooltip.classList.remove('visible');
        console.log('Tooltip hidden');
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.remove();
            console.log('Tooltip removed');
          }
        }, 300);
      }, 3000);
    } else {
      console.error('Could not find orb element for tooltip');
    }
  }

  showError(message) {
    // Create error display
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.setAttribute('role', 'alert');
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
}

// Additional CSS for dynamic elements
const dynamicStyles = `
  .echo-item {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease-out;
    margin-bottom: 1rem;
    padding: 1rem;
    background: var(--glass-bg);
    border: 1px solid var(--glass-border);
    border-radius: 8px;
    backdrop-filter: blur(10px);
  }
  
  .echo-item.visible {
    opacity: 1;
    transform: translateY(0);
  }
  
  .echo-text {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
  }
  
  .echo-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 0.8rem;
    color: var(--text-muted);
  }
  
  .echo-quote {
    font-style: italic;
  }
  
  .echo-time {
    opacity: 0.7;
  }
  
  .echo-pulse {
    width: 6px;
    height: 6px;
    background: var(--accent-color);
    border-radius: 50%;
    animation: pulse 2s infinite;
    margin-left: auto;
  }
  
  .quote-entity.echo-added {
    animation: quote-echo-pulse 1s ease-out;
  }
  
  .count-number.pulse {
    animation: number-pulse 0.5s ease-out;
  }
  
  .echo-trigger.triggered {
    animation: trigger-ripple 0.3s ease-out;
  }
  
  .error-message {
    position: fixed;
    top: 20px;
    right: 20px;
    background: var(--accent-color);
    color: white;
    padding: 1rem;
    border-radius: 8px;
    z-index: 1000;
    max-width: 300px;
  }
  
  @keyframes quote-echo-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.02); }
    100% { transform: scale(1); }
  }
  
  @keyframes number-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
  
  @keyframes trigger-ripple {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

// Inject dynamic styles
const styleSheet = document.createElement('style');
styleSheet.textContent = dynamicStyles;
document.head.appendChild(styleSheet);

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EchoChamber());
} else {
  new EchoChamber();
}

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EchoChamber;
} 