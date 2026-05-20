document.addEventListener('DOMContentLoaded', function() {
    updateStreakDisplay();
    
    const tablero = document.querySelector(".boards-section");
    if (tablero) {
        const observer = new MutationObserver(() => {
            updateStreakDisplay();
        });
        
        observer.observe(tablero, {
            attributes: true,
            subtree: false
        });
    }
});

async function updateStreakDisplay(newStreak = null, newPoints = null) {
    try {
        const boardId = getBoardIdFromURL();
        if (!boardId) return;

        const streakBadge = document.querySelector('.streak-badge');
        const streakCount = streakBadge?.querySelector('span');
        const streakIcon = streakBadge?.querySelector('i');
        const pointsDisplay = streakBadge?.querySelector('div p');

        let currentStreak = newStreak;
        let jikoins = newPoints;

        // Si no nos pasan los valores, los obtenemos de la API
        if (currentStreak === null || jikoins === null) {
            const response = await fetch(`/api/boards/gamified/${boardId}/full`, {
                credentials: 'include'
            });

            const resPoints = await fetch('/api/users/jikoins', { credentials: 'include' });

            if (!response.ok) throw new Error('Failed to fetch board data');
            if (!resPoints.ok) throw new Error('Failed to fetch user points');

            const boardData = await response.json();
            const pointsData = await resPoints.json();
            currentStreak = boardData.current_streak || 0;
            jikoins = pointsData.jikoins;
        }

        if (streakCount) {
            streakCount.textContent = currentStreak;
        }
        if (pointsDisplay) {
            pointsDisplay.textContent = `${jikoins} J`;
        }

        if (streakIcon) {
            if (currentStreak == 0) {
                streakIcon.style.filter = 'grayscale(1)';
            } else {
                streakIcon.style.filter = 'grayscale(0)';
                if (currentStreak >= 10) {
                    streakIcon.classList.remove('fa-fire-flame-simple');
                    streakIcon.classList.add('fa-fire');
                } else {
                    streakIcon.classList.add('fa-fire-flame-simple');
                    streakIcon.classList.remove('fa-fire');
                }
            }
        }
    } catch (error) {
        console.error('Error updating streak display:', error);
    }
}

function getBoardIdFromURL() {
    const tablero = document.querySelector(".boards-section");
    return tablero?.dataset.boardId;
}

window.updateStreakDisplay = updateStreakDisplay;
