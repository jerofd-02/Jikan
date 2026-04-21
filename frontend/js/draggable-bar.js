(function () {
    const sheet   = document.getElementById('bottomSheet');
    const handle  = document.getElementById('sheetHandle');
    const toggle  = document.getElementById('sheetToggle');
    const details = document.getElementById('sheetDetails');

    const MIN = 52;
    const MID = 280;
    const MAX = window.innerHeight * 0.7;
    const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

    function setExpanded(open) {
        sheet.classList.toggle('expanded', open);
        details.open = open;
    }

    // Clic en el chevron: toggle entre cerrado y medio
    toggle.addEventListener('click', e => {
        e.stopPropagation();
        const isOpen = sheet.offsetHeight > MIN + 10;
        sheet.style.height = (isOpen ? MIN : MAX) + 'px';
        setExpanded(!isOpen);
    });

    // Drag desde la barra
    let dragging = false, startY = 0, startH = 0;

    handle.addEventListener('pointerdown', e => {
        if (toggle.contains(e.target)) return;
        dragging = true;
        startY = e.clientY;
        startH = sheet.offsetHeight;
        sheet.classList.add('dragging');
        handle.setPointerCapture(e.pointerId);
    });

    handle.addEventListener('pointermove', e => {
        if (!dragging) return;
        const h = clamp(startH + (startY - e.clientY), MIN, MAX);
        sheet.style.height = h + 'px';
        setExpanded(h > MIN + 10);
    });

    handle.addEventListener('pointerup', () => {
        if (!dragging) return;
        dragging = false;
        sheet.classList.remove('dragging');

        const h = sheet.offsetHeight;
        setExpanded(h > MIN + 10);
    });
})();