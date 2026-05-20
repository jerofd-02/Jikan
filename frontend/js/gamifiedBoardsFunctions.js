const BASE_URL = "/api";

const getData = async (link) => {
    try {
        const response = await fetch(link, {credentials: 'include'});
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};
export const completeTasks = async (boardId) => {

    try {
        const response = await fetch (BASE_URL + `/boards/gamified/${boardId}/complete`, {
            method: 'PATCH',
            credentials: "include"
        });

        if (!response.ok) return;

        const data = await response.json();

        // Actualizar el streak dinámicamente sin refrescar
        if (window.updateStreakDisplay) {
            console.log("Actualizando streak display con:", data.new_streak, data.jikoins);
            window.updateStreakDisplay(data.new_streak, data.jikoins);
        }

        Swal.fire({
            title: "¡Todas las tareas completadas!",
            icon: "success",
            text: `¡Llevas ${data.new_streak} días seguidos y has ganado ${data.points_earned} puntos hoy!`
        });

    } catch (error) {
        console.log(error);
    }
};