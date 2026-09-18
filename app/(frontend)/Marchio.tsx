/**
 * Il marchio: lo zero, il fulmine, il joypad. Riprende il disegno dell'autore,
 * con il joypad rimpicciolito rispetto all'originale — a grandezza piena
 * copriva lo zero da parte a parte e i tre segni si impastavano in una macchia
 * sola. Il colore arriva da color: var(--accento) sul contenitore, i vuoti da
 * var(--fondo): il marchio segue il tema senza saperne niente.
 */

/* Corpo e impugnature vanno disegnati tre volte per avere un contorno solo:
   l'alone di fondo che stacca il joypad dallo zero, il pieno col tratto grosso
   che fa il contorno dell'unione, il ritaglio interno. Un solo passaggio
   lascerebbe i tratti delle impugnature a incrociarsi dentro il corpo. */
const FormeJoypad = () => (
  <>
    <rect x="13" y="28" width="38" height="15" rx="7.5" />
    <circle cx="17" cy="39" r="8" />
    <circle cx="47" cy="39" r="8" />
  </>
);

export default function Marchio() {
  return (
    <svg
      className="marchio-segno"
      viewBox="0 0 64 64"
      width="30"
      height="30"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <ellipse
        cx="32"
        cy="32"
        rx="15"
        ry="21"
        transform="rotate(-12 32 32)"
        stroke="currentColor"
        strokeWidth="7"
      />
      <path
        d="M38 17.5 L24 30 L30.5 30 L26.5 37.5 L39.5 25.5 L33 25.5 Z"
        fill="currentColor"
      />
      <g transform="translate(32 47.5) scale(0.58) translate(-32 -37.5)">
        <g
          fill="var(--fondo)"
          stroke="var(--fondo)"
          strokeWidth="11"
          strokeLinejoin="round"
        >
          <FormeJoypad />
        </g>
        <g
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        >
          <FormeJoypad />
        </g>
        <g fill="var(--fondo)">
          <FormeJoypad />
        </g>
        <rect x="17.5" y="32.6" width="10" height="3.4" rx="1.7" fill="currentColor" />
        <rect x="20.8" y="29.3" width="3.4" height="10" rx="1.7" fill="currentColor" />
        <circle cx="44" cy="30.9" r="2.3" fill="currentColor" />
        <circle cx="44" cy="38.1" r="2.3" fill="currentColor" />
        <circle cx="40.4" cy="34.5" r="2.3" fill="currentColor" />
        <circle cx="47.6" cy="34.5" r="2.3" fill="currentColor" />
      </g>
    </svg>
  );
}
