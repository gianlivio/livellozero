/** Lente: cerchio e manico, nello stesso tratto delle icone di condivisione. */
function IconaLente() {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="7.1" cy="7.1" r="4.3" />
      <path d="m10.3 10.3 2.9 2.9" />
    </svg>
  );
}

/**
 * La ricerca: un form normale, che va a /cerca da solo. Campo e lente stanno
 * dentro lo stesso form, quindi l'invio parte sia dal tasto invio sia dal
 * pulsante, senza una riga di JavaScript e senza stato da tenere in piedi.
 * Per questo il file non e' un client component: non c'e' niente da idratare.
 */
export default function CampoRicerca({
  variante = "testata",
}: {
  variante?: "testata" | "pagina";
}) {
  return (
    <form
      className="ricerca"
      data-variante={variante}
      action="/cerca"
      method="get"
      role="search"
    >
      <input
        type="search"
        name="q"
        placeholder="Cerca un articolo"
        aria-label="Cerca fra gli articoli"
      />
      <button type="submit" className="ricerca-lente" aria-label="Cerca">
        <IconaLente />
      </button>
    </form>
  );
}
