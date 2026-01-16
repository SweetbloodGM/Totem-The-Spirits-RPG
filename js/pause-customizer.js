Hooks.on("ready", () => {
    // Configura un osservatore per rilevare quando compare la schermata di pausa
    const observer = new MutationObserver((mutations) => {
        const pauseScreen = document.getElementById("pause");
        if (pauseScreen) {
            const img = pauseScreen.querySelector("img");
            if (img && !img.classList.contains('customized')) {
                img.src = "systems/totem/assets/pause.webp";
                img.classList.add('customized'); // Marca come modificato
                
                // Opzionale: imposta la didascalia con un testo localizzato
                const caption = pauseScreen.querySelector("figcaption");
                if (caption) caption.textContent = game.i18n.localize("GAME.Paused");
            }
        }
    });

    // Osserva i cambiamenti nel body
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
});
