
document.addEventListener('DOMContentLoaded', async () => {
   await loadInventory();
});

const useMuliplier = async (purchaseId) => {
    try {
        const res = await fetch(`http://localhost:3000/api/inventory/use/boost/${purchaseId}`, {
            method: 'PATCH',
            credentials: 'include',
        });
        const data = await res.json();
        
        if (res.ok) {
            Swal.fire({
                title: '¡Listo!',
                text: `¡Aprovecha tu potenciador x${data.multiplier} antes de que se acabe!`,
                icon: 'success',
                color: 'var(--font-color)',
                background: 'var(--background-color)',
            });
            await loadInventory();
        } else {
            Swal.fire({
                title: 'Error',
                text: data.error,
                icon: 'error',
                color: 'var(--font-color)',
                background: 'var(--background-color)',
            });
        }
    } catch (err) {
        console.error('Error:', err);
        Swal.fire({
            title: 'Error',
            text: 'Error al aplicar el potenciador',
            icon: 'error',
            color: 'var(--font-color)',
            background: 'var(--background-color)',
        });
    }
}

const applyProtector = async (purchaseId) => {
    try {
        const res = await fetch(`http://localhost:3000/api/inventory/use/protector/${purchaseId}`, {
            method: 'PATCH',
            credentials: 'include',
        });
        const data = await res.json();
        
        if (res.ok) {
            Swal.fire({
                title: '¡Listo!',
                text: `¡Tienes todos tus tableros protegidos por x${data.protector} días desde hoy!`,
                icon: 'success',
                color: 'var(--font-color)',
                background: 'var(--background-color)',
            });
            await loadInventory();
        } else {
            Swal.fire({
                title: 'Error',
                text: data.error,
                icon: 'error',
                color: 'var(--font-color)',
                background: 'var(--background-color)',
            });
        }
    } catch (err) {
        console.error('Error:', err);
        Swal.fire({
            title: 'Error',
            text: 'Error al aplicar el potenciador',
            icon: 'error',
            color: 'var(--font-color)',
            background: 'var(--background-color)',
        });
    }
}

async function useItem(purchaseId, objectCategory) {
    Swal.fire({
        title: '¿Usar este objeto?',
        text: '¿Estás seguro de que quieres usar este objeto? El objeto se consumirá al usarlo.',
        icon: 'question',
        color: 'var(--font-color)',
        background: 'var(--background-color)',
        showCancelButton: true,
        confirmButtonColor: 'var(--dark-accent)',
        cancelButtonColor: 'var(--background-color)',
        confirmButtonText: 'Usar',
        cancelButtonText: 'Cancelar',
        customClass: { title: 'swal-title-custom' },

    }).then(async (result) => {

        if (result.isConfirmed) {

            if (objectCategory == "Potenciador") {

                useMuliplier(purchaseId);

            } else if (objectCategory == "Protector") {

                applyProtector(purchaseId);

            }
        }
    });
}

async function loadInventory() {
  const res   = await fetch(`http://localhost:3000/api/inventory`, {credentials: 'include',});
  const items = await res.json();
  console.log(items);

  const grid = document.querySelector('.inventory-grid');
  const themeGrid = document.querySelector('.theme-selector');
  if (!grid) return;
  if (!themeGrid) return;


  grid.innerHTML = '';

  items.forEach(item => {
    if (item.object_category === 'Tema') {
        const themeBtn = document.createElement('button');
        themeBtn.className = 'theme-btn';
        themeBtn.textContent = item.object_name;
        themeBtn.dataset.theme = item.object_name.toLowerCase();
        themeGrid.appendChild(themeBtn);
    } else {
        const itemElement = document.createElement('div');
        itemElement.className = 'inventory-item';
        itemElement.innerHTML = `
            <div style="display:flex;align-items:center;gap:14px;margin:12px 0;padding:14px;background:var(--background3-color);border:1px solid var(--border-color);border-radius:10px;text-align:left;">
            <div style="font-size:36px;line-height:1">${item.object_img}</div>
            <div>
                <div style="font-weight:500;font-size:15px;color:var(--font-color)">${item.object_name}</div>
                <div style="font-size:12px;color:var(--font-color2);margin:2px 0">${item.object_category}</div>
                <div style="font-size:14px;font-weight:600;color:var(--font-color)">${item.object_description}</div>
            </div>
            <button style="margin:0;margin-left:auto;font-size:17px;color:var(--font-contrast);background:var(--principal);border:var(--border-color);cursor:pointer" onclick="useItem(${item.purchase_id}, '${item.object_category}')">Usar</button>
            </div>
        `;
        grid.appendChild(itemElement);
    }
  });
}