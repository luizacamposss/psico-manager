const express = require("express");

module.exports = (db) => {
    const router = express.Router();

    router.get("/", (req, res) => {
        db.query("SELECT * FROM psicologos", (err, result) => {
            if (err) return res.status(500).json({ erro: err.message });
            res.json(result);
        });
    });

    return router;
};