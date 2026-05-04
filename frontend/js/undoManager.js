window.undoManager = new UndoManager();
window.undoPopupTimer = null;

window.showUndoPopup = function(text = 'Acción realizada') {
    const popup = document.getElementById('undo-popup');
    document.getElementById('undo-popup-text').textContent = text;
    popup.style.display = 'flex';
    clearTimeout(window.undoPopupTimer);
    window.undoPopupTimer = setTimeout(() => window.hideUndoPopup(), 5000);
};

window.hideUndoPopup = function() {
    document.getElementById('undo-popup').style.display = 'none';
    clearTimeout(window.undoPopupTimer);
};

document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undoManager.undo();
    }
    if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        undoManager.redo();
    }
});