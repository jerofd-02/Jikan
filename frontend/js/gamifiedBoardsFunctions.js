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

const pointsCalculator = (rachaAcumulada) => {
    let points = Math.ceil(0.5 + (Math.log(rachaAcumulada + 1) / Math.log(4)));
    return 10 * points;
};

export const completeTasks = async (board, lastColumn) => {
    const gamifiedInfo = await getData(BASE_URL + `/boards/gamified/${board.board_id}`);
    const tasksToComplete = gamifiedInfo.daily_tasks;

    let completedTasks = lastColumn.querySelectorAll("div.task.done");

    if (completedTasks.length === tasksToComplete) {
        console.log("muy bien chiquitin sigue asi");
    }
};