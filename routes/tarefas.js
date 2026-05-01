const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    // LISTAR TAREFAS
    router.get("/", (req, res) => {
        const sql = `
            SELECT 
                t.id,
                t.titulo,
                t.descricao,
                t.status,
                t.data_criacao,
                p.nome AS paciente
            FROM tarefas t
            LEFT JOIN pacientes p ON t.paciente_id = p.id
            ORDER BY t.data_criacao DESC
        `;

        db.query(sql, (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(result);
        });
    });

    // CADASTRAR TAREFA
    router.post("/", (req, res) => {
        const { paciente_id, titulo, descricao, status } = req.body;

        const sql = `
            INSERT INTO tarefas 
            (paciente_id, titulo, descricao, status)
            VALUES (?, ?, ?, ?)
        `;

        db.query(
            sql,
            [paciente_id || null, titulo, descricao, status || "Pendente"],
            (err) => {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ mensagem: "Tarefa cadastrada" });
            }
        );
    });

    // MARCAR COMO CONCLUÍDA
    router.put("/:id/concluir", (req, res) => {
        db.query(
            "UPDATE tarefas SET status = 'Concluída' WHERE id = ?",
            [req.params.id],
            (err) => {
                if (err) return res.status(500).json({ erro: err.message });
                res.json({ mensagem: "Tarefa concluída" });
            }
        );
    });

    // DELETAR TAREFA
    router.delete("/:id", (req, res) => {
        db.query("DELETE FROM tarefas WHERE id = ?", [req.params.id], (err) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json({ mensagem: "Tarefa deletada" });
        });
    });

    return router;
};