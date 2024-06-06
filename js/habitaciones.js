document.addEventListener('DOMContentLoaded', function () {
    fetch('/habitaciones12')
       .then(response => response.json())
       .then(data => {
            const habitacionesBody = document.getElementById('habitacionesBody');
            data.forEach(habitacion => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${habitacion.idHabitacion}</td>
                    <td>${habitacion.numeroHabitacion}</td>
                    <td>${habitacion.descripcion}</td>
                    <td>${habitacion.precio}</td>
                `;
                habitacionesBody.appendChild(row);
            });
        })
       .catch(error => console.error('Error fetching habitaciones:', error));
});
