import type { CollectionSlug, PayloadRequest } from "payload";
import { draftMode } from "next/headers";
import { redirect } from "next/navigation";
import { getPayload } from "payload";
import config from "@/payload.config";

export async function GET(richiesta: Request): Promise<Response> {
  const payload = await getPayload({ config: await config });

  const { searchParams } = new URL(richiesta.url);
  const path = searchParams.get("path");
  const collection = searchParams.get("collection") as CollectionSlug | null;
  const slug = searchParams.get("slug");
  const previewSecret = searchParams.get("previewSecret");

  if (!process.env.PREVIEW_SECRET || previewSecret !== process.env.PREVIEW_SECRET) {
    return new Response("Non sei autorizzato a vedere questa anteprima.", {
      status: 403,
    });
  }

  if (!path || !collection || !slug) {
    return new Response("Parametri mancanti.", { status: 404 });
  }

  if (!path.startsWith("/")) {
    return new Response("Questo indirizzo accetta solo percorsi relativi.", {
      status: 500,
    });
  }

  let utente;

  try {
    utente = await payload.auth({
      req: richiesta as unknown as PayloadRequest,
      headers: richiesta.headers,
    });
  } catch (errore) {
    payload.logger.error(
      { err: errore },
      "Errore nella verifica del token per l'anteprima"
    );
    return new Response("Non sei autorizzato a vedere questa anteprima.", {
      status: 403,
    });
  }

  const bozza = await draftMode();

  if (!utente?.user) {
    bozza.disable();
    return new Response("Non sei autorizzato a vedere questa anteprima.", {
      status: 403,
    });
  }

  bozza.enable();

  redirect(path);
}
