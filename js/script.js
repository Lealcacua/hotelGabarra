const signInBtnLink = document.querySelector('.signInBtn-link');
const signUpBtnLink = document.querySelector('.signUpBtn-link');
const wrapper = document.querySelector('.wrapper');

signUpBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})

signInBtnLink.addEventListener('click', () => {
    wrapper.classList.toggle('active');
})

async function login() {
    const numeroCelular = document.getElementById('numeroCelular').value;
    const Contrasena = document.getElementById('Contrasena').value;

    try {
        const response = await fetch('http://127.0.0.1:5500/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ numeroCelular, Contrasena })
        });

        if (!response.ok) {
            throw new Error('Error en el servidor');
        }

        const data = await response.json();
        window.location.href = data.redirectTo; // Redirige al usuario a la URL proporcionada por el servidor
    } catch (error) {
        console.error('Error de inicio de sesión:', error);
        alert('Error al iniciar sesión. Por favor, inténtalo de nuevo.');
    }
}

