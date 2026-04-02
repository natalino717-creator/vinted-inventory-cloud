// Schemi di validazione Zod per i bonus
import { z } from "zod";

// Stati possibili per un bonus
export const STATI_BONUS = [
  "in_corso",
  "completato",
  "scaduto",
  "annullato",
] as const;

export type StatoBonus = (typeof STATI_BONUS)[number];

// Labels leggibili per gli stati
export const STATO_LABELS: Record<StatoBonus, string> = {
  in_corso: "In Corso",
  completato: "Completato",
  scaduto: "Scaduto",
  annullato: "Annullato",
};

// Tipi di varianza
export const TIPI_VARIANZA = [
  "Nessuna",
  "Media",
  "Elevata",
] as const;

export type TipoVarianza = (typeof TIPI_VARIANZA)[number];

// Tipi di bonus comuni
export const TIPI_BONUS = [
  "Benvenuto",
  "Real bonus",
  "Ricarica Real bonus",
  "Cashback",
  "Free Bet",
  "SuperQuota",
  "Profilazione",
  "Altro",
] as const;

// Siti più comuni predefiniti
export const SITI_COMUNI = [
  "Bet365",
  "Snai",
  "Sisal",
  "Goldbet",
  "Lottomatica",
  "Betflag",
  "StarVegas",
  "888sport",
  "Unibet",
  "William Hill",
  "Eurobet",
  "NetBet",
  "Quigioco",
  "Planetwin365",
  "Altro",
] as const;

// Schema per creazione bonus
export const bonusCreateSchema = z
  .object({
    sito: z.string().min(1, "Il sito è obbligatorio").max(100),
    tipo: z.string().min(1, "Il tipo è obbligatorio").max(50),
    importoBonus: z
      .number({ invalid_type_error: "Inserisci un importo valido" })
      .min(0, "L'importo deve essere positivo"),
    importoDeposito: z
      .number({ invalid_type_error: "Inserisci un importo valido" })
      .min(0, "L'importo deve essere positivo")
      .nullable()
      .optional(),
    profilo: z.string().optional(),
    requisitiRollover: z.string().min(1, "I requisiti rollover sono obbligatori"),
    dataInizio: z.string().min(1, "La data di inizio è obbligatoria"),
    dataScadenza: z.string().min(1, "La data di scadenza è obbligatoria"),
    stato: z.enum(STATI_BONUS).default("in_corso"),
    varianza: z.enum(TIPI_VARIANZA).default("Nessuna"),
    costoProfilazione: z.number({ invalid_type_error: "Inserisci un importo valido" }).optional().default(0),
    profittoNetto: z.number({ invalid_type_error: "Inserisci un importo valido" }).nullable().optional(),
    note: z.string().nullable().optional(),
  })
  .refine(
    (data) => {
      const inizio = new Date(data.dataInizio);
      const scadenza = new Date(data.dataScadenza);
      return scadenza >= inizio;
    },
    {
      message: "La data di scadenza deve essere successiva alla data di inizio",
      path: ["dataScadenza"],
    }
  );

// Schema per aggiornamento bonus (tutti i campi opzionali tranne quelli richiesti)
export const bonusUpdateSchema = bonusCreateSchema;

// Type inferito dallo schema
export type BonusCreateInput = z.infer<typeof bonusCreateSchema>;
export type BonusUpdateInput = z.infer<typeof bonusUpdateSchema>;

// === VINTED VALIDATORS ===

export const STATI_VINTED = [
  "da_fotografare",
  "in_vendita",
  "venduto",
  "spedito",
  "completato",
] as const;

export type StatoVinted = (typeof STATI_VINTED)[number];

export const STATO_VINTED_LABELS: Record<StatoVinted, string> = {
  da_fotografare: "Da fare foto",
  in_vendita: "In Vendita",
  venduto: "Venduto",
  spedito: "Spedito",
  completato: "Completato",
};

export const vintedCreateSchema = z.object({
  titolo: z.string().min(1, "Il titolo è obbligatorio").max(100),
  marca: z.string().max(50).nullable().optional(),
  taglia: z.string().max(10).nullable().optional(),
  costoAcquisto: z.number({ invalid_type_error: "Inserisci un costo valido" }).min(0, "Il costo non può essere negativo"),
  prezzoVendita: z.number({ invalid_type_error: "Inserisci un prezzo valido" }).min(0, "Il prezzo non può essere negativo").nullable().optional(),
  speseSpedizione: z.number({ invalid_type_error: "Inserisci spese valide" }).min(0, "Le spese non possono essere negative").nullable().optional().default(0),
  commissioni: z.number({ invalid_type_error: "Inserisci commissioni valide" }).min(0, "Le commissioni non possono essere negative").nullable().optional().default(0),
  ricavoEffettivo: z.number({ invalid_type_error: "Inserisci un ricavo valido" }).min(0, "Il ricavo non può essere negativo").nullable().optional(),
  stato: z.enum(STATI_VINTED),
  dataInserimento: z.string().min(1, "La data di inserimento è obbligatoria"),
  dataVendita: z.string().nullable().optional(),
  note: z.string().nullable().optional(),
  profilo: z.string().optional(),
});

export const vintedUpdateSchema = vintedCreateSchema;

export type VintedCreateInput = z.infer<typeof vintedCreateSchema>;
export type VintedUpdateInput = z.infer<typeof vintedUpdateSchema>;
