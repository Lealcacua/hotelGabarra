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
                <button class="addReservaBtn">AÑADIR A RESERVA</button>
            </div>
        `;
        roomsContainer.appendChild(roomCard);

        // Añadir evento de click al nuevo botón
        roomCard.querySelector('.addReservaBtn').addEventListener('click', function () {
            const roomInfo = this.parentElement;
            const roomName = roomInfo.querySelector('h3').textContent;
            const roomPrice = roomInfo.querySelectorAll('p')[1].textContent;

            const resumenItem = document.createElement('div');
            resumenItem.classList.add('resumen-item');
            resumenItem.innerHTML = `
                <h4>${roomName}</h4>
                <p>${roomPrice}</p>
            `;
            resumenDiv.appendChild(resumenItem);

            pagarReservaBtn.style.display = 'block';
        });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    cargarHabitaciones();

    // Código para obtener datos del usuario
    fetch('http://127.0.0.1:3000/user-data')
        .then(response => response.json())
        .then(data => {
            if (data.nombreCompleto) {
                document.getElementById('nombreUsuario').textContent = data.nombreCompleto;
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
searchForm.addEventListener('submit', function(event) {
    event.preventDefault();

    const checkin = checkinInput.value;
    const checkout = checkoutInput.value;
    const personas = count;

    const filtros = {
        maxPersonas: personas,
        estadoHabitacion: 'DISPONIBLE'
    };

    cargarHabitaciones(filtros);
});









