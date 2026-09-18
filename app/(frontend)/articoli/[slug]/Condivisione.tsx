import CopiaLink from "./CopiaLink";
import { IconaTelegram, IconaWhatsApp, IconaX } from "./icone";

type Props = {
  url: string;
  titolo: string;
  /** "lato" e' la colonna appiccicata a destra, "fondo" la riga di chiusura. */
  variante: "lato" | "fondo";
};

export default function Condivisione({ url, titolo, variante }: Props) {
  const destinazioni = [
    {
      nome: "WhatsApp",
      // WhatsApp accetta un solo campo di testo: titolo e url vanno insieme.
      href: `https://wa.me/?text=${encodeURIComponent(`${titolo} ${url}`)}`,
      icona: <IconaWhatsApp />,
    },
    {
      nome: "Telegram",
      href: `https://t.me/share/url?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(titolo)}`,
      icona: <IconaTelegram />,
    },
    {
      nome: "X",
      href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(
        url
      )}&text=${encodeURIComponent(titolo)}`,
      icona: <IconaX />,
    },
  ];

  return (
    <aside
      className={`condivisione condivisione-${variante}`}
      aria-label="Condividi l'articolo"
    >
      <div className="condivisione-interna">
        <p className="condivisione-etichetta">Condividi</p>
        <div className="condivisione-pulsanti">
          {destinazioni.map((destinazione) => (
            <a
              key={destinazione.nome}
              className="condivisione-voce"
              href={destinazione.href}
              rel="noreferrer"
              target="_blank"
            >
              {destinazione.icona}
              <span>{destinazione.nome}</span>
            </a>
          ))}
          <CopiaLink url={url} />
        </div>
      </div>
    </aside>
  );
}
