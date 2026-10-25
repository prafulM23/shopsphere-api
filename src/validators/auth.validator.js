
export const validateSignup = ({ name, email, password }) => {
    const errors = {};

    if (!name || typeof name !== "string" || !name.trim()) {
        errors.name = "Name is required";
    }

    if (!email || typeof email !== "string" || !email.trim()) {
        errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
        errors.email = "Please enter a valid email address";
    }

    if (!password || typeof password !== "string") {
        errors.password = "Password is required";
    } else if (password.length < 8) {
        errors.password = "Password must be at least 8 characters long";
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors,
    };
};
