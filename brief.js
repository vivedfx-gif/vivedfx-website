/* â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ
   vivedfx CLIENT BRIEF â€” ENGINE
   Multi-step form with progress, validation,
   file upload, save/load, and review.
   â•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گâ•گ */

(function () {
  'use strict';

  /* â”€â”€ INIT â”€â”€ */
  const BRIEF_KEY = 'vivedfx_brief_' + (window.BRIEF_ID || 'default');
  let currentStep = 0;
  let totalSteps = 0;
  let uploadedFiles = {};
  const form = document.getElementById('briefForm');
  if (!form) return;

  const steps = form.querySelectorAll('.brief-step');
  totalSteps = steps.length;

  /* â”€â”€ PROGRESS DOTS â”€â”€ */
  const dotsContainer = document.getElementById('briefProgressDots');
  if (dotsContainer) {
    for (let i = 0; i < totalSteps; i++) {
      const dot = document.createElement('div');
      dot.className = 'brief-progress-dot' + (i === 0 ? ' active' : '');
      dotsContainer.appendChild(dot);
    }
  }

  /* â”€â”€ STEP COUNTER â”€â”€ */
  const stepBadge = document.getElementById('briefStepBadge');
  const stepLabel = document.getElementById('briefStepLabel');

  /* â”€â”€ SAVE TOAST â”€â”€ */
  const toast = document.getElementById('briefSaveToast');

  /* â”€â”€ RENDER STEP â”€â”€ */
  function renderStep() {
    steps.forEach((s, i) => s.classList.toggle('active', i === currentStep));

    const pct = totalSteps > 1 ? ((currentStep) / (totalSteps - 1)) * 100 : 0;
    const fill = document.getElementById('briefProgressFill');
    if (fill) fill.style.width = pct + '%';

    if (dotsContainer) {
      dotsContainer.querySelectorAll('.brief-progress-dot').forEach((d, i) => {
        d.classList.toggle('active', i === currentStep);
        d.classList.toggle('completed', i < currentStep);
      });
    }

    if (stepBadge) stepBadge.textContent = `${currentStep + 1} / ${totalSteps}`;
    if (stepLabel) stepLabel.textContent = steps[currentStep]?.dataset.label || `Step ${currentStep + 1}`;

    const prevBtn = document.getElementById('briefPrev');
    const nextBtn = document.getElementById('briefNext');
    if (prevBtn) prevBtn.style.visibility = currentStep === 0 ? 'hidden' : 'visible';
    if (nextBtn) {
      nextBtn.textContent = currentStep === totalSteps - 1 ? 'Review & Submit' : 'Continue';
      nextBtn.innerHTML = currentStep === totalSteps - 1
        ? 'Review &amp; Submit <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>'
        : 'Continue <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* â”€â”€ VALIDATE CURRENT STEP â”€â”€ */
  function validateStep() {
    const step = steps[currentStep];
    if (!step) return true;
    let valid = true;

    step.querySelectorAll('[required]').forEach(input => {
      const err = input.closest('.brief-group')?.querySelector('.brief-error');
      if (!input.value.trim()) {
        input.classList.add('error');
        if (err) err.classList.add('visible');
        valid = false;
      } else {
        input.classList.remove('error');
        if (err) err.classList.remove('visible');
      }
    });

    // Validate radio groups
    step.querySelectorAll('.brief-radio-group[required]').forEach(group => {
      const checked = group.querySelector('input[type="radio"]:checked');
      const err = group.closest('.brief-group')?.querySelector('.brief-error');
      if (!checked) {
        if (err) err.classList.add('visible');
        valid = false;
      } else {
        if (err) err.classList.remove('visible');
      }
    });

    if (!valid) {
      const firstErr = step.querySelector('.brief-input.error, .brief-select.error, .brief-textarea.error');
      if (firstErr) {
        firstErr.style.animation = 'briefShake .3s ease';
        firstErr.focus();
        setTimeout(() => firstErr.style.animation = '', 300);
      }
    }
    return valid;
  }

  /* â”€â”€ COLLECT DATA â”€â”€ */
  function collectData() {
    const data = {};
    const fd = new FormData(form);
    for (const [key, val] of fd.entries()) {
      if (data[key]) {
        if (Array.isArray(data[key])) data[key].push(val);
        else data[key] = [data[key], val];
      } else {
        data[key] = val;
      }
    }
    // Add uploaded file names
    for (const [key, files] of Object.entries(uploadedFiles)) {
      data[key + '_files'] = files.map(f => f.name);
    }
    return data;
  }

  /* â”€â”€ BUILD REVIEW â”€â”€ */
  function buildReview() {
    const container = document.getElementById('briefReviewData');
    if (!container) return;
    const data = collectData();
    container.innerHTML = '';

    const groups = {};
    steps.forEach((step, i) => {
      const title = step.dataset.label || `Step ${i + 1}`;
      const rows = [];
      step.querySelectorAll('.brief-group').forEach(group => {
        const label = group.querySelector('.brief-label')?.textContent?.replace('*', '').trim();
        if (!label) return;
        const input = group.querySelector('input, select, textarea');
        let value = '';
        if (input) {
          if (input.type === 'radio') {
            const checked = group.querySelector('input[type="radio"]:checked');
            value = checked ? (checked.closest('.brief-option')?.querySelector('.brief-option-text')?.textContent || checked.value) : '';
          } else if (input.type === 'checkbox') {
            const checks = group.querySelectorAll('input[type="checkbox"]:checked');
            value = Array.from(checks).map(c => c.closest('.brief-checkbox')?.querySelector('.brief-checkbox-text')?.textContent || c.value).join(', ');
          } else {
            value = input.value;
          }
        }
        const selectEl = group.querySelector('select');
        if (selectEl) value = selectEl.options[selectEl.selectedIndex]?.text || selectEl.value;

        if (value) rows.push({ label, value });
      });
      // Check for file uploads
      const uploadGroups = step.querySelectorAll('.brief-upload');
      uploadGroups.forEach(ug => {
        const key = ug.dataset.key;
        if (uploadedFiles[key]?.length) {
          rows.push({ label: 'Uploaded Files', value: uploadedFiles[key].map(f => f.name).join(', ') });
        }
      });
      if (rows.length) groups[title] = rows;
    });

    for (const [title, rows] of Object.entries(groups)) {
      const section = document.createElement('div');
      section.className = 'brief-review-section';
      section.innerHTML = `<div class="brief-review-title">${title}</div>` +
        rows.map(r => `<div class="brief-review-row"><span class="brief-review-key">${r.label}</span><span class="brief-review-value">${r.value}</span></div>`).join('');
      container.appendChild(section);
    }
  }

  /* â”€â”€ NAVIGATION â”€â”€ */
  document.getElementById('briefNext')?.addEventListener('click', () => {
    if (currentStep < totalSteps - 1) {
      if (!validateStep()) return;
      currentStep++;
      renderStep();
    } else {
      // Last step = review
      buildReview();
      if (validateStep()) {
        // Show review step
        steps.forEach(s => s.classList.remove('active'));
        const reviewStep = document.getElementById('briefReviewStep');
        if (reviewStep) {
          reviewStep.classList.add('active');
          currentStep = totalSteps; // mark past end
          const fill = document.getElementById('briefProgressFill');
          if (fill) fill.style.width = '100%';
          if (dotsContainer) {
            dotsContainer.querySelectorAll('.brief-progress-dot').forEach(d => d.classList.add('completed'));
          }
          const prevBtn = document.getElementById('briefPrev');
          if (prevBtn) prevBtn.style.visibility = 'visible';
          const nextBtn = document.getElementById('briefNext');
          if (nextBtn) {
            nextBtn.innerHTML = 'Submit Brief <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    }
  });

  document.getElementById('briefPrev')?.addEventListener('click', () => {
    if (currentStep > 0) {
      currentStep--;
      renderStep();
    }
  });

  /* â”€â”€ FORM SUBMISSION â”€â”€ */
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateStep()) return;

    const data = collectData();
    console.log('Brief submitted:', data);

    // Simulate send to server
    const submitBtn = document.getElementById('briefNext');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:18px;height:18px;animation:briefPulse 1s infinite"><circle cx="12" cy="12" r="10"/></svg> Submitting...';
    }

    setTimeout(() => {
      // Hide form, show success
      form.style.display = 'none';
      document.querySelector('.brief-progress')?.style.setProperty('display', 'none');
      document.querySelector('.brief-step-counter')?.style.setProperty('display', 'none');
      const success = document.getElementById('briefSuccess');
      if (success) success.classList.add('active');
      // Clear saved progress
      localStorage.removeItem(BRIEF_KEY);
    }, 1500);
  });

  /* â”€â”€ AUTO-SAVE â”€â”€ */
  function saveProgress() {
    const data = collectData();
    data._step = currentStep;
    data._files = {};
    for (const [key, files] of Object.entries(uploadedFiles)) {
      data._files[key] = files.map(f => f.name);
    }
    localStorage.setItem(BRIEF_KEY, JSON.stringify(data));
    showToast();
  }

  function loadProgress() {
    try {
      const raw = localStorage.getItem(BRIEF_KEY);
      if (!raw) return;
      const data = JSON.parse(raw);
      const fd = new FormData(form);
      for (const [key, val] of Object.entries(data)) {
        if (key.startsWith('_')) continue;
        const el = form.querySelector(`[name="${key}"]`);
        if (el) {
          if (el.type === 'radio') {
            const radio = form.querySelector(`[name="${key}"][value="${val}"]`);
            if (radio) { radio.checked = true; radio.closest('.brief-option')?.classList.add('selected'); }
          } else if (el.tagName === 'SELECT') {
            el.value = val;
          } else {
            el.value = val;
          }
        }
      }
      if (data._step) {
        currentStep = parseInt(data._step);
        renderStep();
      }
    } catch (e) {}
  }

  function showToast() {
    if (!toast) return;
    toast.classList.add('visible');
    setTimeout(() => toast.classList.remove('visible'), 2500);
  }

  /* â”€â”€ SAVE BUTTON â”€â”€ */
  document.getElementById('briefSaveBtn')?.addEventListener('click', saveProgress);

  // Auto-save every 30s
  setInterval(saveProgress, 30000);

  /* â”€â”€ FILE UPLOAD â”€â”€ */
  document.querySelectorAll('.brief-upload').forEach(upload => {
    const key = upload.dataset.key;
    const input = upload.querySelector('input[type="file"]');
    if (!input) return;
    uploadedFiles[key] = [];

    upload.addEventListener('click', () => input.click());
    upload.addEventListener('dragover', e => { e.preventDefault(); upload.classList.add('dragover'); });
    upload.addEventListener('dragleave', () => upload.classList.remove('dragover'));
    upload.addEventListener('drop', e => {
      e.preventDefault();
      upload.classList.remove('dragover');
      handleFiles(e.dataTransfer.files, key, upload);
    });
    input.addEventListener('change', () => handleFiles(input.files, key, upload));

    function handleFiles(files, k, container) {
      const allowed = ['pdf', 'docx', 'jpg', 'jpeg', 'png', 'ai', 'psd', 'zip'];
      const list = container.querySelector('.brief-upload-files');
      for (const file of files) {
        const ext = file.name.split('.').pop().toLowerCase();
        if (!allowed.includes(ext)) continue;
        if (uploadedFiles[k].length >= 10) break;
        uploadedFiles[k].push(file);
      }
      renderFileList(k, list);
    }

    function renderFileList(k, list) {
      if (!list) return;
      list.innerHTML = uploadedFiles[k].map((f, i) =>
        `<div class="brief-upload-file">
          <span>${f.name}</span>
          <button type="button" class="brief-upload-file-remove" data-key="${k}" data-index="${i}">&times;</button>
        </div>`
      ).join('');
    }
  });

  // Delegate remove
  document.addEventListener('click', e => {
    if (e.target.classList.contains('brief-upload-file-remove')) {
      const k = e.target.dataset.key;
      const i = parseInt(e.target.dataset.index);
      uploadedFiles[k]?.splice(i, 1);
      const container = document.querySelector(`.brief-upload[data-key="${k}"]`);
      const list = container?.querySelector('.brief-upload-files');
      if (list) {
        list.innerHTML = uploadedFiles[k].map((f, idx) =>
          `<div class="brief-upload-file">
            <span>${f.name}</span>
            <button type="button" class="brief-upload-file-remove" data-key="${k}" data-index="${idx}">&times;</button>
          </div>`
        ).join('');
      }
    }
  });

  /* â”€â”€ RADIO / CHECKBOX SELECTED CLASS â”€â”€ */
  document.addEventListener('change', e => {
    if (e.target.type === 'radio') {
      const name = e.target.name;
      form.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.brief-option')?.classList.toggle('selected', r.checked);
      });
    }
    if (e.target.type === 'checkbox') {
      e.target.closest('.brief-checkbox')?.classList.toggle('selected', e.target.checked);
    }
  });

  // Also handle click on option/checkbox containers
  document.querySelectorAll('.brief-option, .brief-checkbox').forEach(el => {
    el.addEventListener('click', e => {
      if (e.target.tagName === 'INPUT') return;
      const input = el.querySelector('input');
      if (!input) return;
      if (input.type === 'radio') {
        input.checked = true;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      } else if (input.type === 'checkbox') {
        input.checked = !input.checked;
        input.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
  });

  /* â”€â”€ INPUT LISTENERS â”€â”€ */
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => {
      el.classList.remove('error');
      el.closest('.brief-group')?.querySelector('.brief-error')?.classList.remove('visible');
    });
  });

  /* â”€â”€ INIT â”€â”€ */
  renderStep();
  loadProgress();
})();