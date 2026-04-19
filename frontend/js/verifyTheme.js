(function() {
    const theme = localStorage.getItem('app-theme');
    if (theme && theme !== 'dark') {
        document.documentElement.setAttribute('data-theme', theme);
    }
})();