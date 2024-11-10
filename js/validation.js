// Input validation utility object
const inputValidation = {
    // Sanitize general text input
    sanitizeInput(input) {
        if (typeof input !== 'string') return '';
        return input
            .trim()
            .replace(/[<>]/g, '') // Remove < and > characters
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;')
            .replace(/\//g, '&#x2F;');
    },

    // Validate email format
    validateEmail(email) {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return emailRegex.test(email);
    },

    // Validate name
    validateName(name) {
        return name.trim().length >= 2 && /^[A-Za-z\s]+$/.test(name);
    },

    // Validate message
    validateMessage(message) {
        const sanitized = this.sanitizeInput(message);
        return sanitized.length >= 10 && sanitized.length <= 1000;
    },

    // Rate limiting for form submissions
    submissions: new Map(),
    
    checkSubmissionRate(email, maxAttempts = 5, timeWindow = 15 * 60 * 1000) {
        const now = Date.now();
        const userSubmissions = this.submissions.get(email) || { count: 0, timestamp: now };

        // Reset counter if time window has passed
        if (now - userSubmissions.timestamp > timeWindow) {
            userSubmissions.count = 0;
            userSubmissions.timestamp = now;
        }

        // Check if user has exceeded submission limit
        if (userSubmissions.count >= maxAttempts) {
            const timeRemaining = timeWindow - (now - userSubmissions.timestamp);
            if (timeRemaining > 0) {
                throw new Error(`Too many attempts. Please try again in ${Math.ceil(timeRemaining / 60000)} minutes`);
            }
            userSubmissions.count = 0;
        }

        return true;
    },

    // Record submission attempt
    recordSubmission(email) {
        const userSubmissions = this.submissions.get(email) || { count: 0, timestamp: Date.now() };
        userSubmissions.count += 1;
        this.submissions.set(email, userSubmissions);
    }
};

// Form validation handler
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("contact-form");
    const validationMessages = document.getElementById("validation-messages");

    function showValidationMessage(message, isError = true) {
        validationMessages.textContent = message;
        validationMessages.style.color = isError ? '#d9534f' : '#5cb85c';
        validationMessages.classList.add("show");
        setTimeout(() => {
            validationMessages.classList.remove("show");
        }, 5000);
    }

    form.addEventListener("submit", async function (event) {
        event.preventDefault();

	// Honeypot field validation
const honey = document.getElementById("honeypot").value;
if (honey) {
    showValidationMessage("Spam detected. Form submission blocked.");
    return;
}


	//Place MORE validation rules HERE

        // Get form values
        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const message = document.getElementById("message").value;

        // Sanitize inputs
        const sanitizedName = inputValidation.sanitizeInput(name);
        const sanitizedEmail = inputValidation.sanitizeInput(email);
        const sanitizedMessage = inputValidation.sanitizeInput(message);

        // Validate name
        if (!inputValidation.validateName(sanitizedName)) {
            showValidationMessage("Please enter a valid name (letters and spaces only)");
            return;
        }

        // Validate email
        if (!inputValidation.validateEmail(sanitizedEmail)) {
            showValidationMessage("Please enter a valid email address");
            return;
        }

        // Validate message
        if (!inputValidation.validateMessage(sanitizedMessage)) {
            showValidationMessage("Message must be between 10 and 1000 characters");
            return;
        }

        // Check submission rate
        try {
            inputValidation.checkSubmissionRate(sanitizedEmail);
        } catch (error) {
            showValidationMessage(error.message);
            return;
        }

        try {
            // Submit to Formspree
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (response.ok) {
                inputValidation.recordSubmission(sanitizedEmail);
                form.reset();
                showValidationMessage("Thank you for your message! We'll get back to you soon.", false);
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            showValidationMessage("Oops! There was a problem sending your message. Please try again.");
        }
    });
});