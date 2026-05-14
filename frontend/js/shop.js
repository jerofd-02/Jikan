userPoints = 500;

const products = [
      { id:1, emoji:'🟦', name:'Azul',     cat:'Tema',        price:'50 €', badge:'new', description:'Color azul' },
      { id:2, emoji:'🟨', name:'Amarillo', cat:'Tema',        price:'50 €', badge: null, description:'Color amarillo' },
      { id:3, emoji:'🟩', name:'Verde',    cat:'Tema',        price:'50 €', badge:'sale', description:'Color verde' },
      { id:4, emoji:'🟫', name:'Marrón',   cat:'Tema',        price:'50 €', badge:'new', description:'Color marrón' },
      { id:5, emoji:'🔥', name:'x2',       cat:'Potenciador', price:'100 €', badge: null, description:'Potencia la racha x2 durante 24 horas' },
      { id:6, emoji:'🔥', name:'x5',       cat:'Potenciador', price:'200 €', badge: null, description:'Potencia la racha x5 durante 24 horas' },
      { id:7, emoji:'🔥', name:'x10',      cat:'Potenciador', price:'500 €', badge:'sale', description:'Potencia la racha x10 durante 24 horas' },
      { id:8, emoji:'🛡️', name:'1 dia',    cat:'Protector',   price:'100 €', badge:'new', description:'Proteje la racha durante 1 día' },
      { id:9, emoji:'🛡️', name:'2 dias',   cat:'Protector',   price:'200 €', badge: null, description:'Proteje la racha durante 2 días' },
    ];
 
    const cats = ['Todos', ...new Set(products.map(p => p.cat))];
 
    let activeFilter = 'Todos';

function renderHTML() {
    const filtered = activeFilter === 'Todos'
    ? products
    : products.filter(p => p.cat === activeFilter);

    return `
    <div class="swal-points">
        <span class="points-icon">⭐</span>
        <span><b>${userPoints}</b> puntos</span>
    </div>
    <div class="swal-filter">
        ${cats.map(c => `
        <button class="filter-btn ${c === activeFilter ? 'active' : ''}"
                onclick="setFilter('${c}')">${c}</button>
        `).join('')}
    </div>

    <div class="swal-grid">
        ${filtered.map(p => `
        <div class="swal-card">
            ${p.badge
            ? `<span class="badge badge-${p.badge}">
                    ${p.badge === 'new' ? 'Nuevo' : 'Oferta'}
                </span>`
            : ''}
            <div class="emoji-img">${p.emoji}</div>
            <div class="name">${p.name}</div>
            <div class="cat">${p.cat}</div>
            <div class="description">${p.description}</div>
            <div class="price">${p.price}</div>
            <button class="buy-btn" onclick="confirmBuy(${p.id})">Comprar</button>
        </div>
        `).join('')}
    </div>
    `;
}

function setFilter(cat) {
    activeFilter = cat;
    document.querySelector('.swal-popup-content').innerHTML = renderHTML();
}

function confirmBuy(id) {
    const p = products.find(x => x.id === id);
    Swal.fire({
    title: '¿Confirmar compra?',
    color: 'var(--principal)',
    html: `
        <div style="display:flex;align-items:center;gap:14px;margin:12px 0;padding:14px;background:var(--background3-color);border:1px solid var(--border-color);border-radius:10px;text-align:left;">
        <div style="font-size:36px;line-height:1">${p.emoji}</div>
        <div>
            <div style="font-weight:500;font-size:15px;color:var(--font-color)">${p.name}</div>
            <div style="font-size:12px;color:var(--font-color2);margin:2px 0">${p.cat}</div>
            <div style="font-size:17px;font-weight:600;color:var(--font-color)">${p.price}</div>
        </div>
        </div>
    `,
    background: 'var(--background-color)',
    showCancelButton: true,
    confirmButtonText: 'Sí, comprar',
    cancelButtonText: 'Cancelar',
    confirmButtonColor: 'var(--dark-accent)',
    cancelButtonColor: 'darkred',
    customClass: { cancelButton: 'swal-cancel-dark' },
    reverseButtons: true,
    width: 380,
    }).then(result => {
        if (result.isConfirmed && userPoints >= parseInt(p.price)) {
            userPoints -= parseInt(p.price);
            Swal.fire({
                icon: 'success',
                title: '¡Compra realizada!',
                color: 'var(--font-color)',
                html: `Puedes ver tu artículo en tu perfil.`,
                background: 'var(--background-color)',
                confirmButtonText: 'Seguir comprando',
                confirmButtonColor: 'var(--dark-accent)',
                width: 380,
                timer: 3000,
                timerProgressBar: true,
                customClass: { title: 'swal-title-custom' },
                didOpen: () => {
                    document.querySelector('.swal2-timer-progress-bar').style.background = 'var(--principal)';
                }
            }).then(() => openShop());
        } else if (result.isConfirmed) {
            Swal.fire({
                icon: 'error',
                title: 'Puntos insuficientes',
                color: 'var(--font-color)',
                background: 'var(--background-color)',
                confirmButtonText: 'Entendido',
                confirmButtonColor: 'var(--dark-accent)',
                customClass: { title: 'swal-title-custom' },
                width: 380,
            });
        }
    });
}

function openShop() {
    activeFilter = 'Todos';
    selectedId   = null;
    Swal.fire({
        title: 'Tienda',
        color: 'var(--principal)',
        html: `<div class="swal-popup-content">${renderHTML()}</div>`,
        background: 'var(--background2-color)',
        border: '1px solid var(--border-color)',
        showConfirmButton: false,
        showCloseButton: true,
        width: 680,
        padding: '1.5rem',
        didOpen: () => {
            window.setFilter = setFilter;
            window.confirmBuy = confirmBuy;
        }
    });
}