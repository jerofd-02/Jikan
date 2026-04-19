/**
 * Manejador centralizado de errores.
 * @param {import('express').Response} res     - Objeto response de Express
 * @param {Error}                      error   - Error capturado
 * @param {string}                     context - Descripción del contexto donde ocurrió
 */

function handleError(res, error, context) {
    console.error(`[ERROR] ${context}:`, error);

    // Errores de validación definidos por la aplicación
    if (error && error.type === 'validation') {
        return res.status(400).json({
            success: false,
            message: error.message || 'Datos de entrada inválidos.',
        });
    
    // control de errores con status
    } else if (error && error.status && Number.isInteger(error.status)) {
        return res.status(error.status).json({
            success: false,
            message: error.message || 'Error.',
        });
    
    // manejo de códigos emitidos por MySQL
    } else if (error && error.code) {

        switch (error.code) {

            // datos duplicados
            case 'ER_DUP_ENTRY':
                return res.status(409).json({
                    success: false,
                    message: 'Ya existe un registro con esos datos.',
                });
            
            // referencias inválidas
            case 'ER_NO_REFERENCED_ROW':
                return res.status(400).json({
                    success: false,
                    message: 'Referencia a un recurso que no existe.',
                });

            // errores de consulta
            case 'ER_BAD_FIELD_ERROR':
            case 'ER_PARSE_ERROR':
            case 'ER_NO_SUCH_TABLE':
                return res.status(400).json({
                    success: false,
                    message: error.sqlMessage || 'Error en la consulta a la base de datos.',
                });
            
            // problemas de conexión a la base de datos
            case 'ECONNREFUSED':
            case 'PROTOCOL_CONNECTION_LOST':
                return res.status(503).json({
                    success: false,
                    message: 'No se pudo conectar con la base de datos.',
                });
            
            // resto de errores
            default:
                return res.status(500).json({
                    success: false,
                    message: error.message || 'Error interno del servidor.',
                });
        }
    
    } else {
        // fallback genérico
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor.',
        });
    }
}

module.exports = { handleError };