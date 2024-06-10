document.addEventListener('DOMContentLoaded', function () {
    fetch('http://127.0.0.1:3000/user-data')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.nombreCompleto) {
                document.getElementById('nombreUsuario').textContent = data.nombreCompleto;
            } else {
                document.getElementById('nombreUsuario').textContent = 'Invitado';
            }

            // Obtener las reservas del usuario
            return fetch('http://127.0.0.1:3000/reservas-usuario');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al obtener reservas del usuario');
            }
            return response.json();
        })
        .then(reservas => {
            const detallesReservaDiv = document.getElementById('detallesReserva');

            if (reservas.length > 0) {
                reservas.forEach(reserva => {
                    const reservaDiv = document.createElement('div');
                    reservaDiv.classList.add('reserva');

                    const habitacionesParagraph = document.createElement('p');
                    habitacionesParagraph.innerHTML = `<strong>Número de Habitaciones:</strong> ${reserva.numeroHabitaciones}`;
                    reservaDiv.appendChild(habitacionesParagraph);

                    const fechaInicioParagraph = document.createElement('p');
                    fechaInicioParagraph.innerHTML = `<strong>Fecha de Inicio:</strong> ${new Date(reserva.fechaInicio).toLocaleDateString()}`;
                    reservaDiv.appendChild(fechaInicioParagraph);

                    const fechaFinParagraph = document.createElement('p');
                    fechaFinParagraph.innerHTML = `<strong>Fecha de Fin:</strong> ${new Date(reserva.fechaFin).toLocaleDateString()}`;
                    reservaDiv.appendChild(fechaFinParagraph);

                    detallesReservaDiv.appendChild(reservaDiv);
                });
            } else {
                detallesReservaDiv.textContent = 'No hay reservas disponibles.';
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del usuario o reservas:', error);
            alert('Error al obtener datos del usuario o reservas: ' + error.message);
        });
});

function redirectUser() {
    fetch('http://127.0.0.1:3000/user-data')
        .then(response => response.json())
        .then(data => {
            const userId = data.id;

            // Verificar el ID del usuario y redirigir en consecuencia
            if (userId === 0) {
                window.location.href = '/iniAdmin.html';
            } else {
                window.location.href = '/sesionIniciada.html';
            }
        })
        .catch(error => {
            console.error('Error al obtener el ID del usuario:', error);
            window.location.href = '/login.html';
        });
}
