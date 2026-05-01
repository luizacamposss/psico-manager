const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // LISTAR
    router.get("/", (req, res) => {
        db.query("SELECT * FROM pacientes", (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        });
    });

    // CADASTRAR
   router.post("/", (req, res) => {
    const {
        nome,
        cpf,
        telefone,
        email,
        data_nascimento,
        observacoes,
        queixa_principal,
        historico_clinico,
        medicamentos,
        contato_emergencia
    } = req.body;

    const sql = `
        INSERT INTO pacientes 
        (nome, cpf, telefone, email, data_nascimento, observacoes, queixa_principal, historico_clinico, medicamentos, contato_emergencia)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            nome,
            cpf,
            telefone,
            email,
            data_nascimento,
            observacoes,
            queixa_principal,
            historico_clinico,
            medicamentos,
            contato_emergencia
        ],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Paciente cadastrado" });
        }
    );
});

    // DELETAR
    router.delete("/:id", (req, res) => {
        db.query("DELETE FROM pacientes WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Paciente deletado");
        });
    });

    return router;
};