document.addEventListener('DOMContentLoaded', function () {
    const reservasBody = document.getElementById('reservasBody');

    fetch('http://localhost:3000/reservas')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(reserva => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reserva.idReservas}</td>
                    <td>${reserva.idUsuario}</td>
                    <td>${reserva.numeroHabitaciones}</td>
                    <td>${reserva.fechaInicio}</td>
                    <td>${reserva.fechaFin}</td>
                    <td><button onclick="eliminarReserva(${reserva.idReservas})">Eliminar</button></td>
                `;
                reservasBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error fetching reservas:', error));
});

function eliminarReserva(id) {
    if (confirm(`¿Estás seguro de que quieres eliminar la reserva ${id}?`)) {
        fetch(`http://localhost:3000/eliminar-reserva/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('No se pudo eliminar la reserva');
            }
            return response.json();
        })
        .then(data => {
            alert('Reserva eliminada exitosamente');
            location.reload();
        })
        .catch(error => {
            console.error('Error al eliminar la reserva:', error);
            alert('No se pudo eliminar la reserva');
        });
    }
}

async function updatePrice(idReservas, newPrice) {
    try {
        const response = await fetch(`http://localhost:3000/habitaciones/${idReservas}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ precio: newPrice })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el precio');
        }

        alert('Precio actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar el precio:', error);
        alert('Error al actualizar el precio. Por favor, inténtalo de nuevo.');
    }
}

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

        var nombreCompleto = data.nombreCompleto;
        document.getElementById("nombreUsuario").textContent = nombreCompleto;
        console.log('Nombre completo del usuario:', nombreCompleto);
    })
    .catch(error => {
        console.error('Error al obtener datos del usuario:', error);
        document.getElementById('nombreUsuario').textContent = 'Invitado';
    });

    function redirectUser() {
        fetch('http://127.0.0.1:3000/user-data', {
            credentials: 'include'
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (data.id !== undefined) {
                const userId = data.id;

                if (userId === 0) {
                    window.location.href = '/iniAdmin.html';
                } else {
                    window.location.href = '/sesionIniciada.html';
                }
            } else {
                console.error('No se pudo obtener el ID del usuario');
            }
        })
        .catch(error => {
            console.error('Error al obtener datos del usuario:', error);
        });
    }
