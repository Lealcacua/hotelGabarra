// testConexion.js

const pool = require('./config/db');

async function pruebaConexion() {
    try {
        const result = await pool.query('SELECT * FROM tu_tabla');
        console.log('Datos obtenidos de la base de datos:', result.rows);
    } catch (err) {
        console.error('Error al obtener datos de la base de datos:', err);
    }
}

pruebaConexion();
