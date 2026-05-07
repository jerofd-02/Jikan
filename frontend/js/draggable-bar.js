(function () {
    const sheet   = document.getElementById('bottomSheet');
    const toggle  = document.getElementById('sheetToggle');
    const details = document.getElementById('sheetDetails');

    const MIN = 54;
    const MAX = window.innerHeight * 0.7;

    function setExpanded(open) {
        sheet.classList.toggle('expanded', open);
        sheet.style.height = (open ? MAX : MIN) + 'px';
        details.open = open;
    }

    toggle.addEventListener('click', () => {
        const isOpen = sheet.classList.contains('expanded');
        setExpanded(!isOpen);
    });

    sheet.style.height = MIN + 'px';
    setExpanded(false);
})();