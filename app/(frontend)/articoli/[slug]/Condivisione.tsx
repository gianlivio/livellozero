import CopiaLink from "./CopiaLink";
import { IconaTelegram, IconaWhatsApp, IconaX } from "./icone";

type Props = {
  url: string;
  titolo: string;
};

/** La riga di chiusura dell'articolo, a tutte le larghezze: la colonna a
 *  destra adesso tiene le altre letture, non i pulsanti. */
export default function Condivisione({ url, titolo }: Props) {
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
    <aside className="condivisione" aria-label="Condividi l'articolo">
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
    </aside>
  );
}
