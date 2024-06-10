// Código existente para el manejo de personas
const decrementBtn = document.getElementById('decrement');
const incrementBtn = document.getElementById('increment');
const personasCount = document.getElementById('personas-count');
let count = 1;

decrementBtn.addEventListener('click', function () {
    if (count > 1) {
        count--;
        personasCount.textContent = count;
    }
});

incrementBtn.addEventListener('click', function () {
    if (count < 6) {
        count++;
        personasCount.textContent = count;
    }
});

// Nuevo código para restricciones de fechas
const checkinInput = document.getElementById('checkin');
const checkoutInput = document.getElementById('checkout');

// Establecer la fecha mínima para check-in a la fecha actual
const today = new Date().toISOString().split('T')[0];
checkinInput.min = today;

checkinInput.addEventListener('change', function () {
    checkoutInput.min = checkinInput.value;
});

checkoutInput.addEventListener('change', function () {
    checkinInput.max = checkoutInput.value;
});

// Nuevo código para manejar el resumen de la reserva
const resumenDiv = document.getElementById('resumen');
const pagarReservaBtn = document.getElementById('pagarReserva');
let totalPrecio = 0; // Variable para almacenar el precio total de la reserva

// Función para calcular la diferencia en días entre dos fechas
function calcularDias(checkin, checkout) {
    const fechaInicio = new Date(checkin);
    const fechaFin = new Date(checkout);
    const diffTime = Math.abs(fechaFin - fechaInicio);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
}

// Código para cargar habitaciones desde la base de datos
function cargarHabitaciones(filtros = {}) {
    let url = 'http://127.0.0.1:3000/habitaciones';
    if (Object.keys(filtros).length > 0) {
        const queryParams = new URLSearchParams(filtros).toString();
        url += `?${queryParams}`;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            mostrarHabitaciones(data);
        })
        .catch(error => {
            console.error('Error al obtener datos de las habitaciones:', error);
        });
}

function mostrarHabitaciones(habitaciones) {
    const roomsContainer = document.querySelector('.rooms');
    roomsContainer.innerHTML = ''; // Limpiar contenido existente

    habitaciones.forEach(habitacion => {
        const roomCard = document.createElement('div');
        roomCard.classList.add('room-card');
        roomCard.innerHTML = `
            <img src="${habitacion.imagenURL}" alt="${habitacion.descripcion}">
            <div class="room-info">
                <h3>${habitacion.descripcion}</h3>
                <p>Max ${habitacion.maxPersonas} personas • NO SE PERMITE FUMAR</p>
                <p>Desde ${habitacion.precio} COP/ Noche</p>
                <button class="addReservaBtn" data-id-habitacion="${habitacion.idHabitacion}">AÑADIR A RESERVA</button>
            </div>
        `;
        roomsContainer.appendChild(roomCard);

        // Añadir evento de click al nuevo botón
        roomCard.querySelector('.addReservaBtn').addEventListener('click', function () {
            const checkin = checkinInput.value;
            const checkout = checkoutInput.value;

            // Verificar si se han seleccionado las fechas
            if (checkin === '' || checkout === '') {
                mostrarError('Por favor, seleccione las fechas antes de añadir a la reserva.');
                return;
            }

            const roomInfo = this.parentElement;
            const roomName = roomInfo.querySelector('h3').textContent;
            const roomPrice = parseFloat(roomInfo.querySelectorAll('p')[1].textContent.match(/(\d+)/)[0]); // Extraer el precio numérico
            const numDias = calcularDias(checkin, checkout);
            const totalHabitacion = roomPrice * numDias;
            const idHabitacion = this.getAttribute('data-id-habitacion'); // Obtener el idHabitacion

            totalPrecio += totalHabitacion;

            const resumenItem = document.createElement('div');
            resumenItem.classList.add('resumen-item');
            resumenItem.innerHTML = `
                <h4>${roomName}</h4>
                <p>Fecha de Entrada: ${checkin}</p>
                <p>Fecha de Salida: ${checkout}</p>
                <p>Precio Total: ${totalHabitacion.toFixed(2)} COP</p>
                <p class="id-habitacion" style="display:none;">${idHabitacion}</p>
            `;
            resumenDiv.appendChild(resumenItem);

            const totalDiv = document.getElementById('totalPrecio');
            if (!totalDiv) {
                const nuevoTotalDiv = document.createElement('div');
                nuevoTotalDiv.id = 'totalPrecio';
                nuevoTotalDiv.classList.add('resumen-item');
                nuevoTotalDiv.innerHTML = `<h3>Total a Pagar:</h3><p>${totalPrecio.toFixed(2)} COP</p>`;
                resumenDiv.appendChild(nuevoTotalDiv);
            } else {
                totalDiv.innerHTML = `<h3>Total a Pagar:</h3><p>${totalPrecio.toFixed(2)} COP</p>`;
            }

            pagarReservaBtn.style.display = 'block';
        });
    });
}

// Función para mostrar errores
let errorTimeout; // Variable para almacenar el timeout del mensaje de error
function mostrarError(mensaje) {
    // Verificar si ya hay un mensaje de error visible
    const existingError = document.querySelector('.error');
    if (existingError) {
        return;
    }

    const errorDiv = document.createElement('div');
    errorDiv.classList.add('error');
    errorDiv.textContent = mensaje;
    errorDiv.style.color = 'red';
    errorDiv.style.marginTop = '10px';
    errorDiv.style.textAlign = 'center';

    const checkinContainer = document.querySelector('.date-picker');
    checkinContainer.appendChild(errorDiv);

    // Eliminar el mensaje de error después de 3 segundos
    errorTimeout = setTimeout(function () {
        errorDiv.remove();
    }, 3000);
}

document.addEventListener('DOMContentLoaded', function () {
    cargarHabitaciones();

    // Código para obtener datos del usuario
    fetch('http://127.0.0.1:3000/user-data')
        .then(response => response.json())
        .then(data => {
            if (data.nombreCompleto) {
                document.getElementById('nombreUsuario').textContent = data.nombreCompleto;
                document.getElementById('nombreUsuario').dataset.userId = data.id; // Asignar el ID de usuario al nuevo atributo
            } else {
                document.getElementById('nombreUsuario').textContent = 'Invitado';
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del usuario:', error);
            document.getElementById('nombreUsuario').textContent = 'Invitado';
        });
});

// Código para manejar la búsqueda de habitaciones
const searchForm = document.getElementById('search-form');
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();

    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    const personas = count;

    // Ajustar filtros según el número de personas
    let maxPersonasFiltro;
    let descripcionesFiltro = [];

    if (personas === 1 || personas === 2) {
        maxPersonasFiltro = 2;
        descripcionesFiltro = ["ESTANDAR SENCILLA", "ESTANDAR MATRIMONIAL"];
    } else {
        switch (personas) {
            case 3:
                maxPersonasFiltro = 4;
                descripcionesFiltro = ["ESTANDAR TRIPLE", "ESTANDAR DOBLE"];
                break;
            case 4:
                maxPersonasFiltro = 4;
                descripcionesFiltro = ["ESTANDAR DOBLE"];
                break;
            case 5:
            case 6:
                maxPersonasFiltro = 6;
                descripcionesFiltro = ["ESTANDAR TRIPLE"];
                break;
        }
    }
    let filtros = {
        maxPersonas: maxPersonasFiltro,
        estadoHabitacion: 'DISPONIBLE'
    };

    if (descripcionesFiltro.length > 0) {
        filtros.descripcion = descripcionesFiltro.join(',');
    }

    cargarHabitaciones(filtros);
});

// Código para pagar reserva y mostrar modal
const modal = document.getElementById('modal');
const closeBtn = document.querySelector('.close-btn');
const modalDate = document.getElementById('modal-date');
const modalHabitaciones = document.getElementById('modal-habitaciones');
const modalTotal = document.getElementById('modal-total');
const confirmarPagoBtn = document.getElementById('confirmarPagoBtn');

pagarReservaBtn.addEventListener('click', function() {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    const days = calcularDias(checkin, checkout); // Calcular los días usando la función calcularDias
    modalDate.textContent = `Fecha de Reserva: ${checkin} - ${checkout}`;

    // Limpiar el contenido anterior del modal
    modalHabitaciones.innerHTML = '';

    // Agregar detalles de cada habitación
    resumenDiv.querySelectorAll('.resumen-item').forEach(item => {
        const nombreHabitacion = item.querySelector('h4').textContent;
        const precioTotalHabitacion = parseFloat(item.querySelector('p:nth-of-type(4)').textContent.replace('Precio Total: ', '').replace(' COP', ''));
        const precioHabitacion = precioTotalHabitacion / days; // Precio por día

        const habitacionInfo = document.createElement('p');
        habitacionInfo.textContent = `- ${nombreHabitacion} (${precioHabitacion.toFixed(2)} COP) por ${days} días: ${precioTotalHabitacion.toFixed(2)} COP`;
        modalHabitaciones.appendChild(habitacionInfo);
    });

    modalTotal.textContent = `Total a Pagar: ${totalPrecio.toFixed(2)} COP`;
    modal.style.display = 'block';
});

closeBtn.addEventListener('click', function() {
    modal.style.display = 'none';
});

window.addEventListener('click', function(event) {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

confirmarPagoBtn.addEventListener('click', function() {
    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    const numHabitaciones = resumenDiv.querySelectorAll('.resumen-item').length; 
    const usuarioId = document.getElementById('nombreUsuario').dataset.userId;

    const reservaData = {
        idUsuario: usuarioId,
        fechaInicio: checkin,
        fechaFin: checkout,
        numeroHabitaciones: numHabitaciones,
        valorPago: totalPrecio,
        habitaciones: [] 
    };

    resumenDiv.querySelectorAll('.resumen-item').forEach(item => {
        const idHabitacion = item.querySelector('.id-habitacion').textContent;
        reservaData.habitaciones.push(idHabitacion);
    });

    fetch('http://127.0.0.1:3000/confirmarPago', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(reservaData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Pago Confirmado');
            modal.style.display = 'none';
            // Redirigir a la página de detalles de pago
            window.location.href = 'detallesPagos.html';
        } else {
            alert('Error al confirmar el pago');
        }
    })
    .catch(error => {
        console.error('Error al confirmar el pago:', error);
    });
});









