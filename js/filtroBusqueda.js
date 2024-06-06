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

const addReservaBtns = document.querySelectorAll('.addReservaBtn');
const resumenDiv = document.getElementById('resumen');
const pagarReservaBtn = document.getElementById('pagarReserva');

addReservaBtns.forEach(button => {
    button.addEventListener('click', function () {
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








