async function init() {
    const elements = document.querySelectorAll('[data-template]');

    const promises = Array.from(elements).map(async (el) => {
        const name = el.getAttribute("data-template");
        const response = await fetch(`./templates/${name}.html`);
        el.innerHTML = await response.text();
    });

    await Promise.all(promises);
}

document.addEventListener('DOMContentLoaded', init);