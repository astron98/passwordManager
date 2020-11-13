const togglePassword = document.querySelector('#togglePassword');
const password = document.getElementsByName('password');

togglePassword.addEventListener('click', function (e) {
    // toggle the type attribute
    const type = password.getAttribute('type') === 'password' ? 'text' : 'password';
    password.setAttribute('type', type);
    // toggle the icon
    this.classList.toggle('fa-eye-slash');
});