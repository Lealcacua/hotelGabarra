const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();
const path = require('path');


const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos');
        conn.release();
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos:', err);
    });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());



app.post('/register', async (req, res) => {
    const { nombreCompleto, numeroCedula, numeroCelular, correo, contrasena } = req.body;

    if (!nombreCompleto || !numeroCedula || !numeroCelular || !correo || !contrasena) {
        return res.status(400).send('Todos los campos son requeridos sapo');
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        await pool.query('INSERT INTO railway.Usuario (nombreCompleto, numeroCedula, numeroCelular, Correo, Contrasena) VALUES (?, ?, ?, ?, ?)', [nombreCompleto, numeroCedula, numeroCelular, correo, hashedPassword]);

        res.status(201).send('Usuario registrado exitosamente');
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    console.log('Datos recibidos:', { correo, contrasena });

    if (!correo || !contrasena) {
        return res.status(400).send('Correo y contraseña son requeridos');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM railway.Usuario WHERE Correo = ?', [correo]);
        console.log('Resultado de la consulta:', rows);

        if (rows.length === 0) {
            console.log('Usuario no encontrado');
            res.redirect('/?error=auth');
            return;
        }

        const usuario = rows[0];
        console.log('Usuario encontrado:', usuario);

        const contrasenaValida = await verificarContrasena(contrasena, usuario.Contrasena);
        console.log('Contraseña válida:', contrasenaValida);

        if (contrasenaValida) {
            res.sendFile(path.join(__dirname, '../public/sesionIniciada.html'));
        } else {
            console.log('Contraseña incorrecta');
            res.redirect('/?error=auth');
        }
    } catch (err) {
        console.error('Error interno del servidor:', err);
        res.status(500).send('Error interno del servidor');
    }
});

async function verificarContrasena(contrasena, hashedPassword) {
    return await bcrypt.compare(contrasena, hashedPassword);
}









app.get('/habitaciones', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM railway.Habitaciones;');
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener habitaciones:', err);
        res.status(500).send('Error al obtener habitaciones');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = pool;
