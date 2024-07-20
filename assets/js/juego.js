const blackjack = (() => {
    'use strict';

    let deck = [];
    const tipos = ['C', 'D', 'H', 'S'];
    const especiales = ['A', 'J', 'Q', 'K'];
    let puntos = [0, 0, 0, 0]; // puntos[0] para jugador 1, puntos[1] para jugador 2, puntos[2] para jugador 3, puntos[3] para computadora
    let numJugadores = 1;
    let contraCPU = false;
    let turnoActual = 0; // Indica el turno del jugador actual
    let jugadoresDetenidos = []; // Array para controlar qué jugadores han detenido
    let jugadoresListos = []; // Array para controlar qué jugadores ya han detenido y no pueden jugar más

    // Referencias HTML
    const btnPedir = document.querySelector('#btnPedir');
    const btnDetener = document.querySelector('#btnDetener');
    const btnNuevo = document.querySelector('#btnNuevo');
    const btnIniciarJuego = document.querySelector('#btnIniciarJuego');
    const divCartasJugadores = document.querySelectorAll('.cartas-jugador');
    const puntosHTML = document.querySelectorAll('.puntos-jugador');

    const crearDeck = () => {
        deck = [];
        for (let i = 2; i <= 10; i++) {
            for (let tipo of tipos) {
                deck.push(i + tipo);
            }
        }
        for (let tipo of tipos) {
            for (let esp of especiales) {
                deck.push(esp + tipo);
            }
        }
        deck = _.shuffle(deck); // Siendo _.shuffle parte de la librería Underscore.js
    }

    function iniciaJuego() {
        crearDeck();
        puntos = [0, 0, 0, 0]; // Reinicia los puntos de todos los jugadores
        puntosHTML.forEach(punto => punto.innerText = 0);
        divCartasJugadores.forEach(div => div.innerHTML = ''); // Limpia las cartas de todos los jugadores
        btnPedir.disabled = false;
        btnDetener.disabled = false;
        turnoActual = 0; // Comienza con el jugador 1
        jugadoresDetenidos = []; // Reinicia los jugadores que han detenido
        jugadoresListos = []; // Reinicia los jugadores que no pueden jugar más

        // Eliminar manejadores de eventos anteriores
        btnPedir.removeEventListener('click', pedirCartaHandler);
        btnDetener.removeEventListener('click', detenerHandler);

        // Añadir nuevos manejadores de eventos
        btnPedir.addEventListener('click', pedirCartaHandler);
        btnDetener.addEventListener('click', detenerHandler);

        // Mostrar contenedores de jugadores según el número seleccionado
        for (let i = 1; i <= numJugadores; i++) {
            document.querySelector(`#jugador${i}-container`).classList.remove('d-none');
        }

        // Mostrar contenedor de la computadora si se está jugando contra la CPU
        if (contraCPU) {
            document.querySelector('#computadora-container').classList.remove('d-none');
        }

        // Inicia el juego para el primer jugador
        turnoJugador(turnoActual);
    }

    function pedirCartaHandler() {
        const carta = pedirCarta();
        acumularPuntos(carta, turnoActual);
        crearCarta(carta, turnoActual);
        if (puntos[turnoActual] > 21) {
            terminaTurno(turnoActual);
        } else if (puntos[turnoActual] === 21) {
            terminaTurno(turnoActual);
        }
    }

    function detenerHandler() {
        jugadoresDetenidos.push(turnoActual); // Marca al jugador como detenido
        jugadoresListos.push(turnoActual); // Marca al jugador como listo para no permitirle jugar más
        btnPedir.disabled = true;
        btnDetener.disabled = true;
        // Si todos los jugadores han detenido, turno de la computadora (si está activa)
        if (jugadoresDetenidos.length === numJugadores) {
            if (contraCPU) {
                turnoComputadora();
            } else {
                determinaGanador();
            }
        } else {
            // Pasa al siguiente jugador que no ha detenido ni está listo
            let siguienteTurno = turnoActual + 1;
            while (jugadoresListos.includes(siguienteTurno) && siguienteTurno < numJugadores) {
                siguienteTurno++;
            }
            if (siguienteTurno < numJugadores && !jugadoresDetenidos.includes(siguienteTurno)) {
                turnoActual = siguienteTurno;
                turnoJugador(turnoActual);
            } else {
                // Si no quedan jugadores por jugar, termina el turno actual
                terminaTurno(turnoActual);
            }
        }
    }

    function pedirCarta() {
        if (deck.length === 0) {
            throw 'No hay más cartas';
        }
        return deck.pop();
    }

    function acumularPuntos(carta, jugador) {
        puntos[jugador] += valorCarta(carta);
        puntosHTML[jugador].innerText = puntos[jugador];
        return puntos[jugador];
    }

    function valorCarta(carta) {
        const valor = carta.substring(0, carta.length - 1);
        return (isNaN(valor)) ?
            (valor === 'A') ? 11 : 10 :
            valor * 1;
    }

    function turnoComputadora() {
        let puntosMaxJugadores = Math.max(...puntos.slice(0, numJugadores).filter(p => p <= 21));

        if (puntosMaxJugadores < 0) {
            puntosMaxJugadores = 0;
        }

        do {
            const carta = pedirCarta();
            puntos[3] = acumularPuntos(carta, 3);
            crearCarta(carta, 3);

            if (puntosMaxJugadores > 21) {
                break;
            }

        } while ((puntos[3] <= puntosMaxJugadores) && (puntosMaxJugadores <= 21) && (puntos[3] <= 21));

        determinaGanador();
    }

    function crearCarta(carta, jugador) {
        const imgCarta = document.createElement('img');
        imgCarta.src = `assets/cartas/${carta}.png`;
        imgCarta.classList.add('carta');
        divCartasJugadores[jugador].appendChild(imgCarta);
    }

    function turnoJugador(turno) {
        // Habilita botones de pedir y detener para el jugador actual
        btnPedir.disabled = false;
        btnDetener.disabled = false;
    }

    // Función para finalizar el turno de un jugador
    function terminaTurno(turno) {
        btnPedir.disabled = true;
        btnDetener.disabled = true;
        turnoActual++;
        // Si todos los jugadores han jugado o detenido, turno de la computadora (si está activa)
        if (turnoActual < numJugadores && !jugadoresDetenidos.includes(turnoActual)) {
            turnoJugador(turnoActual);
        } else {
            if (contraCPU) {
                turnoComputadora();
            } else {
                determinaGanador();
            }
        }
    }

    btnNuevo.addEventListener('click', iniciaJuego);

    btnIniciarJuego.addEventListener('click', () => {
        const numJugadoresSelect = document.querySelector('#numJugadores');
        const contraCPUCheckbox = document.querySelector('#contraCPU');

        numJugadores = parseInt(numJugadoresSelect.value);
        contraCPU = contraCPUCheckbox.checked;

        if (numJugadores === 1) {
            contraCPU = true;
        }

        document.querySelector('#menuInicial').classList.add('d-none');
        document.querySelector('#interfazJuego').classList.remove('d-none');

        iniciaJuego();
    });

    function determinaGanador() {
        setTimeout(() => {
            let maxPuntos = -1;
            let ganadores = [];
            for (let i = 0; i < puntos.length; i++) {
                if (puntos[i] <= 21 && puntos[i] > maxPuntos) {
                    maxPuntos = puntos[i];
                    ganadores = [i];
                } else if (puntos[i] <= 21 && puntos[i] === maxPuntos) {
                    ganadores.push(i);
                }
            }
            if (ganadores.length === 1) {
                alert(`¡Jugador ${ganadores[0] + 1} gana!`);
            } else if (ganadores.length > 1) {
                alert(`¡Empate entre jugadores ${ganadores.map(g => g + 1).join(' y ')}!`);
            } else {
                alert('No hay ganador, todos perdieron.');
            }
        }, 10);
    }

    return {
        iniciaJuego,
        pedirCarta,
        turnoComputadora,
        crearCarta,
        acumularPuntos
    };

})();

blackjack.iniciaJuego();
