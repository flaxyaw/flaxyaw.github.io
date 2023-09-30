const generateButton = document.getElementById('generate');
const passwordField = document.getElementById('password');
const passwordLengthInput = document.getElementById('password-length');
const includeNumbersCheckbox = document.getElementById('include-numbers');
const includeSpecialCharsCheckbox = document.getElementById('include-special-chars');

// Function to generate a random password
function generatePassword() {
    const length = parseInt(passwordLengthInput.value) || 50;
    const includeNumbers = includeNumbersCheckbox.checked;
    const includeSpecialChars = includeSpecialCharsCheckbox.checked;

    let charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    if (includeNumbers) charset += "0123456789";
    if (includeSpecialChars) charset += "!@#$%^&*()_+";

    let password = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        password += charset.charAt(randomIndex);
    }

    passwordField.value = password;
}

// Event listener for the generate button
generateButton.addEventListener('click', generatePassword);

// Initial password generation on page load
generatePassword();
