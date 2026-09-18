/**
 * Iconcine disegnate a mano per la colonna di condivisione: tracciati semplici
 * a 16px, colore ereditato dal testo. Nessun pacchetto di icone.
 */

type Props = React.SVGProps<SVGSVGElement>;

function Contorno({ children, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 16 16"
      width="16"
      height="16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

/** Fumetto con dentro la cornetta. */
export function IconaWhatsApp(props: Props) {
  return (
    <Contorno {...props}>
      <path d="M8 2.1a5.9 5.9 0 0 0-5 9l-.9 2.8 2.9-.9A5.9 5.9 0 1 0 8 2.1Z" />
      <path d="M6.2 6c0 2.1 1.7 3.8 3.8 3.8l.5-1.1-1.4-.6-.6.7a3.4 3.4 0 0 1-1.3-1.3l.7-.6-.6-1.4L6.2 6Z" />
    </Contorno>
  );
}

/** Aeroplanino di carta. */
export function IconaTelegram(props: Props) {
  return (
    <Contorno {...props}>
      <path d="M14.3 2.3 1.8 7.3l3.6 1.3 1 3.8 2-2.3 3.3 2.3 2.6-10.1Z" />
      <path d="M5.4 8.6 14.3 2.3 8.5 10.1" />
    </Contorno>
  );
}

/** La croce di X. */
export function IconaX(props: Props) {
  return (
    <Contorno {...props} strokeWidth="1.6">
      <path d="m3.2 3.2 9.6 9.6M12.8 3.2l-9.6 9.6" />
    </Contorno>
  );
}

/** Due anelli di catena. */
export function IconaLink(props: Props) {
  return (
    <Contorno {...props}>
      <path d="M6.9 9.1a2.6 2.6 0 0 0 3.7 0l1.9-1.9a2.6 2.6 0 0 0-3.7-3.7l-.9.9" />
      <path d="M9.1 6.9a2.6 2.6 0 0 0-3.7 0L3.5 8.8a2.6 2.6 0 0 0 3.7 3.7l.9-.9" />
    </Contorno>
  );
}

/** Spunta: conferma della copia. */
export function IconaFatto(props: Props) {
  return (
    <Contorno {...props} strokeWidth="1.7">
      <path d="m3 8.4 3.2 3.2L13 4.6" />
    </Contorno>
  );
}
