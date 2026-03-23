const nav = document.getElementById('nav');

nav.addEventListener('click', e => {
  const btn = e.target.closest('[data-section]');
  if (!btn) return;

  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));

  btn.classList.add('active');
  document.getElementById('section-' + btn.dataset.section).classList.add('active');
});