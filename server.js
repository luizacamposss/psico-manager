const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "psico_manager"
});

db.connect(err => {
    if (err) {
        console.error("Erro ao conectar:", err);
    } else {
        console.log("MySQL conectado");
    }
});

// IMPORTAR ROTAS
const pacientesRoutes = require("./routes/pacientes")(db);
const agendamentosRoutes = require("./routes/agendamentos")(db);
const usuariosRoutes = require("./routes/usuarios")(db);
const prontuariosRoutes = require("./routes/prontuarios")(db);
const financeiroRoutes = require("./routes/financeiro")(db);
const tarefasRoutes = require("./routes/tarefas")(db);



// USAR ROTAS
app.use("/pacientes", pacientesRoutes);
app.use("/agendamentos", agendamentosRoutes);
app.use("/usuarios", usuariosRoutes);
app.use("/prontuarios", prontuariosRoutes);
app.use("/financeiro", financeiroRoutes);
app.use("/tarefas", tarefasRoutes);

// DASHBOARD (fica aqui mesmo)
app.get("/dashboard", (req, res) => {
    const sql = `
        SELECT
            (SELECT COUNT(*) FROM pacientes) AS total_pacientes,
            (SELECT COUNT(*) FROM agendamentos) AS total_agendamentos,
            (SELECT COUNT(*) FROM agendamentos WHERE status = 'Confirmada') AS confirmados,
            (SELECT COUNT(*) FROM agendamentos WHERE status = 'Cancelada') AS cancelados,
            (SELECT IFNULL(SUM(valor), 0) FROM financeiro WHERE status = 'Pago') AS total_recebido,
            (SELECT IFNULL(SUM(valor), 0) FROM financeiro WHERE status = 'Pendente') AS total_pendente
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0]);
    });
});

app.get("/dashboard/receitas", (req, res) => {
    const sql = `
        SELECT 
            DATE_FORMAT(data_pagamento, '%m/%Y') AS mes,
            SUM(valor) AS total
        FROM financeiro
        WHERE status = 'Pago'
        GROUP BY DATE_FORMAT(data_pagamento, '%m/%Y')
        ORDER BY MIN(data_pagamento)
    `;

    db.query(sql, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
});

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});