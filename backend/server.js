const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');
const cors = require('cors');
const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);
require('dotenv').config();
const path = require('path');
const { allowedNodeEnvironmentFlags } = require('process');

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
        return res.redirect('/?error=missing_credentials');
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

            // Verificar si el ID del usuario es 0
            if (usuario.ID === 0) {

                const [reservas] = await pool.query('SELECT * FROM railway.verReservas');
                const [pagos] = await pool.query('SELECT * FROM railway.Pagos');

                req.session.usuario.reservas = reservas;
                req.session.usuario.pagos = pagos;
                
                return res.redirect('/iniAdmin.html');
                BREAK;
            } else {
                // Obtener las reservas del usuario
                const [reservas] = await pool.query('SELECT * FROM railway.verReservas WHERE idUsuario = ?', [usuario.ID]);

                // Obtener los pagos del usuario
                const [pagos] = await pool.query(`
                    SELECT Pagos.* FROM railway.Pagos
                    JOIN railway.verReservas ON Pagos.idReservas = verReservas.idReservas
                    WHERE verReservas.idUsuario = ?
                `, [usuario.ID]);

                // Agregar reservas y pagos a la sesión
                req.session.usuario.reservas = reservas;
                req.session.usuario.pagos = pagos;

                return res.redirect(`/sesionIniciada.html`);
            }
        } else {
            return res.redirect('/?error=auth');
        }
    } catch (err) {
        console.error('Error interno del servidor:', err);
        return res.redirect('/?error=server');
    }
});



//ver reservas 
app.get('/reservas', async (req, res) => {
    try {
        const [reservas] = await pool.query('SELECT * FROM railway.verReservas');
        res.json(reservas);
    } catch (err) {
        console.error('Error al obtener reservas:', err);
        res.status(500).send('Error al obtener reservas');
    }
});

// pagos 
app.get('/pagos', async (req, res) => {
    try {
        const usuario = req.session.usuario;

        if (!usuario) {
            return res.status(401).send('Usuario no autenticado');
        }

        const [pagos] = await pool.query(`
            SELECT 
                Pagos.idPago, 
                verReservas.idReservas AS idReserva, 
                Pagos.valorPago, 
                Pagos.fechaPago, 
                'Desconocido' AS estado
            FROM Pagos
            JOIN verReservas ON Pagos.idReservas = verReservas.idReservas
            WHERE verReservas.idUsuario = ?
        `, [usuario.id]);

        res.json(pagos);
    } catch (error) {
        console.error('Error al obtener los pagos:', error);
        res.status(500).send('Error interno del servidor');
    }
});



// Confirmar pago
app.post('/confirmarPago', async (req, res) => {
    const { idUsuario, fechaInicio, fechaFin, numeroHabitaciones, valorPago, habitaciones } = req.body;

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        // Insertar datos en la tabla verReservas
        const [result] = await connection.query(
            'INSERT INTO railway.verReservas (idUsuario, fechaInicio, fechaFin, numeroHabitaciones) VALUES (?, ?, ?, ?)',
            [idUsuario, fechaInicio, fechaFin, numeroHabitaciones]
        );
        const idReservas = result.insertId;

        // Insertar datos en la tabla Pagos
        const fechaPago = new Date().toISOString().split('T')[0];
        await connection.query(
            'INSERT INTO railway.Pagos (idReservas, valorPago, fechaPago) VALUES (?, ?, ?)',
            [idReservas, valorPago, fechaPago]
        );

        // Actualizar el estado de las habitaciones en la tabla Habitaciones
        for (const idHabitacion of habitaciones) {
            const [updateResult] = await connection.query(
                'UPDATE railway.Habitaciones SET estadoHabitacion = ? WHERE idHabitacion = ?',
                ['OCUPADA', idHabitacion]
            );

            if (updateResult.affectedRows === 0) {
                throw new Error(`La actualización falló para idHabitacion: ${idHabitacion}`);
            }
        }

        await connection.commit();
        res.json({ success: true });
    } catch (error) {
        await connection.rollback();
        console.error('Error al confirmar el pago:', error);
        res.status(500).json({ success: false, message: 'Error al confirmar el pago' });
    } finally {
        connection.release();
    }
});



// Actualizar el estado de la habitación cuando la reserva haya pasado
setInterval(async () => {
    try {
        const today = new Date().toISOString().split('T')[0];
        const [habitaciones] = await pool.query(
            'SELECT * FROM railway.verReservas WHERE fechaFin < ?',
            [today]
        );

        for (const reserva of habitaciones) {
            await pool.query(
                'UPDATE railway.Habitaciones SET estadoHabitacion = ? WHERE idHabitacion = ?',
                ['DISPONIBLE', reserva.idHabitacion]
            );
        }
    } catch (error) {
        console.error('Error al actualizar el estado de las habitaciones:', error);
    }
}, 86400000); // Ejecutar esta función una vez al día

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
        const userData = {
            id: req.session.usuario.id,
            // Otros campos de datos del usuario aquí
            nombreCompleto: req.session.usuario.nombreCompleto,
            // Incluye otros campos que desees
        };
        res.json(userData); // Devuelve el objeto userData con el ID y otros datos del usuario
    } else {
        res.status(401).send('No autorizado'); // Si no hay usuario autenticado, devuelve un mensaje de "No autorizado"
    }
});
// reservas de cada usuario por separado
app.get('/reservas-usuario', async (req, res) => {
    if (req.session.usuario) {
        const userId = req.session.usuario.id;

        try {
            const [reservas] = await pool.query('SELECT v.*, p.valorPago, p.fechaPago FROM railway.verReservas v LEFT JOIN railway.Pagos p ON v.idReservas = p.idReservas WHERE v.idUsuario = ?', [userId]);
            res.json(reservas);
        } catch (error) {
            console.error('Error al obtener las reservas del usuario:', error);
            res.status(500).json({ error: 'No se pudieron obtener las reservas' });
        }
    } else {
        res.status(401).send('No autorizado');
    }
});






app.delete('/eliminar-reserva/:id', async (req, res) => {
    const reservaId = req.params.id;
    let connection; // Declarar la variable connection aquí

    try {
        connection = await pool.getConnection();
        await connection.beginTransaction();

        // Eliminar registros relacionados en la tabla Pagos
        console.log(`Eliminando pagos para la reserva con ID: ${reservaId}`);
        await connection.query('DELETE FROM Pagos WHERE idReservas = ?', [reservaId]);

        // Eliminar reserva de la tabla verReservas
        console.log(`Eliminando reserva con ID: ${reservaId}`);
        await connection.query('DELETE FROM verReservas WHERE idReservas = ?', [reservaId]);

        await connection.commit();

        console.log(`Reserva con ID ${reservaId} eliminada correctamente`);
        res.json({ message: 'Reserva eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la reserva:', error);
        if (connection) {
            await connection.rollback();
        }
        res.status(500).json({ error: 'No se pudo eliminar la reserva' });
    } finally {
        if (connection) {
            connection.release();
        }
    }
});

app.put('/precio/:idHabitacion', async (req, res) => {
    try {
        const { idHabitacion } = req.params;
        const { precio } = req.body;

        // Consulta SQL para actualizar el precio de la habitación
        const updateQuery = 'UPDATE railway.Habitaciones SET precio = ? WHERE idHabitacion = ?';
        const values = [precio, idHabitacion];

        // Ejecutar la consulta
        await pool.query(updateQuery, values);

        // Enviar una respuesta de éxito
        res.status(200).json({ success: true, message: 'Precio de la habitación actualizado correctamente' });
    } catch (error) {
        // Manejar errores
        console.error('Error al actualizar el precio de la habitación:', error);
        res.status(500).json({ success: false, error: 'Error al actualizar el precio de la habitación' });
    }
});






// Actualizar el endpoint /habitaciones para aceptar filtros
app.get('/habitaciones', async (req, res) => {
    try {
        const { maxPersonas, estadoHabitacion } = req.query;

        let query = 'SELECT * FROM railway.Habitaciones WHERE 1=1';
        const params = [];

        if (maxPersonas) {
            query += ' AND maxPersonas >= ?';
            params.push(maxPersonas);
        }

        if (estadoHabitacion) {
            query += ' AND estadoHabitacion = ?';
            params.push(estadoHabitacion);
        }

        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        console.error('Error al obtener habitaciones:', err);
        res.status(500).send('Error al obtener habitaciones');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});

app.get('/ultimaReserva', (req, res) => {
    const userId = req.query.userId;
    // Suponiendo que tienes una base de datos configurada
    db.collection('reservas')
        .find({ idUsuario: userId })
        .sort({ fecha: -1 }) // Ordenar por fecha para obtener la reserva más reciente
        .limit(1)
        .toArray((err, reservas) => {
            if (err) {
                res.status(500).send({ error: 'Error al obtener la reserva' });
            } else if (reservas.length > 0) {
                res.send({ reserva: reservas[0] });
            } else {
                res.send({ reserva: null });
            }
        });
});

