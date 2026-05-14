document.addEventListener('DOMContentLoaded', function() {
    const streakBadge = document.querySelector('.streak-badge');
    const streakCount = streakBadge.querySelector('span');
    
    if (streakCount.textContent >= 10) {
        const streakIcon = streakBadge.querySelector('i');
        streakIcon.classList.remove('fa-fire-flame-simple');
        streakIcon.classList.add('fa-fire-flame');
}
});
