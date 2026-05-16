const API = "https://psico-manager-production.up.railway.app";

let editandoAgendamentoId = null;

// ============================
// LOGIN
// ============================

async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const senha = document.getElementById("senha").value;

    const res = await fetch(`${API}/usuarios/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, senha })
    });

    if (!res.ok) {
        alert("Login inválido");
        return;
    }

    const usuario = await res.json();

    localStorage.setItem("usuario", JSON.stringify(usuario));

    alert("Login realizado!");
    window.location.href = "index.html";
}

// ============================
// PROTEÇÃO E PERMISSÕES
// ============================

function verificarLogin() {
    const usuario = localStorage.getItem("usuario");

    if (!usuario && !window.location.pathname.includes("login.html")) {
        window.location.href = "login.html";
    }
}

function mostrarUsuario() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    const el = document.getElementById("usuarioInfo");

    if (el) {
        el.innerText = `${usuario.nome} (${usuario.tipo})`;
    }
}

function verificarPermissoes() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    const tipo = usuario.tipo;

    const links = {
        pacientes: document.querySelector('a[href="pacientes.html"]'),
        agendamentos: document.querySelector('a[href="agendamentos.html"]'),
        agenda: document.querySelector('a[href="agenda.html"]'),
        prontuario: document.querySelector('a[href="prontuario.html"]'),
        financeiro: document.querySelector('a[href="financeiro.html"]'),
        tarefas: document.querySelector('a[href="tarefas.html"]'),
        dashboard: document.querySelector('a[href="dashboard.html"]')
    };

    // ADMIN vê tudo
    if (tipo === "admin") return;

    // PSICÓLOGO
    if (tipo === "psicologo") {
        if (links.financeiro) links.financeiro.style.display = "none";
        if (links.dashboard) links.dashboard.style.display = "none";
    }

    // PACIENTE
    if (tipo === "paciente") {
        Object.values(links).forEach(link => {
            if (link) link.style.display = "none";
        });

        // só tarefas aparece
        if (links.tarefas) links.tarefas.style.display = "block";
    }
}

function protegerPorTipo() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    const tipo = usuario.tipo;
    const pagina = window.location.pathname;

    // PSICÓLOGO não acessa financeiro nem dashboard
    if (tipo === "psicologo") {
        if (
            pagina.includes("financeiro.html") ||
            pagina.includes("dashboard.html")
        ) {
            window.location.href = "index.html";
        }
    }

    // PACIENTE só acessa index e tarefas
    if (tipo === "paciente") {
        if (
            pagina.includes("pacientes.html") ||
            pagina.includes("agendamentos.html") ||
            pagina.includes("agenda.html") ||
            pagina.includes("prontuario.html") ||
            pagina.includes("financeiro.html") ||
            pagina.includes("dashboard.html")
        ) {
            window.location.href = "index.html";
        }
    }
}

function logout() {
    localStorage.removeItem("usuario");
    window.location.href = "login.html";
}

// ============================
// PACIENTES
// ============================

async function cadastrarPaciente(event) {
    event.preventDefault();

    const paciente = {
        nome: document.getElementById("nome").value,
        cpf: document.getElementById("cpf").value,
        telefone: document.getElementById("telefone").value,
        email: document.getElementById("email").value,
        data_nascimento: document.getElementById("data_nascimento").value,
        contato_emergencia: document.getElementById("contato_emergencia").value,
        queixa_principal: document.getElementById("queixa_principal").value,
        historico_clinico: document.getElementById("historico_clinico").value,
        medicamentos: document.getElementById("medicamentos").value,
        observacoes: document.getElementById("observacoes").value
    };

    const res = await fetch(`${API}/pacientes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paciente)
    });

    if (!res.ok) {
        const erro = await res.json();
        alert("Erro ao cadastrar paciente: " + erro.erro);
        return;
    }

    alert("Paciente cadastrado!");
    document.getElementById("formPaciente").reset();
    listarPacientes();
}

async function listarPacientes() {
    const tabela = document.getElementById("listaPacientes");
    if (!tabela) return;

    const res = await fetch(`${API}/pacientes`);
    const pacientes = await res.json();

    tabela.innerHTML = "";

    pacientes.forEach(p => {
        tabela.innerHTML += `
            <tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.cpf || ""}</td>
                <td>${p.telefone || ""}</td>
                <td>${p.email || ""}</td>
                <td>
                    <button class="btn btn-sm btn-danger" onclick="deletarPaciente(${p.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });

    verificarPermissoes();
}

async function deletarPaciente(id) {
    await fetch(`${API}/pacientes/${id}`, {
        method: "DELETE"
    });

    alert("Paciente excluído!");
    listarPacientes();
}

function configurarPacienteProntuario() {
    const selectPaciente = document.getElementById("paciente_id");

    if (!selectPaciente) return;

    selectPaciente.addEventListener("change", () => {
        const pacienteId = selectPaciente.value;
        carregarAgendamentosSelect(pacienteId);
        buscarProntuarios();
    });
}

// ============================
// AGENDAMENTOS
// ============================

async function cadastrarAgendamento(event) {
    event.preventDefault();

    const dados = {
        paciente_id: document.getElementById("paciente_id").value,
        psicologo_id: document.getElementById("psicologo_id").value,
        data: document.getElementById("data").value,
        horario: document.getElementById("horario").value,
        status: document.getElementById("status").value
    };

    if (editandoAgendamentoId) {
        await fetch(`${API}/agendamentos/${editandoAgendamentoId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        alert("Agendamento atualizado!");
        editandoAgendamentoId = null;
    } else {
        await fetch(`${API}/agendamentos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(dados)
        });

        alert("Agendamento cadastrado!");
    }

    document.getElementById("formAgendamento").reset();
    listarAgendamentos();
}

async function listarAgendamentos() {
    const tabela = document.getElementById("listaAgendamentos");
    if (!tabela) return;

    const res = await fetch(`${API}/agendamentos`);
    const agendamentos = await res.json();

    tabela.innerHTML = "";

    agendamentos.forEach(a => {
        tabela.innerHTML += `
            <tr>
                <td>${a.id}</td>
                <td>${a.paciente}</td>
                <td>${a.psicologo}</td>
                <td>${a.data.slice(0,10)}</td>
                <td>${a.horario}</td>
                <td>${a.status}</td>
                <td>
                    <button class="btn btn-sm btn-warning" onclick="editarAgendamento(${a.id})">
                        Editar
                    </button>
                </td>
            </tr>
        `;
    });
}

async function editarAgendamento(id) {
    const res = await fetch(`${API}/agendamentos`);
    const agendamentos = await res.json();

    const ag = agendamentos.find(a => a.id === id);

    if (!ag) return;

    editandoAgendamentoId = id;

    document.getElementById("paciente_id").value = ag.paciente_id;
    document.getElementById("psicologo_id").value = ag.psicologo_id;
    document.getElementById("data").value = ag.data.slice(0,10);
    document.getElementById("horario").value = ag.horario;
    document.getElementById("status").value = ag.status;
}

async function carregarPacientes() {
    const res = await fetch(`${API}/pacientes`);
    const pacientes = await res.json();

    const select = document.getElementById("paciente_id");

    select.innerHTML = '<option value="">Selecione o paciente</option>';

    pacientes.forEach(paciente => {
        const option = document.createElement("option");

        option.value = paciente.id;
        option.textContent = paciente.nome;

        select.appendChild(option);
    });
}

async function carregarPsicologos() {
    const res = await fetch(`${API}/psicologos`);
    const psicologos = await res.json();

    const select = document.getElementById("psicologo_id");

    select.innerHTML = '<option value="">Selecione o psicólogo</option>';

    psicologos.forEach(psicologo => {
        const option = document.createElement("option");

        option.value = psicologo.id;
        option.textContent = psicologo.nome;

        select.appendChild(option);
    });
}

// ============================
// DASHBOARD
// ============================

async function carregarDashboard() {
    const el = document.getElementById("totalPacientes");
    if (!el) return;

    const res = await fetch(`${API}/dashboard`);
    const dados = await res.json();

    document.getElementById("totalPacientes").innerText = dados.total_pacientes;
    document.getElementById("totalAgendamentos").innerText = dados.total_agendamentos;
    document.getElementById("confirmados").innerText = dados.confirmados;
    document.getElementById("cancelados").innerText = dados.cancelados;

    document.getElementById("totalRecebido").innerText =
        `R$ ${Number(dados.total_recebido).toFixed(2)}`;

    document.getElementById("totalPendente").innerText =
        `R$ ${Number(dados.total_pendente).toFixed(2)}`;
}

async function carregarGraficoReceitas() {
    const canvas = document.getElementById("graficoReceitas");
    if (!canvas) return;

    const res = await fetch(`${API}/dashboard/receitas`);
    const dados = await res.json();

    const meses = dados.map(item => item.mes);
    const totais = dados.map(item => Number(item.total));

    if (window.graficoReceitasChart) {
        window.graficoReceitasChart.destroy();
    }

    window.graficoReceitasChart = new Chart(canvas, {
        type: "bar",
        data: {
            labels: meses,
            datasets: [{
                label: "Receita recebida",
                data: totais,
                backgroundColor: "rgba(155, 89, 255, 0.8)",
                borderColor: "#c084fc",
                borderWidth: 2,
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1200
            },
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}
function exportarDashboardPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    const totalPacientes = document.getElementById("totalPacientes")?.innerText || "0";
    const totalAgendamentos = document.getElementById("totalAgendamentos")?.innerText || "0";
    const confirmados = document.getElementById("confirmados")?.innerText || "0";
    const cancelados = document.getElementById("cancelados")?.innerText || "0";
    const totalRecebido = document.getElementById("totalRecebido")?.innerText || "R$ 0,00";
    const totalPendente = document.getElementById("totalPendente")?.innerText || "R$ 0,00";

    doc.setFontSize(18);
    doc.text("Relatório Geral - PsicoManager", 20, 20);

    doc.setFontSize(12);
    doc.text(`Total de pacientes: ${totalPacientes}`, 20, 40);
    doc.text(`Total de agendamentos: ${totalAgendamentos}`, 20, 50);
    doc.text(`Sessões confirmadas: ${confirmados}`, 20, 60);
    doc.text(`Sessões canceladas: ${cancelados}`, 20, 70);
    doc.text(`Total recebido: ${totalRecebido}`, 20, 80);
    doc.text(`Total pendente: ${totalPendente}`, 20, 90);

    doc.text("Relatório gerado automaticamente pelo sistema.", 20, 115);

    doc.save("relatorio-psicomanager.pdf");
}

// ============================
// PRONTUÁRIO
// ============================

async function carregarPacientesSelect() {
    const select = document.getElementById("paciente_id");
    if (!select) return;

    const res = await fetch(`${API}/pacientes`);
    const pacientes = await res.json();

    select.innerHTML = `<option value="">Selecione o paciente</option>`;

    pacientes.forEach(p => {
        select.innerHTML += `<option value="${p.id}">${p.nome}</option>`;
    });
}

async function carregarAgendamentosSelect(pacienteId = null) {
    const select = document.getElementById("agendamento_id");
    if (!select) return;

    select.innerHTML = `<option value="">Selecione o agendamento</option>`;

    if (!pacienteId) return;

    const res = await fetch(`${API}/agendamentos/paciente/${pacienteId}`);
    const agendamentos = await res.json();

    if (agendamentos.length === 0) {
        select.innerHTML += `<option value="">Nenhum agendamento encontrado</option>`;
        return;
    }

    agendamentos.forEach(a => {
        select.innerHTML += `
            <option value="${a.id}">
                ${a.data ? a.data.slice(0, 10) : ""} às ${a.horario || ""} - ${a.status}
            </option>
        `;
    });
}

async function cadastrarProntuario(event) {
    event.preventDefault();

    const dados = {
        paciente_id: document.getElementById("paciente_id").value,
        agendamento_id: document.getElementById("agendamento_id").value || null,
        anotacoes: document.getElementById("anotacoes").value,
        status_preenchimento: document.getElementById("status_preenchimento").value
    };

    console.log("Dados enviados:", dados);

    const res = await fetch(`${API}/prontuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (!res.ok) {
        alert("Erro ao salvar prontuário");
        return;
    }

   alert("Registro salvo!");

const pacienteSelecionado = dados.paciente_id;

document.getElementById("formProntuario").reset();

document.getElementById("paciente_id").value = pacienteSelecionado;

buscarProntuarios();
}

async function buscarProntuarios() {
    const paciente_id = document.getElementById("paciente_id").value;
    const lista = document.getElementById("listaProntuarios");

    if (!paciente_id) {
        alert("Selecione um paciente primeiro.");
        return;
    }

    const res = await fetch(`${API}/prontuarios/${paciente_id}`);
    const dados = await res.json();

    lista.innerHTML = "";

    if (dados.length === 0) {
        lista.innerHTML = `
            <li class="list-group-item">
                Nenhum registro encontrado para este paciente.
            </li>
        `;
        return;
    }

    dados.forEach(p => {
    lista.innerHTML += `
        <li class="list-group-item">
            <strong>Data:</strong> ${p.data_registro ? p.data_registro.slice(0,10) : ""}<br>

            <strong>Status:</strong> ${p.status_preenchimento || "Pendente"}<br>

            <strong>Anotações:</strong><br>
            ${p.anotacoes}
        </li>
    `;
    });
}

// ============================
// 💰 FINANCEIRO
// ============================

async function cadastrarFinanceiro(event) {
    event.preventDefault();

    const dados = {
        paciente_id: document.getElementById("paciente_id").value,
        valor: document.getElementById("valor").value,
        forma_pagamento: document.getElementById("forma_pagamento").value,
        status: document.getElementById("status").value
    };

    const res = await fetch(`${API}/financeiro`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (!res.ok) {
        const erro = await res.json();
        alert("Erro ao registrar: " + erro.erro);
        return;
    }

    alert("Pagamento registrado!");
    document.getElementById("formFinanceiro").reset();
    listarFinanceiro();
}

async function listarFinanceiro() {
    const tabela = document.getElementById("listaFinanceiro");
    if (!tabela) return;

    const res = await fetch(`${API}/financeiro`);
    const dados = await res.json();

    tabela.innerHTML = "";

    dados.forEach(f => {
        tabela.innerHTML += `
            <tr>
                <td>${f.paciente}</td>
                <td>R$ ${f.valor}</td>
                <td>${f.forma_pagamento}</td>
                <td>${f.status}</td>
                <td>${f.data_pagamento.slice(0,10)}</td>
            </tr>
        `;
    });
}

// ativar
const formFinanceiro = document.getElementById("formFinanceiro");
if (formFinanceiro) {
    formFinanceiro.addEventListener("submit", cadastrarFinanceiro);
}

async function carregarAgenda() {
    const el = document.getElementById("calendario");
    if (!el) return;

    const res = await fetch(`${API}/agendamentos`);
    const dados = await res.json();

    const eventos = dados.map(a => ({
        title: `${a.paciente} (${a.status})`,
        start: `${a.data.slice(0,10)}T${a.horario}`,
        color:
            a.status === "Confirmada" ? "green" :
            a.status === "Cancelada" ? "red" :
            "orange"
    }));

    const calendar = new FullCalendar.Calendar(el, {
        initialView: "dayGridMonth",
        locale: "pt-br",
        events: eventos
    });

    calendar.render();
}

// ============================
// INICIALIZAÇÃO
// ============================

// ============================
// TAREFAS
// ============================

async function cadastrarTarefa(event) {
    event.preventDefault();

    const dados = {
        paciente_id: document.getElementById("paciente_id").value || null,
        titulo: document.getElementById("titulo").value,
        descricao: document.getElementById("descricao").value,
        status: document.getElementById("status").value
    };

    const res = await fetch(`${API}/tarefas`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
    });

    if (!res.ok) {
        const erro = await res.json();
        alert("Erro ao cadastrar tarefa: " + erro.erro);
        return;
    }

    alert("Tarefa cadastrada!");
    document.getElementById("formTarefa").reset();

    carregarPacientesSelect();
    listarTarefas();
}

async function listarTarefas() {
    const tabela = document.getElementById("listaTarefas");
    if (!tabela) return;

    const res = await fetch(`${API}/tarefas`);
    const tarefas = await res.json();

    tabela.innerHTML = "";

    tarefas.forEach(t => {
        tabela.innerHTML += `
            <tr>
                <td>${t.id}</td>
                <td>${t.paciente || "Sem paciente"}</td>
                <td>${t.titulo}</td>
                <td>${t.descricao || ""}</td>
                <td>${t.status}</td>
                <td>${t.data_criacao ? t.data_criacao.slice(0, 10) : ""}</td>
                <td>
                    <button class="btn btn-sm btn-success" onclick="concluirTarefa(${t.id})">
                        Concluir
                    </button>

                    <button class="btn btn-sm btn-danger" onclick="deletarTarefa(${t.id})">
                        Excluir
                    </button>
                </td>
            </tr>
        `;
    });
}

async function concluirTarefa(id) {
    await fetch(`${API}/tarefas/${id}/concluir`, {
        method: "PUT"
    });

    listarTarefas();
}

async function deletarTarefa(id) {
    await fetch(`${API}/tarefas/${id}`, {
        method: "DELETE"
    });

    listarTarefas();
}

async function verificarLembretes() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    // só admin e psicólogo recebem lembrete
    if (usuario.tipo !== "admin" && usuario.tipo !== "psicologo") {
        return;
    }

    const res = await fetch(`${API}/agendamentos`);
    const agendamentos = await res.json();

    const hoje = new Date();
    const amanha = new Date();
    amanha.setDate(hoje.getDate() + 1);

    const dataAmanha = amanha.toISOString().slice(0, 10);

    const lembretes = agendamentos.filter(a => {
        const dataSessao = a.data ? a.data.slice(0, 10) : "";
        return dataSessao === dataAmanha && a.status === "Confirmada";
    });

    if (lembretes.length > 0) {
        let mensagem = "Sessões confirmadas para amanhã:\n\n";

        lembretes.forEach(l => {
            mensagem += `Paciente: ${l.paciente}\nHorário: ${l.horario}\n\n`;
        });

        alert(mensagem);
    }
}

function filtrarTelaInicial() {
    const usuario = JSON.parse(localStorage.getItem("usuario"));

    if (!usuario) return;

    const tipo = usuario.tipo;

    // esconder tudo primeiro
    const todosCards = document.querySelectorAll(
        ".card-admin, .card-psicologo, .card-paciente"
    );

    todosCards.forEach(card => {
        card.style.display = "none";
    });

    // mostrar só o tipo do usuário
    const cardsPermitidos = document.querySelectorAll(`.card-${tipo}`);

    cardsPermitidos.forEach(card => {
        card.style.display = "block";
    });
}

document.addEventListener("DOMContentLoaded", () => {
    verificarLogin();
    protegerPorTipo();
    mostrarUsuario();
    verificarPermissoes();
    filtrarTelaInicial();

    listarPacientes();
    listarAgendamentos();
    carregarDashboard();
    carregarGraficoReceitas();

    
    verificarLembretes();

    carregarPacientesSelect();
    carregarAgendamentosSelect();
    configurarPacienteProntuario();
    carregarPsicologos();

    listarFinanceiro();
    carregarAgenda();
    listarTarefas();

    const formTarefa = document.getElementById("formTarefa");
    if (formTarefa) {
        formTarefa.addEventListener("submit", cadastrarTarefa);
    }

    const formPaciente = document.getElementById("formPaciente");
    if (formPaciente) {
        formPaciente.addEventListener("submit", cadastrarPaciente);
    }

    const formAgendamento = document.getElementById("formAgendamento");
    if (formAgendamento) {
        formAgendamento.addEventListener("submit", cadastrarAgendamento);
    }

    const formLogin = document.getElementById("formLogin");
    if (formLogin) {
        formLogin.addEventListener("submit", login);
    }

    const formProntuario = document.getElementById("formProntuario");
    if (formProntuario) {
        formProntuario.addEventListener("submit", cadastrarProntuario);
    }

    const formFinanceiro = document.getElementById("formFinanceiro");

    if (formFinanceiro) {
        formFinanceiro.addEventListener("submit", cadastrarFinanceiro);
    }
});