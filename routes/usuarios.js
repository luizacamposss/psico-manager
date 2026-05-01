const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // CADASTRAR USUÁRIO
    router.post("/cadastro", (req, res) => {
        const { nome, email, senha, tipo } = req.body;

        db.query(
            "INSERT INTO usuarios SET ?",
            { nome, email, senha, tipo },
            (err) => {
                if (err) return res.status(500).send(err);
                res.send("Usuário cadastrado");
            }
        );
    });

    // LOGIN
    router.post("/login", (req, res) => {
        const { email, senha } = req.body;

        db.query(
            "SELECT * FROM usuarios WHERE email = ? AND senha = ?",
            [email, senha],
            (err, result) => {
                if (err) return res.status(500).send(err);

                if (result.length === 0) {
                    return res.status(401).send("Login inválido");
                }

                res.json(result[0]);
            }
        );
    });

    return router;
};