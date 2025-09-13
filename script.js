/*
      JS validation logic:
      - required fields: fullName, email, resume (file input)
      - email format: simple regex
      - cover letter: optional but if present, min length 20
      - resume file: allowed types and max size check
    */

    (function(){
      // Config
      const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2 MB
      const ALLOWED_MIME = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      // fallback allowed extensions for browsers that provide no mime
      const ALLOWED_EXT = ['pdf','doc','docx'];

      // Elements
      const form = document.getElementById('appForm');
      const fullName = document.getElementById('fullName');
      const email = document.getElementById('email');
      const cover = document.getElementById('cover');
      const resume = document.getElementById('resume');
      const clearFile = document.getElementById('clearFile');
      const filePreview = document.getElementById('filePreview');
      const submitBtn = document.getElementById('submitBtn');
      const formStatus = document.getElementById('formStatus');

      // error nodes
      const errName = document.getElementById('err-fullName');
      const errEmail = document.getElementById('err-email');
      const errCover = document.getElementById('err-cover');
      const errResume = document.getElementById('err-resume');
      const errPortfolio = document.getElementById('err-portfolio');

      // helpers
      function showError(node, msg){
        node.textContent = msg;
        node.classList.remove('hidden');
      }
      function clearError(node){
        node.textContent = '';
        node.classList.add('hidden');
      }

      function prettyBytes(bytes){
        if(bytes < 1024) return bytes + ' B';
        if(bytes < 1024*1024) return (bytes/1024).toFixed(1) + ' KB';
        return (bytes/(1024*1024)).toFixed(1) + ' MB';
      }

      function getExt(filename){
        const parts = filename.split('.');
        return parts.length > 1 ? parts.pop().toLowerCase() : '';
      }

      function validateName(){
        const v = fullName.value.trim();
        if(!v) { showError(errName, 'Full name is required.'); return false; }
        if(v.length < 2){ showError(errName, 'Please enter your full name.'); return false; }
        clearError(errName);
        return true;
      }

      function validateEmail(){
        const v = email.value.trim();
        if(!v){ showError(errEmail, 'Email is required.'); return false; }
        // simple RFC-lite regex (good enough for client-side)
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if(!re.test(v)){ showError(errEmail, 'Please enter a valid email address.'); return false; }
        clearError(errEmail);
        return true;
      }

      function validateCover(){
        const v = cover.value.trim();
        if(!v){ clearError(errCover); return true; } // optional
        if(v.length < 20){ showError(errCover, 'If provided, cover letter should be at least 20 characters.'); return false; }
        clearError(errCover);
        return true;
      }

      function validatePortfolio(){
        const node = document.getElementById('portfolio');
        const v = node.value.trim();
        if(!v){ clearError(errPortfolio); return true; } // optional
        try {
          const url = new URL(v);
          // simple check: protocol http(s)
          if(!['http:','https:'].includes(url.protocol)) {
            showError(errPortfolio, 'Portfolio URL must use http or https.');
            return false;
          }
        } catch (e) {
          showError(errPortfolio, 'Please enter a valid URL for your portfolio.');
          return false;
        }
        clearError(errPortfolio);
        return true;
      }

      function validateResume(){
        clearError(errResume);
        const files = resume.files;
        if(!files || files.length === 0){
          showError(errResume, 'Resume is required. Attach a PDF or Word document.');
          filePreview.classList.add('hidden');
          return false;
        }

        const f = files[0];

        // size
        if(f.size > MAX_FILE_BYTES){
          showError(errResume, `File is too large — max is ${prettyBytes(MAX_FILE_BYTES)}.`);
          filePreview.classList.add('hidden');
          return false;
        }

        // mime check
        const mime = f.type;
        const ext = getExt(f.name);

        let allowed = false;
        if(ALLOWED_MIME.includes(mime)) allowed = true;
        if(ALLOWED_EXT.includes(ext)) allowed = true;
        if(!allowed){
          showError(errResume, 'Invalid file type. Allowed: .pdf, .doc, .docx');
          filePreview.classList.add('hidden');
          return false;
        }

        // show a small preview line
        filePreview.classList.remove('hidden');
        filePreview.textContent = `Selected: ${f.name} (${prettyBytes(f.size)})`;
        clearError(errResume);
        return true;
      }

      // event listeners
      fullName.addEventListener('input', validateName);
      email.addEventListener('input', validateEmail);
      cover.addEventListener('input', validateCover);
      document.getElementById('portfolio').addEventListener('input', validatePortfolio);

      resume.addEventListener('change', function(){
        validateResume();
      });

      clearFile.addEventListener('click', function(){
        resume.value = '';
        filePreview.classList.add('hidden');
        clearError(errResume);
      });

      // On submit
      form.addEventListener('submit', function(e){
        e.preventDefault();
        formStatus.textContent = '';
        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking...';

        // Run all validators
        const okName = validateName();
        const okEmail = validateEmail();
        const okCover = validateCover();
        const okPortfolio = validatePortfolio();
        const okResume = validateResume();

        const allOk = okName && okEmail && okCover && okPortfolio && okResume;

        if(!allOk){
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit application';
          formStatus.textContent = 'Please fix the highlighted errors.';
          formStatus.style.color = 'var(--danger)';
          return;
        }

        // Simulated success 
        setTimeout(() => {
          submitBtn.disabled = false;
          submitBtn.textContent = 'Submit application';
          formStatus.textContent = 'Application submitted successfully ✅';
          formStatus.style.color = 'var(--success)';
          // reset form optional:
          form.reset();
          filePreview.classList.add('hidden');
        }, 800);
      });

      // Optional: prevent accidental navigation if form is dirty
      let isDirty = false;
      form.addEventListener('input', () => isDirty = true);
      window.addEventListener('beforeunload', (ev) => {
        if(isDirty){
          ev.preventDefault();
        }
      });

    })();