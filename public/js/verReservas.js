function handlePriceEdit(cell) {
    cell.addEventListener('dblclick', function () {
        const idHabitacion = cell.parentElement.querySelector('td:first-child').textContent;
        const currentPrice = cell.textContent;

        const newPrice = prompt('Introduce el nuevo precio:', currentPrice);
        if (newPrice !== null && newPrice !== currentPrice) {
            cell.textContent = newPrice; 
            updatePrice(idReservas, newPrice);
        }
    });
}

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
            data.forEach(reservas => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${reservas.idReservas}</td>
                    <td>${reservas.idUsuario}</td>
                    <td>${reservas.Habitaciones}</td>
                    <td>${reservas.fechaInicio}</td>
                    <td>${reservas.fechaFin}</td>
                    <td>${reservas.estadoPago}</td>
                `;
                reservasBody.appendChild(row);

                const priceCell = row.querySelector('td:last-child');
                handlePriceEdit(priceCell);
            });
        })
        .catch(error => console.error('Error fetching reservas:', error));
});

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