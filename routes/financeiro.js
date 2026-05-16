const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    router.get("/", (req, res) => {
        const sql = `
            SELECT 
                f.id,
                p.nome AS paciente,
                f.valor,
                f.forma_pagamento,
                f.status,
                f.data_pagamento
            FROM financeiro f
            JOIN pacientes p ON f.paciente_id = p.id
            ORDER BY f.data_pagamento DESC
        `;

        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(result);
        });
    });

    router.post("/", (req, res) => {
        const { paciente_id, agendamento_id, valor, forma_pagamento, status } = req.body;

       const sql = `
            INSERT INTO financeiro
            (paciente_id, agendamento_id, valor, forma_pagamento, status, data_pagamento)
            VALUES (?, ?, ?, ?, ?, CURDATE())
        `;

        db.query(sql, [paciente_id, agendamento_id, valor, forma_pagamento, status], (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Pagamento registrado" });
        });
    });

    return router;
};