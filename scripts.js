// ─── Email Form Submission ───────────────────────────────────────────────────

function handleSubmit(e) {
  e.preventDefault();
  document.querySelector('.email-form').style.display = 'none';
  document.getElementById('signup-confirm').style.display = 'block';
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
