/**
 * Scan AI Private Limited — Interactive UI & Navigation Controller (main.js)
 */
(function () {
  'use strict';

  // 1. Sticky Header Scroll State
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      header.classList.toggle('scrolled', window.scrollY > 12);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // 2. Mobile Navigation Drawer
  const mobileToggle = document.querySelector('.mobile-toggle');
  const mobileDrawer = document.querySelector('.mobile-drawer');
  const drawerBackdrop = document.querySelector('.drawer-backdrop');
  const drawerClose = document.querySelector('.drawer-close');

  function setDrawer(open) {
    if (!mobileDrawer || !drawerBackdrop) return;
    mobileDrawer.classList.toggle('open', open);
    drawerBackdrop.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
    if (mobileToggle) mobileToggle.setAttribute('aria-expanded', String(open));
  }

  if (mobileToggle) mobileToggle.addEventListener('click', () => setDrawer(true));
  if (drawerClose) drawerClose.addEventListener('click', () => setDrawer(false));
  if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => setDrawer(false));
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setDrawer(false);
  });

  document.querySelectorAll('.mobile-nav-links a').forEach((link) => {
    link.addEventListener('click', () => setDrawer(false));
  });

  // 3. Interactive Axial Spine Comparison Toggle
  const compButtons = document.querySelectorAll('[data-comp-mode]');
  const compGrid = document.getElementById('axialComparisonGrid');
  const tileNaive = document.getElementById('tileNaiveRecon');
  const tileOmni = document.getElementById('tileOmniRecon');

  if (compButtons.length && compGrid && tileNaive && tileOmni) {
    compButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        compButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        const mode = btn.getAttribute('data-comp-mode');
        if (mode === 'dual') {
          compGrid.style.gridTemplateColumns = '';
          tileNaive.style.display = 'block';
          tileOmni.style.display = 'block';
        } else if (mode === 'omnicbct') {
          compGrid.style.gridTemplateColumns = '1fr';
          tileNaive.style.display = 'none';
          tileOmni.style.display = 'block';
        } else if (mode === 'naive') {
          compGrid.style.gridTemplateColumns = '1fr';
          tileNaive.style.display = 'block';
          tileOmni.style.display = 'none';
        }
      });
    });
  }

  // 4. Tabbed Engineering Proof & Workstation Switcher
  const tabButtons = document.querySelectorAll('[data-proof-tab]');
  const tabPanes = document.querySelectorAll('[data-proof-pane]');

  if (tabButtons.length && tabPanes.length) {
    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-proof-tab');
        tabButtons.forEach((b) => b.classList.remove('active'));
        tabPanes.forEach((p) => p.classList.remove('active'));
        btn.classList.add('active');
        const pane = document.querySelector(`[data-proof-pane="${target}"]`);
        if (pane) pane.classList.add('active');
      });
    });
  }

  // 5. Partnership Inquiry Form (Mailto Routing to scanai@zohomail.in)
  const inquiryForm = document.getElementById('partnershipForm');
  const formStatus = document.getElementById('formStatus');

  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = (document.getElementById('contactName')?.value || '').trim();
      const org = (document.getElementById('contactOrg')?.value || '').trim();
      const email = (document.getElementById('contactEmail')?.value || '').trim();
      const track = (document.getElementById('partnershipTrack')?.value || '').trim();
      const notes = (document.getElementById('contactNotes')?.value || '').trim();

      const subject = encodeURIComponent(`[Scan AI Partnership] ${track} — ${org || name}`);
      const body = encodeURIComponent(
        `Name: ${name}\nOrganization: ${org}\nWork Email: ${email}\nPartnership Track: ${track}\n\nDetails:\n${notes}`
      );

      if (formStatus) {
        formStatus.style.display = 'block';
        formStatus.textContent = 'Email draft opened for scanai@zohomail.in.';
      }
      window.location.href = `mailto:scanai@zohomail.in?subject=${subject}&body=${body}`;
    });
  }
})();
