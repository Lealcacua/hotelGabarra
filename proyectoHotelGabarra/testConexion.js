const pool = require('./config/db');

async function pruebaConexion() {
    try {
        const [rows] = await pool.query('SELECT * FROM Administradores');
        console.log('Datos obtenidos de la base de datos:', rows);
    } catch (err) {
        console.error('Error al obtener datos de la base de datos:', err);
    }
}

pruebaConexion();
