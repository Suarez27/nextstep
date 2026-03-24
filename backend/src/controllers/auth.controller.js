const hardcodedUser = {
    id: 1,
    name: "Administrador NextStep",
    email: "admin@nextstep.com",
    password: "1234",
    role: "admin",
};

const login = (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: "Email y contraseña son obligatorios",
        });
    }

    if (email !== hardcodedUser.email || password !== hardcodedUser.password) {
        return res.status(401).json({
            success: false,
            message: "Credenciales incorrectas",
        });
    }

    return res.status(200).json({
        success: true,
        message: "Inicio de sesión correcto",
        token: "fake-jwt-token-nextstep",
        user: {
            id: hardcodedUser.id,
            name: hardcodedUser.name,
            email: hardcodedUser.email,
            role: hardcodedUser.role,
        },
    });
};

module.exports = {
    login,
};