import { datiSearchConsole } from "@/lib/searchconsole";
import stile from "./RiquadroSearchConsole.module.css";

/**
 * In cima alla dashboard del pannello: come va il sito su Google. Componente
 * server, i dati arrivano gia' in cache da lib/searchconsole.ts.
 */

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

export default async function RiquadroSearchConsole() {
  const dati = await datiSearchConsole();

  return (
    <section className={stile.riquadro}>
      <h2 className={stile.titolo}>Il sito su Google</h2>

      {!dati ? (
        <p className={stile.vuoto}>Dati non disponibili</p>
      ) : (
        <>
          <p className={stile.nota}>
            Dati degli ultimi 28 giorni, aggiornati da Google con 2-3 giorni di
            ritardo
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
