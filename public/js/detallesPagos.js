document.addEventListener('DOMContentLoaded', function () {
    const reservaDetalles = JSON.parse(localStorage.getItem('reservaDetalles'));

    if (reservaDetalles) {
        document.getElementById('nombreUsuario').textContent = reservaDetalles.username || '(nombre de usuario)';
        const resumenDiv = document.createElement('div');
        resumenDiv.classList.add('resumen');

        const dateParagraph = document.createElement('p');
        dateParagraph.textContent = `Fecha: ${reservaDetalles.date}`;
        resumenDiv.appendChild(dateParagraph);

        const habitacionesDiv = document.createElement('div');
        habitacionesDiv.innerHTML = reservaDetalles.habitaciones;
        resumenDiv.appendChild(habitacionesDiv);

        const totalParagraph = document.createElement('p');
        totalParagraph.textContent = `Total: ${reservaDetalles.total}`;
        resumenDiv.appendChild(totalParagraph);

        document.body.appendChild(resumenDiv);
    } else {
        alert('No hay detalles de reserva disponibles.');
    }
});
