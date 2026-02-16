class JogoDaVelha {
    constructor() {
        this.celulas = document.querySelectorAll(".celula");
        this.tabuleiro = document.querySelector(".tabuleiro");
        this.btnReset = document.querySelector(".btn-reset");
        this.btnModos = document.querySelectorAll(".btn-modo");
        this.btnDificuldades = document.querySelectorAll(".btn-dif");
        this.dificuldadeDiv = document.getElementById("dificuldadeDiv");
        this.jogadorAtualSpan = document.getElementById("jogadorAtual");
        this.statusJogoSpan = document.getElementById("statusJogo");

        this.jogador = "X";
        this.jogoAtivo = true;
        this.estado = ["", "", "", "", "", "", "", "", ""];
        this.modo = "pvp"; // pvp ou bot
        this.dificuldade = "facil";
        this.isBot = false;
        this.botJogando = false;

        this.vitorias = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6]
        ];

        this.inicializar();
    }

    inicializar() {
        this.celulas.forEach((celula, index) => {
            celula.addEventListener("click", () => this.aoClicarCelula(index));
        });

        this.btnReset.addEventListener("click", () => this.resetarJogo());

        this.btnModos.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.btnModos.forEach(b => b.classList.remove("ativo"));
                e.target.classList.add("ativo");
                this.modo = e.target.dataset.modo;
                this.isBot = this.modo === "bot";
                this.dificuldadeDiv.style.display = this.isBot ? "block" : "none";
                this.resetarJogo();
            });
        });

        this.btnDificuldades.forEach(btn => {
            btn.addEventListener("click", (e) => {
                this.btnDificuldades.forEach(b => b.classList.remove("ativo"));
                e.target.classList.add("ativo");
                this.dificuldade = e.target.dataset.dif;
                this.resetarJogo();
            });
        });
    }

    aoClicarCelula(index) {
        if (this.estado[index] !== "" || !this.jogoAtivo || this.botJogando) return;

        this.fazerJogada(index);
    }

    fazerJogada(index) {
        this.estado[index] = this.jogador;
        const celula = this.celulas[index];
        celula.textContent = this.jogador;
        celula.classList.add("preenchida", "jogada", this.jogador.toLowerCase());
        this.tocarSom("clique");

        if (this.verificarVitoria()) {
            setTimeout(() => {
                this.statusJogoSpan.textContent = `🎉 Jogador ${this.jogador} venceu! 🎉`;
                this.tocarSom("vitoria");
            }, 100);
            this.jogoAtivo = false;
            return;
        }

        if (!this.estado.includes("")) {
            setTimeout(() => {
                this.statusJogoSpan.textContent = "🤝 Empate! 🤝";
                this.tocarSom("empate");
            }, 100);
            this.jogoAtivo = false;
            return;
        }

        this.jogador = this.jogador === "X" ? "O" : "X";
        this.atualizarInterface();

        if (this.isBot && this.jogador === "O" && this.jogoAtivo) {
            this.botJogando = true;
            setTimeout(() => this.fazerJogadaBot(), 500);
        }
    }

    fazerJogadaBot() {
        let index;

        if (this.dificuldade === "facil") {
            index = this.movimentoAleatorio();
        } else if (this.dificuldade === "normal") {
            if (Math.random() > 0.5) {
                index = this.movimentoMinimax();
            } else {
                index = this.movimentoAleatorio();
            }
        } else {
            index = this.movimentoMinimax();
        }

        this.botJogando = false;
        if (index !== -1) {
            this.fazerJogada(index);
        }
    }

    movimentoAleatorio() {
        const possoesLivres = this.estado
            .map((celula, index) => (celula === "" ? index : null))
            .filter(index => index !== null);
        return possoesLivres[Math.floor(Math.random() * possoesLivres.length)];
    }

    movimentoMinimax() {
        let melhorScore = -Infinity;
        let melhorMove = -1;

        for (let i = 0; i < 9; i++) {
            if (this.estado[i] === "") {
                this.estado[i] = "O";
                let score = this.minimax(this.estado, 0, false);
                this.estado[i] = "";

                if (score > melhorScore) {
                    melhorScore = score;
                    melhorMove = i;
                }
            }
        }

        return melhorMove;
    }

    minimax(estado, profundidade, isBot) {
        if (this.verificarVitoriaComEstado(estado, "O")) return 10 - profundidade;
        if (this.verificarVitoriaComEstado(estado, "X")) return profundidade - 10;
        if (!estado.includes("")) return 0;

        if (isBot) {
            let melhorScore = -Infinity;
            for (let i = 0; i < 9; i++) {
                if (estado[i] === "") {
                    estado[i] = "O";
                    let score = this.minimax(estado, profundidade + 1, false);
                    estado[i] = "";
                    melhorScore = Math.max(score, melhorScore);
                }
            }
            return melhorScore;
        } else {
            let melhorScore = Infinity;
            for (let i = 0; i < 9; i++) {
                if (estado[i] === "") {
                    estado[i] = "X";
                    let score = this.minimax(estado, profundidade + 1, true);
                    estado[i] = "";
                    melhorScore = Math.min(score, melhorScore);
                }
            }
            return melhorScore;
        }
    }

    verificarVitoria() {
        return this.verificarVitoriaComEstado(this.estado, this.jogador);
    }

    verificarVitoriaComEstado(estado, jogador) {
        return this.vitorias.some(combo => {
            const [a, b, c] = combo;
            return estado[a] === jogador && estado[b] === jogador && estado[c] === jogador;
        });
    }

    atualizarInterface() {
        this.jogadorAtualSpan.textContent = this.jogador;
    }

    resetarJogo() {
        this.jogador = "X";
        this.jogoAtivo = true;
        this.estado = ["", "", "", "", "", "", "", "", ""];
        this.botJogando = false;
        this.statusJogoSpan.textContent = "";

        this.celulas.forEach(celula => {
            celula.textContent = "";
            celula.classList.remove("preenchida", "jogada", "x", "o");
        });

        this.atualizarInterface();

        if (this.isBot && this.jogador === "O") {
            this.botJogando = true;
            setTimeout(() => this.fazerJogadaBot(), 500);
        }
    }

    tocarSom(tipo) {
        const contextoAudio = new (window.AudioContext || window.webkitAudioContext)();

        switch (tipo) {
            case "clique":
                this.tocarBip(contextoAudio, 400, 0.1);
                break;
            case "vitoria":
                this.tocarMelodia(contextoAudio, [523, 659, 784], 0.2);
                break;
            case "empate":
                this.tocarMelodia(contextoAudio, [440, 440, 440], 0.2);
                break;
        }
    }

    tocarBip(contexto, frequencia, duracao) {
        const oscilador = contexto.createOscillator();
        const ganho = contexto.createGain();

        oscilador.connect(ganho);
        ganho.connect(contexto.destination);

        oscilador.frequency.value = frequencia;
        oscilador.type = "sine";

        ganho.gain.setValueAtTime(0.3, contexto.currentTime);
        ganho.gain.exponentialRampToValueAtTime(0.01, contexto.currentTime + duracao);

        oscilador.start(contexto.currentTime);
        oscilador.stop(contexto.currentTime + duracao);
    }

    tocarMelodia(contexto, frequencias, duracao) {
        frequencias.forEach((freq, index) => {
            setTimeout(() => {
                this.tocarBip(contexto, freq, duracao);
            }, index * duracao * 1000);
        });
    }
}

// Iniciar o jogo quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
    new JogoDaVelha();
});