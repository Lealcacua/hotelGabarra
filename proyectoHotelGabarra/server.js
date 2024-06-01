const express = require('express');
const pool = require('./config/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get('/api/data', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM tu_tabla');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
