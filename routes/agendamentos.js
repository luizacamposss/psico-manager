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
            ps.nome AS psicologo,
            a.data,
            a.horario,
            a.status
        FROM agendamentos a
        INNER JOIN pacientes p ON a.paciente_id = p.id
        INNER JOIN psicologos ps ON a.psicologo_id = ps.id
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });
        res.json(result);
    });
});

    // CADASTRAR
   router.post("/", (req, res) => {
    const { paciente_id, psicologo_id, data, horario, status } = req.body;

    const verificarSql = `
        SELECT * FROM agendamentos
        WHERE psicologo_id = ?
        AND data = ?
        AND horario = ?
    `;

    db.query(verificarSql, [psicologo_id, data, horario], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });

        if (result.length > 0) {
            return res.status(400).json({
                erro: "Este psicólogo já possui um agendamento nesse dia e horário."
            });
        }

        const inserirSql = `
            INSERT INTO agendamentos 
            (paciente_id, psicologo_id, data, horario, status)
            VALUES (?, ?, ?, ?, ?)
        `;

        db.query(
            inserirSql,
            [paciente_id, psicologo_id, data, horario, status],
            (err) => {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ mensagem: "Agendamento cadastrado" });
            }
        );
    });
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
    const id = req.params.id;

    const verificarSql = `
        SELECT * FROM agendamentos
        WHERE psicologo_id = ?
        AND data = ?
        AND horario = ?
        AND id <> ?
    `;

    db.query(verificarSql, [psicologo_id, data, horario, id], (err, result) => {
        if (err) return res.status(500).json({ erro: err.message });

        if (result.length > 0) {
            return res.status(400).json({
                erro: "Este psicólogo já possui outro agendamento nesse dia e horário."
            });
        }

        const atualizarSql = `
            UPDATE agendamentos
            SET paciente_id = ?, psicologo_id = ?, data = ?, horario = ?, status = ?
            WHERE id = ?
        `;

        db.query(
            atualizarSql,
            [paciente_id, psicologo_id, data, horario, status, id],
            (err) => {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ mensagem: "Agendamento atualizado" });
            }
        );
    });
});
    return router;
};