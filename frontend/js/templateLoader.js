async function init() {
    const elements = document.querySelectorAll('[data-template]');

    const promises = Array.from(elements).map(async (el) => {
        const name = el.getAttribute("data-template");
        const response = await fetch(`./templates/${name}.html`);
        if (!response.ok) {
            console.error(`Error cargando plantilla: ${name} - ${response.status}`);
            return;
        }
        const text = await response.text();
        // Evitar insertar la página index completa si el servidor hace fallback
        if (text.trim().startsWith('<!doctype') || text.includes('<html')) {
            console.error(`Plantilla ${name} parece contener HTML completo; omitiendo inserción.`);
            return;
        }
        el.innerHTML = text;
    });

    await Promise.all(promises);
    document.dispatchEvent(new Event('templatesLoaded'));
}

document.addEventListener('DOMContentLoaded', init);