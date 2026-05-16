
let activeFilter = 'Todos';
let products = [];
let userJikoins = 0;
let ownedObjectIds = new Set();

async function fetchProducts() {
    const res = await fetch('/api/shop/objects', { credentials: 'include' });
    const data = await res.json();
    return data;
}

function renderHTML(products) {
    const cats = ['Todos', ...new Set(products.map(p => p.object_category))];
    const filtered = activeFilter === 'Todos'
    ? products
    : products.filter(p => p.object_category === activeFilter);

    return `
    <div class="swal-points">
        <span class="points-icon">⭐</span>
        <span><b>${userJikoins}</b> jikoins</span>
    </div>
    <div class="swal-filter">
        ${cats.map(c => `
        <button class="filter-btn ${c === activeFilter ? 'active' : ''}"
                onclick="setFilter('${c}')">${c}</button>
        `).join('')}
    </div>

    <div class="swal-grid">
        ${filtered.map(p => {
        const owned = p.one_time && ownedObjectIds.has(p.object_id);
        return `
        <div class="swal-card ${owned ? 'owned' : ''}">
            ${p.object_label
            ? `<span class="badge badge-new">${p.object_label}</span>`
            : ''}
            <div class="emoji-img">${p.object_img}</div>
            <div class="name">${p.object_name}</div>
            <div class="cat">${p.object_category}</div>
            <div class="description">${p.object_description}</div>
            <div class="price">${p.object_price} J</div>
            <button class="buy-btn" onclick="confirmBuy(${p.object_id})" ${owned ? 'disabled' : ''}>
                ${owned ? 'Ya adquirido' : 'Comprar'}
            </button>
        </div>
        `;}).join('')}
    </div>
    `;
}

function setFilter(cat) {
    activeFilter = cat;
    document.querySelector('.swal-popup-content').innerHTML = renderHTML(products);
}

async function confirmBuy(id) {
    const p = products.find(x => x.object_id === id);
    const {isConfirmed} = await Swal.fire({
    title: '¿Confirmar compra?',
    color: 'var(--principal)',
    html: `
        <div style="display:flex;align-items:center;gap:14px;margin:12px 0;padding:14px;background:var(--background3-color);border:1px solid var(--border-color);border-radius:10px;text-align:left;">
        <div style="font-size:36px;line-height:1">${p.object_img}</div>
        <div>
            <div style="font-weight:500;font-size:15px;color:var(--font-color)">${p.object_name}</div>
            <div style="font-size:12px;color:var(--font-color2);margin:2px 0">${p.object_category}</div>
            <div style="font-size:17px;font-weight:600;color:var(--font-color)">${p.object_price}</div>
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
    });

    if (!isConfirmed) return;

    const res = await fetch(`/api/shop/purchase`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_object: id }),
    });

    const data = await res.json();

    if (!res.ok) {
        const messages = {
            400: { title: 'Jikoins insuficientes', text: `Necesitas ${p.object_price} jikoins para comprar este objeto.` },
            409: { title: 'Ya lo tienes',          text: `${p.object_name} ya está en tu inventario.` },
            404: { title: 'Error',                 text: data.error },
        };

        const msg = messages[res.status] ?? { title: 'Error inesperado', text: 'Inténtalo de nuevo más tarde.' };

        Swal.fire({
            icon: 'error',
            title: msg.title,
            text: msg.text,
            background: 'var(--background-color)',
            color: 'var(--font-color)',
            confirmButtonColor: 'var(--dark-accent)',
            customClass: { title: 'swal-title-custom' },
            width: 380,
        });
        return;
    }

    userJikoins = data.jikoins_remaining;
    ownedObjectIds.add(id);

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
}

async function openShop() {

    const [fetchedProducts, userRes, inventoryRes] = await Promise.all([
        fetchProducts(),
        fetch('http://localhost:3000/api/users/jikoins', { credentials: 'include' }),
        fetch('http://localhost:3000/api/inventory', { credentials: 'include' })
    ]);

    products = fetchedProducts;
    const userData = await userRes.json();
    userJikoins = userData.jikoins;

    const inventory = await inventoryRes.json();
    ownedObjectIds = new Set(inventory.map(i => i.object_id));

    activeFilter = 'Todos';
    Swal.fire({
        title: 'Tienda',
        color: 'var(--principal)',
        fontWeight: '600',
        html: `<div class="swal-popup-content">${renderHTML(products)}</div>`,
        background: 'var(--background2-color)',
        border: '1px solid var(--border-color)',
        showConfirmButton: false,
        showCloseButton: true,
        width: 680,
        padding: '1.5rem',
        didOpen: () => {
            window.setFilter  = setFilter;
            window.confirmBuy = confirmBuy;
        }
    });
}

