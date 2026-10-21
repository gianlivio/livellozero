import { LINGUA_PREDEFINITA, percorsi, type Lingua } from "@/lib/lingue";
import { testi } from "@/lib/testi";

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
  lingua = LINGUA_PREDEFINITA,
}: {
  variante?: "testata" | "pagina";
  lingua?: Lingua;
}) {
  const t = testi(lingua);
  return (
    <form
      className="ricerca"
      data-variante={variante}
      action={percorsi(lingua).cerca}
      method="get"
      role="search"
    >
      <input
        type="search"
        name="q"
        placeholder={t.cercaSegnaposto}
        aria-label={t.cercaEtichetta}
      />
      <button type="submit" className="ricerca-lente" aria-label={t.cerca}>
        <IconaLente />
      </button>
    </form>
  );
}
