// ─── Email Form Submission ────────────────────────────────────────────────────

async function handleSubmit(e) {
  e.preventDefault();

  const form = document.querySelector('.email-form');
  const button = form.querySelector('button');
  const email = document.getElementById('email-input').value;
  const confirm = document.getElementById('signup-confirm');
  const errorMsg = document.getElementById('signup-error');

  // Loading state
  button.textContent = 'Joining...';
  button.disabled = true;
  if (errorMsg) errorMsg.style.display = 'none';

  try {
    const res = await fetch('/api/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok && data.success) {
      form.style.display = 'none';
      confirm.style.display = 'block';
    } else {
      throw new Error(data.error || 'Something went wrong.');
    }
  } catch (err) {
    button.textContent = 'Claim my spot';
    button.disabled = false;
    if (errorMsg) {
      errorMsg.textContent = err.message || 'Something went wrong. Please try again.';
      errorMsg.style.display = 'block';
    }
  }
}

// ─── Scroll-triggered Fade-in Animations ─────────────────────────────────────

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll('.step, .plan').forEach((el) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(28px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});
