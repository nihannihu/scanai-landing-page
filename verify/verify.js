/**
 * ScanAI Official Credential Verification System
 * Zero-backend, local JSON data store, instant client verification
 */

(function () {
  'use strict';

  // Fallback dataset for zero-latency & offline/file:// protocol resilience
  const EMBEDDED_RECORDS = [
    {
      "id": "SCAN-2026-INT-001",
      "recipientName": "Priya KM",
      "role": "AI Research Intern",
      "department": "Autonomous Perception & Surgical AI",
      "startDate": "January 2026",
      "endDate": "June 2026",
      "duration": "6 Months",
      "issueDate": "June 30, 2026",
      "status": "Active",
      "issuer": "ScanAI Healthcare Technologies Inc.",
      "credentialType": "Certificate of Internship Completion",
      "location": "Bengaluru, Karnataka, India",
      "summary": "Completed a 6-month research internship contributing to computer vision algorithms, real-time surgical perception, and AI model evaluation within the Omni Rovis surgical navigation pipeline.",
      "skills": ["Computer Vision", "Deep Learning", "Surgical AI", "Edge Inference", "PyTorch / Python"],
      "verifiedBy": "ScanAI Engineering & Clinical Research Board"
    }
  ];

  let certificateDatabase = EMBEDDED_RECORDS;

  // DOM Elements
  const stateLoading = document.getElementById('stateLoading');
  const stateSuccess = document.getElementById('stateSuccess');
  const stateNotFound = document.getElementById('stateNotFound');

  const certType = document.getElementById('certType');
  const certRecipient = document.getElementById('certRecipient');
  const certRole = document.getElementById('certRole');
  const certDept = document.getElementById('certDept');
  const certId = document.getElementById('certId');
  const certTenure = document.getElementById('certTenure');
  const certIssueDate = document.getElementById('certIssueDate');
  const certIssuer = document.getElementById('certIssuer');
  const certLocation = document.getElementById('certLocation');
  const certSummary = document.getElementById('certSummary');
  const certSkills = document.getElementById('certSkills');
  const verificationTimestamp = document.getElementById('verificationTimestamp');

  const btnCopyId = document.getElementById('btnCopyId');
  const btnPrint = document.getElementById('btnPrint');
  const btnShare = document.getElementById('btnShare');
  const btnToggleQr = document.getElementById('btnToggleQr');
  const qrPreviewBox = document.getElementById('qrPreviewBox');
  const qrImage = document.getElementById('qrImage');
  const qrUrlDisplay = document.getElementById('qrUrlDisplay');

  const searchForm = document.getElementById('searchForm');
  const searchInput = document.getElementById('searchInput');
  const notFoundTitle = document.getElementById('notFoundTitle');
  const notFoundDesc = document.getElementById('notFoundDesc');

  // Load database from JSON
  async function loadDatabase() {
    try {
      const response = await fetch('../data/certificates.json', { cache: 'no-cache' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          certificateDatabase = data;
        }
      }
    } catch (e) {
      // Local file:// or offline fallback
      console.info('Loaded credential registry cache.');
    }
  }

  // Extract ID from URL
  function extractRequestedId() {
    const urlParams = new URLSearchParams(window.location.search);
    const idParam = urlParams.get('id') || urlParams.get('cert') || urlParams.get('credential');
    if (idParam) return idParam.trim();

    // Check hash (#SCAN-2026-INT-001)
    if (window.location.hash) {
      const hashVal = window.location.hash.replace('#', '').trim();
      if (hashVal) return hashVal;
    }

    // Check pathname (e.g. /verify/SCAN-2026-INT-001)
    const match = window.location.pathname.match(/\/verify\/([A-Za-z0-9_-]+)/i);
    if (match && match[1] && match[1].toLowerCase() !== 'index.html') {
      return match[1].trim();
    }

    return null;
  }

  // Lookup certificate by ID
  function findRecord(id) {
    if (!id) return null;
    const cleanId = id.trim().toUpperCase();
    return certificateDatabase.find(function (item) {
      return item.id && item.id.trim().toUpperCase() === cleanId;
    });
  }

  // Render Record View
  function renderRecord(record) {
    stateLoading.style.display = 'none';
    stateNotFound.style.display = 'none';
    stateSuccess.style.display = 'block';

    document.title = `${record.recipientName} — Credential Verification | ScanAI`;

    certRecipient.textContent = record.recipientName;
    certRole.textContent = record.role;
    certDept.textContent = record.department;
    certId.textContent = record.id;
    certTenure.textContent = `${record.startDate} – ${record.endDate} (${record.duration || '6 Months'})`;
    certIssueDate.textContent = record.issueDate;
    certIssuer.textContent = record.issuer || 'ScanAI Healthcare Technologies Inc.';
    if (certLocation) certLocation.textContent = record.location || 'Bengaluru, Karnataka, India';
    certType.textContent = record.credentialType || 'Certificate of Internship Completion';
    certSummary.textContent = record.summary || '';

    // Render Skills / Competencies
    certSkills.innerHTML = '';
    if (Array.isArray(record.skills)) {
      record.skills.forEach(function (skill) {
        const span = document.createElement('span');
        span.className = 'tag-item';
        span.textContent = skill;
        certSkills.appendChild(span);
      });
    }

    // Live Verification Timestamp
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    verificationTimestamp.textContent = formattedDate;

    // Canonical public verification URL
    const canonicalUrl = `https://scanai.health/verify/?id=${encodeURIComponent(record.id)}`;

    // Set QR code preview
    const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&margin=8&data=${encodeURIComponent(canonicalUrl)}`;
    qrImage.src = qrSrc;
    qrUrlDisplay.textContent = canonicalUrl;
  }

  // Render Not Found / Search View
  function renderNotFound(searchedId) {
    stateLoading.style.display = 'none';
    stateSuccess.style.display = 'none';
    stateNotFound.style.display = 'block';

    if (searchedId) {
      notFoundTitle.textContent = 'Record Not Located';
      notFoundDesc.innerHTML = `No verified record was found matching ID: <strong>${escapeHtml(searchedId)}</strong>. Please verify the ID on the certificate document.`;
      searchInput.value = searchedId;
      document.title = `Record Not Found — ScanAI`;
    } else {
      notFoundTitle.textContent = 'Verify a ScanAI Credential';
      notFoundDesc.textContent = 'Enter the Credential ID printed on the certificate to check its validity against company records.';
      searchInput.value = '';
      document.title = `Credential Verification — ScanAI`;
    }
  }

  function escapeHtml(str) {
    return str.replace(/[&<>'"]/g, function (tag) {
      return ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag);
    });
  }

  // Global lookup function
  window.lookupId = function (id) {
    if (!id) return;
    const record = findRecord(id);
    const newUrl = `${window.location.pathname}?id=${encodeURIComponent(id)}`;
    window.history.pushState({ id: id }, '', newUrl);

    if (record) {
      renderRecord(record);
    } else {
      renderNotFound(id);
    }
  };

  // Event Listeners
  if (searchForm) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const val = searchInput.value.trim();
      if (val) {
        window.lookupId(val);
      }
    });
  }

  if (btnCopyId) {
    btnCopyId.addEventListener('click', function () {
      const idToCopy = certId.textContent;
      navigator.clipboard.writeText(idToCopy).then(function () {
        btnCopyId.textContent = 'Copied';
        setTimeout(function () {
          btnCopyId.textContent = 'Copy';
        }, 1500);
      });
    });
  }

  if (btnPrint) {
    btnPrint.addEventListener('click', function () {
      window.print();
    });
  }

  if (btnShare) {
    btnShare.addEventListener('click', function () {
      const shareUrl = window.location.href;
      navigator.clipboard.writeText(shareUrl).then(function () {
        const originalText = btnShare.innerHTML;
        btnShare.innerHTML = '<span>Link Copied</span>';
        setTimeout(function () {
          btnShare.innerHTML = originalText;
        }, 1500);
      });
    });
  }

  if (btnToggleQr) {
    btnToggleQr.addEventListener('click', function () {
      const isHidden = qrPreviewBox.style.display === 'none';
      qrPreviewBox.style.display = isHidden ? 'block' : 'none';
      btnToggleQr.innerHTML = isHidden ? 'Hide QR Code' : 'Certificate QR Code';
    });
  }

  // Handle browser back/forward
  window.addEventListener('popstate', function () {
    const id = extractRequestedId();
    if (id) {
      const record = findRecord(id);
      if (record) renderRecord(record);
      else renderNotFound(id);
    } else {
      renderNotFound(null);
    }
  });

  // Initialization
  async function init() {
    await loadDatabase();
    const id = extractRequestedId();
    if (id) {
      const record = findRecord(id);
      if (record) {
        renderRecord(record);
      } else {
        renderNotFound(id);
      }
    } else {
      renderNotFound(null);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
