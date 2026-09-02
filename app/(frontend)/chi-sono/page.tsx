import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chi sono — Livello Zero",
  description:
    "Chi scrive Livello Zero e perché racconta come nascono i videogiochi.",
};

export default function ChiSono() {
  return (
    <section className="guscio pagina-chi-sono">
      <div className="blocco chi-sono-foto" data-eti="foto" />
      <div>
        <h1>Chi sono</h1>
        <p>
          Scrivo di videogiochi da quando ho capito che la parte più
          interessante non è giocarli, ma capire come sono stati costruiti.
          Ho iniziato smontando virtualmente i giochi che mi piacevano di
          più, cercando di capire perché certe scelte funzionassero e altre
          no, e non ho più smesso.
        </p>
        <p>
          Livello Zero nasce da questa curiosità: non recensioni intese come
          voti da dare, ma racconti su come un gioco arriva a essere quello
          che è. Le idee iniziali che vengono abbandonate, i vincoli tecnici
          che diventano scelte artistiche, le decisioni prese sotto scadenza
          che finiscono per definire un&apos;intera opera.
        </p>
        <p>
          Non ho un background nell&apos;industria dei videogiochi: vengo da anni
          di lettura di documentari di sviluppo, interviste, postmortem alle
          conferenze di settore e, quando possibile, conversazioni dirette
          con chi quei giochi li ha fatti. Cerco di essere onesto su cosa so
          per certo e cosa invece è ricostruzione plausibile.
        </p>
        <p>
          Il sito è un progetto indipendente, aggiornato nel tempo libero.
          Se vuoi propormi una collaborazione, segnalarmi una storia di
          sviluppo che meriterebbe di essere raccontata, o semplicemente
          dirmi che ho sbagliato qualcosa, scrivimi.
        </p>
        <div className="chi-sono-contatti">
          <a href="#">Instagram</a>
          <a href="#">Email</a>
          <a href="#">Proponi una collaborazione</a>
        </div>
      </div>
    </section>
  );
}
