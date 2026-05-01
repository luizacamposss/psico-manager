const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // LISTAR
    router.get("/", (req, res) => {
        const sql = `
            SELECT 
                a.id,
                a.paciente_id,
                a.psicologo_id,
                p.nome AS paciente,
                psi.nome AS psicologo,
                a.data,
                a.horario,
                a.status
            FROM agendamentos a
            JOIN pacientes p ON a.paciente_id = p.id
            JOIN psicologos psi ON a.psicologo_id = psi.id
        `;

        db.query(sql, (err, result) => {
            if (err) return res.status(500).send(err);
            res.json(result);
        });
    });

    // CADASTRAR
    router.post("/", (req, res) => {
        const { paciente_id, psicologo_id, data, horario, status } = req.body;

        db.query(
            "INSERT INTO agendamentos SET ?",
            { paciente_id, psicologo_id, data, horario, status },
            (err) => {
                if (err) return res.status(500).send(err);
                res.send("Agendamento criado");
            }
        );
    });

    // DELETAR (extra opcional)
    router.delete("/:id", (req, res) => {
        db.query("DELETE FROM agendamentos WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).send(err);
            res.send("Agendamento deletado");
        });
    });

    // LISTAR AGENDAMENTOS POR PACIENTE
router.get("/paciente/:paciente_id", (req, res) => {
    const sql = `
        SELECT 
            a.id,
            a.data,
            a.horario,
            a.status,
            p.nome AS paciente,
            psi.nome AS psicologo
        FROM agendamentos a
        JOIN pacientes p ON a.paciente_id = p.id
        JOIN psicologos psi ON a.psicologo_id = psi.id
        WHERE a.paciente_id = ?
        ORDER BY a.data DESC
    `;

    db.query(sql, [req.params.paciente_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

// ATUALIZAR AGENDAMENTO
router.put("/:id", (req, res) => {
    const { paciente_id, psicologo_id, data, horario, status } = req.body;

    const sql = `
        UPDATE agendamentos
        SET paciente_id = ?, psicologo_id = ?, data = ?, horario = ?, status = ?
        WHERE id = ?
    `;

    db.query(sql, [paciente_id, psicologo_id, data, horario, status, req.params.id], (err) => {
        if (err) return res.status(500).send(err);
        res.send("Agendamento atualizado");
    });
});

    return router;
};