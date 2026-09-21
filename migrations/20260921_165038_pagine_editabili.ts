import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * I due global nascono con dentro i testi che prima stavano scritti nel codice
 * delle pagine, cosi' dopo il rilascio non si trovano vuoti. Da qui in avanti
 * si cambiano dal pannello.
 *
 * Instagram, email e link delle donazioni restano vuoti apposta: nel codice
 * erano href="#", segnaposto, e non c'era niente di vero da travasare.
 */
function paragrafi(testi: string[]) {
  return {
    root: {
      type: 'root',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      children: testi.map((testo) => ({
        type: 'paragraph',
        format: '' as const,
        indent: 0,
        version: 1,
        direction: 'ltr' as const,
        textFormat: 0,
        children: [
          {
            type: 'text',
            detail: 0,
            format: 0,
            mode: 'normal',
            style: '',
            text: testo,
            version: 1,
          },
        ],
      })),
    },
  }
}

const testiChiSono = [
  "Scrivo di videogiochi da quando ho capito che la parte più interessante non è giocarli, ma capire come sono stati costruiti. Ho iniziato smontando virtualmente i giochi che mi piacevano di più, cercando di capire perché certe scelte funzionassero e altre no, e non ho più smesso.",
  "Livello Zero nasce da questa curiosità: non recensioni intese come voti da dare, ma racconti su come un gioco arriva a essere quello che è. Le idee iniziali che vengono abbandonate, i vincoli tecnici che diventano scelte artistiche, le decisioni prese sotto scadenza che finiscono per definire un'intera opera.",
  "Non ho un background nell'industria dei videogiochi: vengo da anni di lettura di documentari di sviluppo, interviste, postmortem alle conferenze di settore e, quando possibile, conversazioni dirette con chi quei giochi li ha fatti. Cerco di essere onesto su cosa so per certo e cosa invece è ricostruzione plausibile.",
  "Il sito è un progetto indipendente, aggiornato nel tempo libero. Se vuoi propormi una collaborazione, segnalarmi una storia di sviluppo che meriterebbe di essere raccontata, o semplicemente dirmi che ho sbagliato qualcosa, scrivimi.",
]

const testiProgetto = [
  "Livello Zero è nato come uno spazio per raccontare i videogiochi da un angolo che, mi sembrava, veniva raccontato poco: non il voto, non l'hype della vigilia, ma il processo che porta un'idea a diventare un gioco giocabile, con tutti i compromessi che questo comporta.",
  "Il nome viene proprio da qui: il livello zero è quello che non gioca nessuno, la fase grezza fatta di prototipi, riquadri segnaposto e meccaniche non ancora rifinite. È il momento più interessante da studiare, perché è quello in cui si vedono le decisioni prese, prima che tutto venga levigato per il pubblico.",
  "Il sito è un progetto indipendente, senza redazione, senza pubblicità invasiva e senza obblighi editoriali verso publisher o sviluppatori. Ogni articolo nasce da una curiosità personale, e resta pubblicato così com'è, senza revisioni retroattive per restare in linea con l'attualità.",
  "Se questo modo di raccontare i videogiochi ti è utile o ti piace, il modo più semplice per sostenerlo è leggerlo, condividerlo, o lasciare un contributo qui sotto.",
]

const testoDonazioni =
  "Livello Zero non ha sponsor né pubblicità a schermo intero. Un caffè ogni tanto aiuta a tenere le luci accese e a scrivere con più calma."

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TABLE "chi_sono" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar DEFAULT 'Chi sono' NOT NULL,
  	"foto_id" integer,
  	"testo" jsonb,
  	"instagram" varchar,
  	"email" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  CREATE TABLE "progetto" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"titolo" varchar DEFAULT 'Il progetto' NOT NULL,
  	"testo" jsonb,
  	"donazioni_testo" varchar,
  	"donazioni_link" varchar,
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "chi_sono" ADD CONSTRAINT "chi_sono_foto_id_media_id_fk" FOREIGN KEY ("foto_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "chi_sono_foto_idx" ON "chi_sono" USING btree ("foto_id");`)

  await payload.updateGlobal({
    slug: 'chi-sono',
    data: {
      titolo: 'Chi sono',
      testo: paragrafi(testiChiSono),
    },
    depth: 0,
    req,
  })

  await payload.updateGlobal({
    slug: 'progetto',
    data: {
      titolo: 'Il progetto',
      testo: paragrafi(testiProgetto),
      donazioniTesto: testoDonazioni,
    },
    depth: 0,
    req,
  })
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "chi_sono" CASCADE;
  DROP TABLE "progetto" CASCADE;`)
}
