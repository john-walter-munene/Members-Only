(function () {
    const form = document.querySelector('form');

    const firstNameInput = document.getElementById('first-name');
    const lastNameInput = document.getElementById('last-name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirm-password');

    // Determine if user is signing up based on presence of sign-up specific fields
    const isSignUp = firstNameInput && lastNameInput && confirmPasswordInput;

    // Prevent form submission if there are validation errors
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        validateForm();
    });

    function validateForm() {
        clearErrors();

        let isValid = true;

        // Handle sign-up specific fields first
        if (isSignUp) {
            if (!validateFirstName()) isValid = false;
            if (!validateLastName()) isValid = false;
        }

        // Handle shared fields (email and password) for both sign-up and sign-in
        if (!validateEmail()) isValid = false;
        if (!validatePassword()) isValid = false;

        // Handle confirm password only for sign-up
        if (isSignUp && !validatePasswordConfirm()) isValid = false;

        // Submit valid form
        if (isValid) form.submit();
    }

    function validateFirstName() {
        const firstName = firstNameInput.value.trim();

        if (firstName.length < 3) {
            setErrorFor(firstNameInput, 'First name must be at least 3 characters.');
            return false;
        }

        if (firstName.length > 15) {
            setErrorFor(firstNameInput, 'First name cannot exceed 15 characters.');
            return false;
        }

        setSuccessFor(firstNameInput);
        return true;
    }

    function validateLastName() {
        const lastName = lastNameInput.value.trim();

        if (lastName.length < 3) {
            setErrorFor(lastNameInput, 'Last name must be at least 3 characters.');
            return false;
        }

        if (lastName.length > 15) {
            setErrorFor(lastNameInput, 'Last name cannot exceed 15 characters.');
            return false;
        }

        setSuccessFor(lastNameInput);
        return true;
    }

    function validateEmail() {
        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
            setErrorFor(emailInput, 'Please enter a valid email address.');
            return false;
        } else {
            setSuccessFor(emailInput);
            return true;
        }
    }

    function validatePassword() {
        const password = passwordInput.value.trim();

        if (password.length < 6) {
            setErrorFor(passwordInput, 'Password must be at least 6 characters long.');
            return false;
        } else {
            setSuccessFor(passwordInput);
            return true;
        }
    }

    function validatePasswordConfirm() {
        const password = passwordInput.value.trim();
        const confirmPassword = confirmPasswordInput.value.trim();

        if (confirmPassword !== password) {
            setErrorFor(confirmPasswordInput, 'Passwords do not match');
            return false;
        } else {
            setSuccessFor(confirmPasswordInput);
            return true;
        }
    }

    function setErrorFor(input, message) {
        const formControl = input.parentElement;
        const small = formControl.querySelector('small');

        small.textContent = message;
        small.className = 'form-control error';
    }

    function setSuccessFor(input) {
        const formControl = input.parentElement;
        formControl.className = 'form-control success';
    }

    function clearErrors() {
        const errorMessages = document.querySelectorAll('small');

        errorMessages.forEach((message) => {
            message.textContent = '';
            message.style.display = 'none';
        });
    }
})();