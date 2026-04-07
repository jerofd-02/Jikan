function togglePassword(inputId, btnId) {
    const input = document.getElementById(inputId);
    const btn = document.getElementById(btnId);
    if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = '<i class="far fa-eye"></i>';
    } else {
        input.type = 'password';
        btn.innerHTML = '<i class="far fa-eye-slash"></i>';
    }
}

document.getElementById('toggle-btn').addEventListener('click', function () {
    togglePassword('password', 'toggle-btn');
});

document.getElementById('toggle-btn2').addEventListener('click', function () {
    togglePassword('new-password', 'toggle-btn2');
});

document.getElementById('toggle-btn3').addEventListener('click', function () {
    togglePassword('confirm-password', 'toggle-btn3');
});
