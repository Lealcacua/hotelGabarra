function handlePriceEdit(cell) {
    const editBtn = cell.parentElement.querySelector('.edit-price-btn');
    
    editBtn.addEventListener('click', function () {
        const idHabitacion = cell.parentElement.querySelector('td:first-child').textContent;
        const currentPrice = cell.textContent;

        const newPrice = prompt('Introduce el nuevo precio:', currentPrice);
        if (newPrice !== null && newPrice !== currentPrice) {
            updatePrice(idHabitacion, newPrice);
        }
    });
}



// habitaciones.js
document.addEventListener('DOMContentLoaded', function () {
    const habitacionesBody = document.getElementById('habitacionesBody');

    fetch('http://localhost:3000/habitaciones')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            data.forEach(habitacion => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${habitacion.idHabitacion}</td>
                    <td>${habitacion.imagenURL}</td>
                    <td>${habitacion.descripcion}</td>
                    <td>${habitacion.maxPersonas}</td>
                    <td class="price-cell">${habitacion.precio}</td>
                    <td>${habitacion.estadoHabitacion}</td>
                    <td><button class="edit-price-btn">Editar</button></td>
                `;
                habitacionesBody.appendChild(row);

                const priceCell = row.querySelector('.price-cell');
                handlePriceEdit(priceCell);
            });
        })
        .catch(error => console.error('Error fetching habitaciones:', error));
});

const updatePrice = async (idHabitacion, newPrice) => {
    try {
        const response = await fetch(`http://localhost:3000/precio/${idHabitacion}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ precio: newPrice })
        });

        if (!response.ok) {
            throw new Error('Error al actualizar el precio');
        }

        // Actualiza el precio en la tabla
        const priceCell = document.querySelector(`#habitacionesBody tr td:first-child[data-id="${idHabitacion}"]`);
        priceCell.textContent = newPrice;

        alert('Precio actualizado correctamente');
    } catch (error) {
        console.error('Error al actualizar el precio:', error);
        alert('Error al actualizar el precio. Por favor, inténtalo de nuevo.');
    }
};


function redirectUser() {
    fetch('http://127.0.0.1:3000/user-data')
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