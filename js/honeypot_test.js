// Honeypot field validation
const honey = document.getElementById("honeypot").value;
if (honey) {
    showValidationMessage("Spam detected. Form submission blocked.");
    return;
}
