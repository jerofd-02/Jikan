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

        Swal.fire({
            title: "¡Todas las tareas completadas!",
            icon: "success",
            text: `¡Llevas ${data.new_streak} días seguidos y has ganado ${data.points_earned} puntos hoy!`
        });

    } catch (error) {
        console.log(error);
    }
};