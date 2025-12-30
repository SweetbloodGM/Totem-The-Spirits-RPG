# Changelog

Tutte le modifiche importanti al progetto Totem - The Spirits' RPG saranno documentate in questo file.

## [1.0.0] - 2025-12-05

### Aggiunto
- **Sistema base completo per Foundry VTT v13**
  - Supporto per Actor tipo `character` e `npc`
  - Supporto per Item tipo `trauma`, `item`, e `ability`
  
- **Meccanica del lancio della moneta**
  - Implementazione con Math.random() e Roll API di Foundry
  - Messaggio in chat con risultato visivo (Testa/Croce)
  - Tracking automatico dei traumi attivi
  
- **Schede Personaggio**
  - Tab per Biography, Traumas, Items, Abilities
  - Gestione Health (Salute)
  - Contatore automatico traumi attivi
  - Bottone "Lancia la Moneta" integrato
  
- **Sistema Traumi**
  - Creazione, modifica, eliminazione traumi
  - Toggle attivo/inattivo con icona
  - Campi: Nome, Descrizione, Gravità, Origine
  
- **Localizzazione completa**
  - Italiano (it.json)
  - Inglese (en.json)
  
- **Stili CSS personalizzati**
  - Design moderno con gradient e animazioni
  - Responsive e ottimizzato per Foundry
  - Chat cards personalizzate per coin flip
  
- **Template Handlebars**
  - Actor sheets per character e npc
  - Item sheets per trauma, item, ability
  - Template partials riutilizzabili
  - Chat templates per coin flip e item cards
  
- **Documentazione**
  - README.md completo con istruzioni
  - TESTING.md per guide di test
  - Commenti inline nel codice

### Note Tecniche
- JavaScript puro (nessuna build necessaria)
- Architettura modulare con documenti e sheets separati
- Compatibilità verificata con Foundry VTT v13
- Template.json con schema dati completo

---

## [Unreleased] - Funzionalità Future

### Da Implementare
- [ ] Compendi pre-compilati (traumi, abilità, oggetti esempio)
- [ ] Sistema di macro per lanci rapidi
- [ ] Active Effects per automazioni traumi
- [ ] Token bar integration per visualizzare traumi
- [ ] Importer per schede da PDF/JSON
- [ ] Sistema di journal con template per sessioni
- [ ] Dice So Nice! integration per animazioni moneta
- [ ] Migrazione a TypeScript (opzionale)
- [ ] Sistema di progressione/avanzamento personaggio
- [ ] Gestione party e relazioni tra PG

### Miglioramenti Previsti
- [ ] Più opzioni di personalizzazione CSS (temi)
- [ ] Supporto per immagini token custom
- [ ] Suoni personalizzati per coin flip
- [ ] Tooltip con spiegazioni meccaniche
- [ ] Esportazione/importazione personaggi
- [ ] Sistema di backup automatico

---

## Formato

Questo changelog segue il formato [Keep a Changelog](https://keepachangelog.com/it/1.0.0/),
e questo progetto aderisce al [Semantic Versioning](https://semver.org/lang/it/).

### Tipi di modifiche
- **Aggiunto** per nuove funzionalità
- **Modificato** per modifiche a funzionalità esistenti
- **Deprecato** per funzionalità che saranno rimosse
- **Rimosso** per funzionalità rimosse
- **Corretto** per bug fix
- **Sicurezza** per vulnerabilità
