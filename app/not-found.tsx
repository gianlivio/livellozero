import Link from "next/link";

export default function NotFound() {
  return (
    <section className="guscio pagina-404">
      <div className="blocco pagina-404-immagine" data-eti="404" />
      <h1>Questa pagina non esiste</h1>
      <p>
        Forse è stata spostata, forse non è mai esistita: in ogni caso, qui
        non c&apos;è niente da leggere.
      </p>
      <Link href="/">Torna alla home</Link>
    </section>
  );
}
