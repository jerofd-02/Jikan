/**
 * función que comprueba que los campos requeridos se encuentren en la respuesta
 * de la petición a la base de datos
 * @param {string[]} fields  - Nombres de los campos obligatorios
 * @param {object}   body    - req.body de la petición
 * @returns {{ valid: boolean, message?: string }}
 */
function validateRequired(fields, body) {
    const missing = fields.filter(
        (field) => body[field] === undefined || body[field] === null || body[field] === ''
    );

    if (missing.length > 0) {
        return {
            valid: false,
            message: `Los siguientes campos son obligatorios: ${missing.join(', ')}.`,
        };
    }

    return { valid: true };
}

/**
 * función que devuelve error 404 cuando no se ha encontrado un recurso por el que se pregunta
 * @param {import('express').Response} res      - Objeto response de Express
 * @param {string}                     resource - Nombre del recurso
 * @param {number|string}              id       - Identificador buscado
 */
function sendNotFound(res, resource, id) {
    return res.status(404).json({
        success: false,
        message: `${resource} con id ${id} no encontrado.`,
    });
}

module.exports = { validateRequired, sendNotFound };