document.addEventListener('DOMContentLoaded', function () {
    const customSelectWrapper = document.querySelector('.custom-select-wrapper');
    const customSelect = document.querySelector('.custom-select');
    const customOptions = document.querySelectorAll('.custom-option');
    const triggerSpan = customSelect.querySelector('.custom-select__trigger span');
    const nativeSelect = document.querySelector('select.custom-select');
    const formWrapper = document.querySelector('.form-wrapper');
    const customOptionsContainer = document.querySelector('.custom-options');

    function adjustFormHeight() {
        var extraHeight = 1;

        if (customSelect.classList.contains('open')) {
            var desiredHeight = formWrapper.scrollHeight + customOptionsContainer.scrollHeight + extraHeight;
            formWrapper.style.height = desiredHeight + 'px';
        } else {
            formWrapper.style.height = 'auto';
        }
    }

    customSelectWrapper.addEventListener('click', function (e) {
        customSelect.classList.toggle('open');
        adjustFormHeight();
        e.stopPropagation();  // Evita que el clic se propague y cause otros efectos secundarios
    });

    customOptions.forEach(option => {
        option.addEventListener('click', function () {
            customOptions.forEach(opt => opt.classList.remove('selected'));
            this.classList.add('selected');
            triggerSpan.textContent = this.textContent;
            nativeSelect.value = this.getAttribute('data-value');
            customSelect.classList.remove('open');
            adjustFormHeight();
            formWrapper.style.height = 'auto';
        });
    });

    window.addEventListener('click', function (e) {
        if (!customSelectWrapper.contains(e.target)) {
            customSelect.classList.remove('open');
            adjustFormHeight();
        }
    });

    // Funcionalidad de incremento y decremento para el contador de personas
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
});




