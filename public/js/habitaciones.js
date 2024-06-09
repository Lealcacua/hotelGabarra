function handlePriceEdit(cell) {
    cell.addEventListener('dblclick', function () {
        const idHabitacion = cell.parentElement.querySelector('td:first-child').textContent;
        const currentPrice = cell.textContent;

        const newPrice = prompt('Introduce el nuevo precio:', currentPrice);
        if (newPrice !== null && newPrice !== currentPrice) {
            cell.textContent = newPrice; 
            updatePrice(idHabitacion, newPrice);
        }
    });
}

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
                    <td>${habitacion.precio}</td>
                    <td>${habitacion.estadoHabitacion}</td>
                `;
                habitacionesBody.appendChild(row);

                const priceCell = row.querySelector('td:last-child');
                handlePriceEdit(priceCell);
            });
        })
        .catch(error => console.error('Error fetching habitaciones:', error));
});

async function updatePrice(idHabitacion, newPrice) {
    try {
        const response = await fetch(`http://localhost:3000/habitaciones/${idHabitacion}`, {
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
