const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
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

const sessionStore = new MySQLStore({}, pool);
app.use(session({
    key: 'session_cookie_name',
    secret: 'your_secret_key',
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Usar secure: true en producción si se usa HTTPS
}));

app.use(express.static(path.join(__dirname, '../public')));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/register', async (req, res) => {
    const { nombreCompleto, numeroCedula, numeroCelular, correo, contrasena } = req.body;

    if (!nombreCompleto || !numeroCedula || !numeroCelular || !correo || !contrasena) {
        return res.status(400).send('Todos los campos son requeridos');
    }

    try {
        const hashedPassword = await bcrypt.hash(contrasena, 10);
        await pool.query('INSERT INTO railway.Usuario (nombreCompleto, numeroCedula, numeroCelular, Correo, Contrasena) VALUES (?, ?, ?, ?, ?)', [nombreCompleto, numeroCedula, numeroCelular, correo, hashedPassword]);

        res.redirect(req.get('referer'));
    } catch (err) {
        console.error('Error al registrar usuario:', err);
        res.status(500).send('Error interno del servidor');
    }
});

app.post('/login', async (req, res) => {
    const { correo, contrasena } = req.body;
    
    if (!correo || !contrasena) {
        return res.status(400).send('Correo y contraseña son requeridos');
    }

    try {
        const [rows] = await pool.query('SELECT * FROM railway.Usuario WHERE Correo = ?', [correo]);
        
        if (rows.length === 0) {
            return res.redirect('/?error=auth');
        }

        const usuario = rows[0];
        const contrasenaValida = await verificarContrasena(contrasena, usuario.Contrasena);
        
        if (contrasenaValida) {
            req.session.usuario = {
                id: usuario.ID,
                nombreCompleto: usuario.nombreCompleto,
                numeroCedula: usuario.numeroCedula,
                numeroCelular: usuario.numeroCelular,
                correo: usuario.Correo
            };

            // Obtener las reservas del usuario
            const [reservas] = await pool.query('SELECT * FROM railway.verReservas WHERE idUsuario = ?', [usuario.ID]);
            console.log('Reservas del usuario:', reservas);

            // Obtener los pagos del usuario
            const [pagos] = await pool.query(`
                SELECT Pagos.* FROM railway.Pagos
                JOIN railway.verReservas ON Pagos.idReservas = verReservas.idReservas
                WHERE verReservas.idUsuario = ?
            `, [usuario.ID]);
            console.log('Pagos del usuario:', pagos);

            // Agregar reservas y pagos a la sesión
            req.session.usuario.reservas = reservas;
            req.session.usuario.pagos = pagos;

            console.log('Datos del usuario:', req.session.usuario); // Imprimir datos del usuario

            res.redirect(`/sesionIniciada.html`);
        } else {
            res.redirect('/?error=auth');
        }
    } catch (err) {
        console.error('Error interno del servidor:', err);
        res.status(500).send('Error interno del servidor');
    }
});


app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send('Error al cerrar la sesión');
        }
        res.clearCookie('connect.sid'); 
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.status(200).send('¡Bienvenido a la página de inicio!');
});


async function verificarContrasena(contrasena, hashedPassword) {
    return await bcrypt.compare(contrasena, hashedPassword);
}

app.get('/user-data', (req, res) => {
    if (req.session.usuario) {
        res.json(req.session.usuario);
    } else {
        res.status(401).send('No autorizado');
    }
});

app.get('/habitaciones', async (req, res)  => {
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

