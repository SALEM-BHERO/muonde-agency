// ─── Scroll Animations ───────────────────────────────────────────────────────
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            scrollObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.testimonial, .service-item, .about h2, .about p, .hero-content').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    scrollObserver.observe(el);

    // Fallback: ensure visible after 1.2s in case observer doesn't fire
    setTimeout(() => {
        if (getComputedStyle(el).opacity === '0') {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    }, 1200);
});


// ─── Dynamic Contact Form ─────────────────────────────────────────────────────
const projectTypeSelect = document.getElementById('project-type');

// Map of project type values to their dynamic field section IDs
const dynamicFieldMap = {
    'website':    'fields-website',
    'software':   'fields-software',
    'mobile':     'fields-mobile',
    'ai-ml':      'fields-ai',
    'consulting': null,
    'other':      null,
};

function hideAllDynamicFields() {
    document.querySelectorAll('.dynamic-fields').forEach(section => {
        section.classList.remove('visible');
        section.classList.add('hidden');
        // Make fields inside not required when hidden
        section.querySelectorAll('select, input').forEach(el => el.removeAttribute('required'));
    });
}

function showDynamicFields(sectionId) {
    if (!sectionId) return;
    const section = document.getElementById(sectionId);
    if (!section) return;
    section.classList.remove('hidden');
    // Small delay for CSS transition to kick in
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            section.classList.add('visible');
        });
    });
}

if (projectTypeSelect) {
    projectTypeSelect.addEventListener('change', function () {
        hideAllDynamicFields();
        const targetSection = dynamicFieldMap[this.value];
        showDynamicFields(targetSection);
    });
}


// ─── Contact Form Submission (Formspree AJAX) ─────────────────────────────────
const contactForm = document.getElementById('contact-form');
const formSuccess = document.getElementById('form-success');
const submitBtn   = document.getElementById('submit-btn');
const btnText     = document.getElementById('btn-text');
const btnLoading  = document.getElementById('btn-loading');

if (contactForm) {
    contactForm.addEventListener('submit', async function (event) {
        event.preventDefault();

        const formAction = contactForm.getAttribute('action');

        // Block submission if Formspree ID hasn't been configured
        if (formAction.includes('YOUR_FORM_ID')) {
            showFallbackAlert();
            return;
        }

        // Show loading state
        setLoading(true);

        try {
            const formData = new FormData(contactForm);
            const response = await fetch(formAction, {
                method: 'POST',
                body: formData,
                headers: { 'Accept': 'application/json' }
            });

            if (response.ok) {
                // Hide the form, show success
                contactForm.style.display = 'none';
                formSuccess.classList.remove('hidden');
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
            } else {
                const data = await response.json();
                const errorMsg = (data.errors || []).map(e => e.message).join(', ') || 'Something went wrong.';
                showErrorMessage(errorMsg);
                setLoading(false);
            }
        } catch (err) {
            showErrorMessage('Network error. Please try again or email us directly.');
            setLoading(false);
        }
    });
}

function setLoading(isLoading) {
    if (!submitBtn || !btnText || !btnLoading) return;
    submitBtn.disabled = isLoading;
    btnText.classList.toggle('hidden', isLoading);
    btnLoading.classList.toggle('hidden', !isLoading);
}

function showErrorMessage(msg) {
    // Remove existing error if any
    const existing = document.getElementById('form-error-msg');
    if (existing) existing.remove();

    const err = document.createElement('p');
    err.id = 'form-error-msg';
    err.style.cssText = 'color:#f87171;text-align:center;font-size:0.9rem;margin-top:0.75rem;';
    err.textContent = '⚠ ' + msg;
    contactForm.appendChild(err);

    setTimeout(() => err.remove(), 6000);
}

// Fallback when Formspree isn't set up yet — sends user to email instead
function showFallbackAlert() {
    const name    = document.getElementById('name')?.value || '';
    const message = document.getElementById('message')?.value || '';
    const subject = encodeURIComponent('Project Inquiry from ' + name);
    const body    = encodeURIComponent(message);
    window.location.href = `mailto:muondeagency@gmail.com?subject=${subject}&body=${body}`;
}