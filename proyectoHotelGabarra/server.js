const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
});

pool.getConnection()
    .then(conn => {
        console.log('Conectado a la base de datos 11');
        conn.release(); 
    })
    .catch(err => {
        console.error('No se pudo conectar a la base de datos:', err);
    });

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
    
    const { nombreCompleto, numeroCedula, numeroCelular, Correo, Contrasena, confirmContrasena } = req.body;

    
    if (Contrasena !== confirmContrasena) {
        return res.status(400).send('Las contraseñas no coinciden');
    }

    
    const hashedPassword = await bcrypt.hash(Contrasena, 10);

    try {
        
        const [result] = await pool.query(
            'INSERT INTO railway.Usuario (nombreCompleto, numeroCedula, numeroCelular, Correo, Contrasena) VALUES (?, ?, ?, ?, ?)',
            [nombreCompleto, numeroCedula, numeroCelular, Correo, hashedPassword]
        );

        
        res.redirect('/sesionIniciada');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error al registrar usuario');
    }
});


app.post('/login', async (req, res) => {
    
    const { numeroCelular, Contrasena } = req.body;

    try {
        res.redirect('/contenido/soporte'); 
    } catch (err) {
        console.error(err);
        res.status(500).send('Error en el servidor');
    }
});


app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

module.exports = pool;
