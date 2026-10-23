// Lógica pura (sin red) para leer y editar los textos de una creatividad de Meta Ads,
// incluido el mensaje de bienvenida de los anuncios que abren WhatsApp/Messenger/Instagram.
//
// Meta no permite editar una creatividad publicada: el editor clona la creatividad con estos cambios
// y re-apunta el anuncio (ver ads.ts). Estructura verificada con anuncios reales el 2026-10-22:
// el mensaje de bienvenida vive en object_story_spec.<video_data|link_data>.page_welcome_message,
// como un texto JSON ("VISUAL_EDITOR" v2).

export type MediaData = {
  message?: string;
  title?: string;
  name?: string;
  page_welcome_message?: string;
  image_hash?: string;
  image_url?: string;
  [key: string]: unknown;
};

export type ObjectStorySpec = {
  page_id?: string;
  instagram_user_id?: string;
  video_data?: MediaData;
  link_data?: MediaData;
  photo_data?: MediaData;
  [key: string]: unknown;
};

export type CreativeSpec = {
  id?: string;
  name?: string;
  object_story_spec?: ObjectStorySpec;
  asset_feed_spec?: Record<string, unknown>;
  degrees_of_freedom_spec?: { creative_features_spec?: Record<string, unknown>; [key: string]: unknown };
  url_tags?: string;
};

export type MediaKey = "video_data" | "link_data";

export interface EditableValues {
  /** Saludo que ve el cliente al abrir el chat. null = el anuncio no tiene mensaje de bienvenida personalizado. */
  welcomeText: string | null;
  /** Respuestas rápidas ("ice breakers"). */
  iceBreakers: string[];
  /** Texto principal del anuncio. */
  primaryText: string | null;
  /** Titular. */
  headline: string | null;
}

export interface Edits {
  welcomeText?: string;
  iceBreakers?: string[];
  primaryText?: string;
  headline?: string;
}

export type FieldChange = { antes: string | string[] | null; despues: string | string[] };
export type Changes = Partial<Record<keyof EditableValues, FieldChange>>;

export const MAX_ICE_BREAKERS = 4;

/** Formato de medios soportado por el editor. photo_data/otros no se editan en la Fase 1. */
export function getMediaKey(spec: CreativeSpec): MediaKey | null {
  const oss = spec.object_story_spec;
  if (!oss) return null;
  if (oss.video_data) return "video_data";
  if (oss.link_data) return "link_data";
  return null;
}

/** Los anuncios de varios destinos (WhatsApp+Messenger+Instagram) traen un asset_feed_spec que hay que conservar. */
export function isMultiDestination(spec: CreativeSpec): boolean {
  return Boolean(spec.asset_feed_spec);
}

type WelcomeJson = {
  text_format?: { customer_action_type?: string; message?: { text?: string; ice_breakers?: { title?: string }[] } };
  image_format?: { message?: { text?: string } };
  video_format?: { message?: { text?: string } };
  [key: string]: unknown;
};

function parseWelcome(raw: string | undefined): WelcomeJson | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as WelcomeJson) : null;
  } catch {
    return null;
  }
}

function headlineOf(media: MediaData, key: MediaKey): string | null {
  const v = key === "video_data" ? media.title : media.name;
  return typeof v === "string" ? v : null;
}

export function readValues(spec: CreativeSpec): EditableValues {
  const key = getMediaKey(spec);
  const media = key ? spec.object_story_spec?.[key] : undefined;
  if (!key || !media) return { welcomeText: null, iceBreakers: [], primaryText: null, headline: null };
  const pw = parseWelcome(media.page_welcome_message);
  const msg = pw?.text_format?.message;
  return {
    welcomeText: typeof msg?.text === "string" ? msg.text : null,
    iceBreakers: (msg?.ice_breakers ?? []).map((b) => b.title ?? "").filter(Boolean),
    primaryText: typeof media.message === "string" ? media.message : null,
    headline: headlineOf(media, key),
  };
}

/** Motivo por el que el anuncio no se puede editar con el editor, o null si se puede. */
export function notEditableReason(spec: CreativeSpec): string | null {
  if (!spec.object_story_spec) return "El anuncio usa una publicación existente (no tiene creatividad propia editable).";
  if (!getMediaKey(spec)) return "Formato de creatividad no soportado todavía (solo video e imagen/enlace).";
  return null;
}

/** Valida las ediciones y devuelve un mensaje de error, o null si están bien. */
export function validateEdits(current: EditableValues, edits: Edits): string | null {
  const touchesWelcome = edits.welcomeText !== undefined || edits.iceBreakers !== undefined;
  if (touchesWelcome && current.welcomeText === null) {
    return "Este anuncio no tiene un mensaje de bienvenida personalizado: el editor solo modifica los existentes.";
  }
  if (edits.welcomeText !== undefined && edits.welcomeText.trim() === "") return "El saludo no puede quedar vacío.";
  if (edits.iceBreakers !== undefined) {
    const list = edits.iceBreakers.map((t) => t.trim()).filter(Boolean);
    if (list.length > MAX_ICE_BREAKERS) return `Máximo ${MAX_ICE_BREAKERS} respuestas rápidas.`;
  }
  if (edits.primaryText !== undefined && current.primaryText === null) return "Este anuncio no tiene texto principal editable.";
  if (edits.headline !== undefined && current.headline === null) return "Este anuncio no tiene titular editable.";
  return null;
}

/** Calcula qué campos cambian realmente (ignora los que quedan iguales). */
export function diffEdits(current: EditableValues, edits: Edits): Changes {
  const changes: Changes = {};
  if (edits.welcomeText !== undefined && edits.welcomeText !== current.welcomeText) {
    changes.welcomeText = { antes: current.welcomeText, despues: edits.welcomeText };
  }
  if (edits.iceBreakers !== undefined) {
    const next = edits.iceBreakers.map((t) => t.trim()).filter(Boolean);
    if (JSON.stringify(next) !== JSON.stringify(current.iceBreakers)) {
      changes.iceBreakers = { antes: current.iceBreakers, despues: next };
    }
  }
  if (edits.primaryText !== undefined && edits.primaryText !== current.primaryText) {
    changes.primaryText = { antes: current.primaryText, despues: edits.primaryText };
  }
  if (edits.headline !== undefined && edits.headline !== current.headline) {
    changes.headline = { antes: current.headline, despues: edits.headline };
  }
  return changes;
}

/**
 * Devuelve una copia del object_story_spec con los cambios aplicados.
 * No modifica el original. Lanza Error si las ediciones no son válidas.
 */
export function buildEditedObjectStorySpec(spec: CreativeSpec, edits: Edits): ObjectStorySpec {
  const reason = notEditableReason(spec);
  if (reason) throw new Error(reason);
  const current = readValues(spec);
  const invalid = validateEdits(current, edits);
  if (invalid) throw new Error(invalid);

  const oss: ObjectStorySpec = JSON.parse(JSON.stringify(spec.object_story_spec));
  const key = getMediaKey(spec) as MediaKey;
  const media = oss[key] as MediaData;

  if (edits.primaryText !== undefined) media.message = edits.primaryText;
  if (edits.headline !== undefined) {
    if (key === "video_data") media.title = edits.headline;
    else media.name = edits.headline;
  }

  if (edits.welcomeText !== undefined || edits.iceBreakers !== undefined) {
    const pw = parseWelcome(media.page_welcome_message) as WelcomeJson;
    pw.text_format = pw.text_format ?? {};
    pw.text_format.message = pw.text_format.message ?? {};
    if (edits.welcomeText !== undefined) {
      pw.text_format.message.text = edits.welcomeText;
      // Meta guarda el mismo saludo en los formatos imagen y video: se mantienen sincronizados.
      for (const fmt of ["image_format", "video_format"] as const) {
        const m = pw[fmt]?.message;
        if (m) m.text = edits.welcomeText;
      }
      pw.welcome_message_edited = true;
    }
    if (edits.iceBreakers !== undefined) {
      pw.text_format.message.ice_breakers = edits.iceBreakers
        .map((t) => t.trim())
        .filter(Boolean)
        .map((title) => ({ title }));
      pw.ice_breakers_edited = true;
    }
    media.page_welcome_message = JSON.stringify(pw);
  }

  // image_url es una URL temporal de Meta; si hay image_hash alcanza (y es el campo canónico).
  if (media.image_hash) delete media.image_url;
  return oss;
}

/** Meta rechaza 'standard_enhancements' al crear una creatividad (obsoleto): se quita del spec copiado. */
export function cleanDegreesOfFreedom(
  dof: CreativeSpec["degrees_of_freedom_spec"],
): CreativeSpec["degrees_of_freedom_spec"] | undefined {
  if (!dof) return undefined;
  const copy = JSON.parse(JSON.stringify(dof)) as NonNullable<CreativeSpec["degrees_of_freedom_spec"]>;
  if (copy.creative_features_spec) delete copy.creative_features_spec["standard_enhancements"];
  return copy;
}

/** Nombre de la creatividad nueva: conserva el original y agrega una marca de edición (sin acumular sufijos). */
export function editedCreativeName(original: string | undefined, isoDate: string): string {
  const base = (original ?? "Creatividad")
    .replace(/\s*\[(editado|PRUEBA)[^\]]*\]\s*$/i, "")
    .slice(0, 90);
  return `${base} [editado ${isoDate}]`;
}
