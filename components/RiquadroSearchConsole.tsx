import {
  datiSearchConsole,
  limitiPersonalizzato,
  PERIODI,
  risolviPeriodo,
  type Intervallo,
  type Periodo,
} from "@/lib/searchconsole";
import stile from "./RiquadroSearchConsole.module.css";

/**
 * In cima alla dashboard del pannello: come va il sito su Google. Componente
 * server, i dati arrivano gia' in cache da lib/searchconsole.ts.
 *
 * Il periodo sta nell'indirizzo del pannello (?gsc_periodo=, e per il
 * Personalizzato gsc_dal e gsc_al): il selettore e' un modulo normale che
 * ricarica la dashboard, senza JavaScript. Il prefisso gsc_ tiene questi
 * parametri lontani da quelli di Payload.
 */

/** Come si chiama il periodo dentro la riga "Dati ..., aggiornati da Google". */
const DESCRIZIONE: Record<Periodo, string> = {
  "24o": "delle ultime 24 ore",
  "7g": "degli ultimi 7 giorni",
  "28g": "degli ultimi 28 giorni",
  "3m": "degli ultimi 3 mesi",
  "6m": "degli ultimi 6 mesi",
  "12m": "degli ultimi 12 mesi",
  "16m": "degli ultimi 16 mesi",
  personalizzato: "del periodo scelto",
};

const giornoMese = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});
const giornoMeseAnno = new Intl.DateTimeFormat("it-IT", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});
const anno = new Intl.DateTimeFormat("it-IT", { year: "numeric", timeZone: "UTC" });

/** "dal 26 settembre al 21 ottobre 2026"; l'anno due volte solo se cambia. */
function intervalloLeggibile(intervallo: Intervallo): string {
  if (intervallo.tipo === "giorni") {
    const dal = new Date(`${intervallo.dal}T00:00:00Z`);
    const al = new Date(`${intervallo.al}T00:00:00Z`);
    if (intervallo.dal === intervallo.al) return `il ${giornoMeseAnno.format(al)}`;
    const primo =
      anno.format(dal) === anno.format(al)
        ? giornoMese.format(dal)
        : giornoMeseAnno.format(dal);
    return `dal ${primo} al ${giornoMeseAnno.format(al)}`;
  }
  // Le ore in ora italiana: Google le da' in ora del Pacifico.
  const fuso = { timeZone: "Europe/Rome" } as const;
  const ora = new Intl.DateTimeFormat("it-IT", { ...fuso, hour: "2-digit", minute: "2-digit" });
  const gm = new Intl.DateTimeFormat("it-IT", { ...fuso, day: "numeric", month: "long" });
  const gma = new Intl.DateTimeFormat("it-IT", { ...fuso, day: "numeric", month: "long", year: "numeric" });
  const a = new Intl.DateTimeFormat("it-IT", { ...fuso, year: "numeric" });
  const inizio = new Date(intervallo.inizio);
  const fine = new Date(intervallo.fine);
  const primo = a.format(inizio) === a.format(fine) ? gm.format(inizio) : gma.format(inizio);
  return `dal ${primo}, ore ${ora.format(inizio)}, al ${gma.format(fine)}, ore ${ora.format(fine)} (ora italiana)`;
}

function primo(valore: string | string[] | undefined): string | undefined {
  return Array.isArray(valore) ? valore[0] : valore;
}

/** Il selettore: si sceglie la voce, per Personalizzato le due date, e Mostra. */
function Selettore({
  periodo,
  dal,
  al,
}: {
  periodo: Periodo;
  dal?: string;
  al?: string;
}) {
  const { minimo, massimo } = limitiPersonalizzato();
  return (
    <form method="get" className={stile.selettore}>
      <label className={stile.campo}>
        <span>Periodo</span>
        <select name="gsc_periodo" defaultValue={periodo}>
          {PERIODI.map((p) => (
            <option key={p.valore} value={p.valore}>
              {p.nome}
            </option>
          ))}
        </select>
      </label>
      {/* Le date contano solo per Personalizzato: il CSS le mostra solo
          quando e' scelto, il server le ignora per le altre voci. */}
      <div className={stile.date}>
        <label className={stile.campo}>
          <span>Dal</span>
          <input type="date" name="gsc_dal" defaultValue={dal} min={minimo} max={massimo} />
        </label>
        <label className={stile.campo}>
          <span>Al</span>
          <input type="date" name="gsc_al" defaultValue={al} min={minimo} max={massimo} />
        </label>
      </div>
      <button type="submit" className="btn btn--style-secondary btn--size-small">
        Mostra
      </button>
    </form>
  );
}

const intero = new Intl.NumberFormat("it-IT");
const decimale = new Intl.NumberFormat("it-IT", {
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const percentuale = new Intl.NumberFormat("it-IT", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

function Numero({
  nome,
  valore,
  spiegazione,
}: {
  nome: string;
  valore: string;
  spiegazione: string;
}) {
  return (
    <div className={stile.numero}>
      <span className={stile.nome}>{nome}</span>
      <span className={stile.valore}>{valore}</span>
      <span className={stile.spiegazione}>{spiegazione}</span>
    </div>
  );
}

export default async function RiquadroSearchConsole({
  searchParams = {},
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const dal = primo(searchParams.gsc_dal);
  const al = primo(searchParams.gsc_al);
  const scelta = risolviPeriodo(primo(searchParams.gsc_periodo), dal, al);
  // Con date sbagliate l'API non si chiama: si dice cosa non va.
  const dati = "intervallo" in scelta ? await datiSearchConsole(scelta.intervallo) : null;

  return (
    <section className={stile.riquadro}>
      <h2 className={stile.titolo}>Il sito su Google</h2>
      <Selettore periodo={scelta.periodo} dal={dal} al={al} />

      {"errore" in scelta ? (
        <p className={stile.avviso}>{scelta.errore}</p>
      ) : !dati ? (
        <p className={stile.vuoto}>Dati non disponibili</p>
      ) : (
        <>
          <p className={stile.nota}>
            Dati {DESCRIZIONE[scelta.periodo]}, aggiornati da Google con{" "}
            {dati.provvisori ? "qualche ora" : "2-3 giorni"} di ritardo
          </p>

          <div className={stile.numeri}>
            <Numero
              nome="Click"
              valore={intero.format(dati.click)}
              spiegazione="Quante volte qualcuno ha cliccato sul sito da una ricerca su Google."
            />
            <Numero
              nome="Impressioni"
              valore={intero.format(dati.impressioni)}
              spiegazione="Quante volte il sito è comparso nei risultati di una ricerca."
            />
            <Numero
              nome="CTR"
              valore={percentuale.format(dati.ctr)}
              spiegazione="Su cento volte che il sito compare, quante viene cliccato."
            />
            <Numero
              nome="Posizione media"
              valore={dati.posizione ? decimale.format(dati.posizione) : "—"}
              spiegazione="A che altezza compare nei risultati: 1 è il primo, oltre 10 è già in seconda pagina."
            />
          </div>

          <p className={stile.intervallo}>
            Periodo mostrato: {intervalloLeggibile(dati.intervallo)}
          </p>
          {dati.provvisori && (
            <p className={stile.nota}>
              Dati provvisori: Google li sta ancora elaborando e possono
              cambiare nelle prossime ore.
            </p>
          )}

          <h3 className={stile.sottotitolo}>Le ricerche che lo mostrano di più</h3>
          {dati.ricerche.length === 0 ? (
            <p className={stile.vuoto}>Nessuna ricerca in questo periodo.</p>
          ) : (
            <table className={stile.tabella}>
              <thead>
                <tr>
                  <th>Ricerca</th>
                  <th>Impressioni</th>
                  <th>Click</th>
                  <th>Posizione</th>
                </tr>
              </thead>
              <tbody>
                {dati.ricerche.map((ricerca) => (
                  <tr key={ricerca.testo}>
                    <td>{ricerca.testo}</td>
                    <td>{intero.format(ricerca.impressioni)}</td>
                    <td>{intero.format(ricerca.click)}</td>
                    <td>{decimale.format(ricerca.posizione)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className={stile.nota}>
            Google non elenca le ricerche fatte da pochissime persone: per
            questo la tabella può sommare meno dei totali.
          </p>
        </>
      )}
    </section>
  );
}
