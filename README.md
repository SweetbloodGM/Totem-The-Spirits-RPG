# Totem - The Spirits' RPG
## Sistema per Foundry Virtual Tabletop

Un sistema narrativo basato sul lancio della moneta e sui traumi, ispirato alle regole della Quickstart di Totem.

---

## 📋 Caratteristiche

- **Sistema di risoluzione semplice**: Lancia la moneta (Testa = Successo, Croce = Fallimento)
- **Gestione traumi**: I personaggi accumulano traumi invece di statistiche tradizionali
- **Schede personaggio intuitive**: Interfaccia pulita con tabs per traumi, oggetti e abilità
- **Bilingue**: Supporto completo per Italiano e Inglese
- **Foundry VTT v13**: Compatibile con l'ultima versione di Foundry

---

## 🚀 Installazione

### Installazione Manuale

1. Scarica o clona questa repository
2. Copia la cartella `totem-foundry` nella directory dei sistemi di Foundry:
   - **Windows**: `%localappdata%/FoundryVTT/Data/systems/`
   - **macOS**: `~/Library/Application Support/FoundryVTT/Data/systems/`
   - **Linux**: `~/.local/share/FoundryVTT/Data/systems/`
3. Rinomina la cartella in `totem` (se necessario)
4. Riavvia Foundry VTT
5. Crea un nuovo mondo e seleziona **Totem - The Spirits' RPG** come sistema di gioco

### Installazione tramite Manifest (futuro)

Quando il sistema sarà pubblicato, potrai installarlo direttamente da Foundry usando questo manifest URL:
```
[URL del manifest - da aggiungere]
```

---

## 🎮 Utilizzo

### Creare un Personaggio

1. Vai alla scheda **Actors** e clicca su "Create Actor"
2. Seleziona il tipo **Character**
3. Compila nome, immagine e biografia
4. Imposta i punti salute (Health)

### Gestire i Traumi

1. Nella scheda **Traumas**, clicca sul pulsante "+" per creare un nuovo trauma
2. Inserisci nome, descrizione, gravità e origine
3. Usa l'icona del cerchio per attivare/disattivare il trauma
4. I traumi attivi vengono conteggiati automaticamente

### Lanciare la Moneta

1. Nella scheda personaggio, clicca sul pulsante **"Lancia la Moneta"**
2. Il risultato (Testa/Croce) verrà mostrato in chat
3. Il numero di traumi attivi viene indicato automaticamente

### Aggiungere Oggetti e Abilità

- Vai alle schede **Items** o **Abilities**
- Clicca sul pulsante "+" per creare nuovi elementi
- Clicca sull'icona di modifica per aprire la scheda completa

---

## 📁 Struttura del Progetto

```
totem-foundry/
├── lang/                      # File di localizzazione
│   ├── en.json               # Inglese
│   └── it.json               # Italiano
├── module/                    # Logica JavaScript
│   ├── documents/
│   │   ├── actor.js          # Classe Actor personalizzata
│   │   └── item.js           # Classe Item personalizzata
│   ├── sheets/
│   │   ├── actor-sheet.js    # Sheet per gli Actor
│   │   └── item-sheet.js     # Sheet per gli Item
│   └── dice.js               # Meccanica lancio moneta
├── styles/                    # CSS
│   └── totem.css             # Stili del sistema
├── templates/                 # Template Handlebars
│   ├── actor/
│   │   ├── actor-character-sheet.hbs
│   │   ├── actor-npc-sheet.hbs
│   │   └── parts/
│   ├── item/
│   │   ├── item-trauma-sheet.hbs
│   │   ├── item-item-sheet.hbs
│   │   ├── item-ability-sheet.hbs
│   │   └── parts/
│   └── chat/
│       ├── coin-flip.hbs     # Template risultato lancio
│       └── item-card.hbs     # Template carta oggetto
├── system.json               # Manifest del sistema
├── template.json             # Schema dati
├── totem.js                  # Entry point principale
└── README.md                 # Questo file
```

---

## 🔧 Personalizzazione

### Modificare la Meccanica del Lancio

Il file `module/dice.js` contiene due funzioni per il lancio della moneta:

- `rollCoinFlip()`: Usa Math.random() per simulare il lancio
- `rollCoinFlipDice()`: Usa il sistema Roll di Foundry (1d2)

Puoi modificare la funzione chiamata in `module/documents/actor.js` per cambiare il comportamento.

### Aggiungere Nuovi Tipi di Item

1. Aggiungi il tipo in `system.json` sotto `documentTypes.Item`
2. Crea lo schema dati in `template.json`
3. Crea il template HTML in `templates/item/`
4. Aggiungi le stringhe di localizzazione in `lang/en.json` e `lang/it.json`

---

## 🐛 Troubleshooting

### Il sistema non appare in Foundry

- Verifica che la cartella si chiami esattamente `totem`
- Controlla che `system.json` sia nella root della cartella
- Riavvia completamente Foundry VTT

### Errori nella console

- Apri la console del browser (F12) e cerca errori
- Verifica che tutti i file `.js` siano presenti e correttamente formattati
- Controlla che i path nei template siano corretti

### Le localizzazioni non funzionano

- Verifica che i file `en.json` e `it.json` siano nella cartella `lang/`
- Controlla la sintassi JSON (usa un validatore online)
- Cambia la lingua in Foundry da Settings > Configure Settings > Language

---

## 📝 TODO / Sviluppi Futuri

- [ ] Aggiungere compendi con traumi ed abilità pre-compilati
- [ ] Implementare automazioni per i traumi (es. penalità automatiche)
- [ ] Creare macro per lanci rapidi
- [ ] Aggiungere supporto per Active Effects
- [ ] Integrare sistema di token bar per i traumi
- [ ] Creare tutorial video
- [ ] Pubblicare su Foundry Package Browser

---

## 📜 Licenza

Questo sistema è rilasciato come software open source. Puoi modificarlo e ridistribuirlo liberamente.

Il GDR **Totem** e le sue regole sono proprietà dei rispettivi autori.

---

## 👥 Crediti

- **Sistema Foundry VTT**: Sviluppato per la quickstart di Totem
- **Foundry VTT**: [https://foundryvtt.com/](https://foundryvtt.com/)
- **Totem - The Spirits' RPG**: [Link al GDR originale]

---

## 📧 Supporto

Per bug, suggerimenti o domande, apri un issue sulla repository GitHub o contatta [il tuo contatto].

---

**Buon gioco con Totem! 🎲✨**
