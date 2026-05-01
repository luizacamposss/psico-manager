const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // LISTAR POR PACIENTE
   router.get("/:paciente_id", (req, res) => {
    const sql = `
        SELECT 
            pr.id,
            pr.anotacoes,
            pr.status_preenchimento,
            pr.data_registro,
            a.data AS data_sessao,
            a.horario
        FROM prontuarios pr
        LEFT JOIN agendamentos a ON pr.agendamento_id = a.id
        WHERE pr.paciente_id = ?
        ORDER BY pr.data_registro DESC
    `;

    db.query(sql, [req.params.paciente_id], (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});
    // CRIAR
   router.post("/", (req, res) => {
    const { paciente_id, agendamento_id, anotacoes, status_preenchimento } = req.body;

    const sql = `
        INSERT INTO prontuarios 
        (paciente_id, agendamento_id, anotacoes, status_preenchimento)
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [paciente_id, agendamento_id || null, anotacoes, status_preenchimento],
        (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Prontuário registrado" });
        }
    );
});

    return router;
};