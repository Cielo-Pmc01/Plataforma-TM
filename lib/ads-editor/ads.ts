// Operaciones sobre anuncios de Meta (SOLO SERVIDOR): listar, leer detalle, previsualizar, aplicar y deshacer.
//
// Cómo se "edita" un anuncio: Meta no deja modificar una creatividad publicada, así que se
//   1) lee la creatividad actual,
//   2) crea una creatividad NUEVA copiándola con los cambios,
//   3) re-apunta el MISMO anuncio a la nueva (conserva ID, reacciones y aprendizaje),
//   4) relee y verifica.
// La creatividad anterior no se borra: por eso "deshacer" es volver a apuntar el anuncio a ella.

import { graph } from "./graph";
import {
  buildEditedObjectStorySpec,
  cleanDegreesOfFreedom,
  diffEdits,
  editedCreativeName,
  isMultiDestination,
  notEditableReason,
  readValues,
  validateEdits,
  type Changes,
  type CreativeSpec,
  type Edits,
  type EditableValues,
} from "./welcome";

export interface AdSummary {
  id: string;
  name: string;
  status: string;
  effectiveStatus: string;
  campaignName: string | null;
  adsetName: string | null;
  destinationType: string | null;
  creativeId: string | null;
}

export interface AdDetail extends AdSummary {
  accountId: string;
  pageId: string | null;
  multiDestination: boolean;
  current: EditableValues;
  editable: boolean;
  notEditableReason: string | null;
}

type RawAd = {
  id: string;
  name?: string;
  status?: string;
  effective_status?: string;
  account_id?: string;
  campaign?: { name?: string };
  adset?: { name?: string; destination_type?: string };
  creative?: CreativeSpec;
};

const LIST_FIELDS = "id,name,status,effective_status,campaign{name},adset{name,destination_type},creative{id}";
const DETAIL_FIELDS =
  "id,name,status,effective_status,account_id,campaign{name},adset{name,destination_type}," +
  "creative{id,name,object_story_spec,asset_feed_spec,degrees_of_freedom_spec,url_tags}";
const VISIBLE_STATUSES = [
  "ACTIVE", "PAUSED", "CAMPAIGN_PAUSED", "ADSET_PAUSED", "IN_PROCESS", "PENDING_REVIEW", "WITH_ISSUES", "DISAPPROVED",
];
const MESSAGING_DESTINATIONS = ["WHATSAPP", "MESSENGER", "INSTAGRAM_DIRECT"];

function summarize(ad: RawAd): AdSummary {
  return {
    id: ad.id,
    name: ad.name ?? "(sin nombre)",
    status: ad.status ?? "",
    effectiveStatus: ad.effective_status ?? "",
    campaignName: ad.campaign?.name ?? null,
    adsetName: ad.adset?.name ?? null,
    destinationType: ad.adset?.destination_type ?? null,
    creativeId: ad.creative?.id ?? null,
  };
}

export async function listAds(
  token: string,
  accountId: string,
  opts: { after?: string; soloMensajes?: boolean } = {},
): Promise<{ ads: AdSummary[]; next: string | null }> {
  const res = await graph<{ data: RawAd[]; paging?: { cursors?: { after?: string }; next?: string } }>(
    token,
    "GET",
    `act_${accountId}/ads`,
    { fields: LIST_FIELDS, limit: "50", effective_status: JSON.stringify(VISIBLE_STATUSES), after: opts.after },
  );
  let ads = res.data.map(summarize);
  if (opts.soloMensajes) {
    ads = ads.filter((a) => MESSAGING_DESTINATIONS.some((d) => a.destinationType?.includes(d)));
  }
  return { ads, next: res.paging?.next ? (res.paging.cursors?.after ?? null) : null };
}

async function fetchAd(token: string, accountId: string, adId: string): Promise<RawAd> {
  const ad = await graph<RawAd>(token, "GET", adId, { fields: DETAIL_FIELDS });
  if (ad.account_id && ad.account_id !== accountId) {
    throw new Error("El anuncio no pertenece a la cuenta seleccionada.");
  }
  return ad;
}

export async function getAdDetail(token: string, accountId: string, adId: string): Promise<AdDetail> {
  const ad = await fetchAd(token, accountId, adId);
  const creative = ad.creative ?? {};
  const reason = notEditableReason(creative);
  return {
    ...summarize(ad),
    accountId,
    pageId: creative.object_story_spec?.page_id ?? null,
    multiDestination: isMultiDestination(creative),
    current: readValues(creative),
    editable: reason === null,
    notEditableReason: reason,
  };
}

export interface Preview {
  changes: Changes;
  hasChanges: boolean;
  error: string | null;
}

/** Calcula el "antes / después" sin tocar Meta (solo lee). */
export async function previewEdit(token: string, accountId: string, adId: string, edits: Edits): Promise<Preview> {
  const detail = await getAdDetail(token, accountId, adId);
  if (!detail.editable) return { changes: {}, hasChanges: false, error: detail.notEditableReason };
  const error = validateEdits(detail.current, edits);
  if (error) return { changes: {}, hasChanges: false, error };
  const changes = diffEdits(detail.current, edits);
  return { changes, hasChanges: Object.keys(changes).length > 0, error: null };
}

export interface ApplyResult {
  previousCreativeId: string;
  newCreativeId: string;
  changes: Changes;
  verified: boolean;
  effectiveStatus: string;
}

function sameValues(a: EditableValues, b: EditableValues, edits: Edits): boolean {
  if (edits.welcomeText !== undefined && a.welcomeText !== b.welcomeText) return false;
  if (edits.iceBreakers !== undefined && JSON.stringify(a.iceBreakers) !== JSON.stringify(b.iceBreakers)) return false;
  if (edits.primaryText !== undefined && a.primaryText !== b.primaryText) return false;
  if (edits.headline !== undefined && a.headline !== b.headline) return false;
  return true;
}

/**
 * Aplica los cambios al anuncio. `expectedCreativeId` es la creatividad que el usuario vio en pantalla:
 * si el anuncio cambió mientras tanto, se frena (evita pisar cambios hechos en otro lado).
 */
export async function applyEdit(
  token: string,
  accountId: string,
  adId: string,
  edits: Edits,
  expectedCreativeId: string,
): Promise<ApplyResult> {
  const ad = await fetchAd(token, accountId, adId);
  const creative = ad.creative ?? {};
  if (!creative.id) throw new Error("No se pudo leer la creatividad actual del anuncio.");
  if (creative.id !== expectedCreativeId) {
    throw new Error("El anuncio cambió desde que lo abriste. Recargá y volvé a revisar los cambios.");
  }

  const current = readValues(creative);
  const changes = diffEdits(current, edits);
  if (Object.keys(changes).length === 0) throw new Error("No hay cambios para aplicar.");

  const objectStorySpec = buildEditedObjectStorySpec(creative, edits);
  const dof = cleanDegreesOfFreedom(creative.degrees_of_freedom_spec);
  const created = await graph<{ id: string }>(token, "POST", `act_${accountId}/adcreatives`, {
    name: editedCreativeName(creative.name, new Date().toISOString().slice(0, 10)),
    object_story_spec: JSON.stringify(objectStorySpec),
    degrees_of_freedom_spec: dof ? JSON.stringify(dof) : undefined,
    asset_feed_spec: creative.asset_feed_spec ? JSON.stringify(creative.asset_feed_spec) : undefined,
    url_tags: creative.url_tags || undefined,
  });

  await graph(token, "POST", adId, { creative: JSON.stringify({ creative_id: created.id }) });

  const after = await fetchAd(token, accountId, adId);
  const verified = after.creative?.id === created.id && sameValues(readValues(after.creative ?? {}), readValues({ ...creative, object_story_spec: objectStorySpec }), edits);
  if (!verified) {
    // Si no coincide, se vuelve a la creatividad anterior para no dejar el anuncio en un estado dudoso.
    await graph(token, "POST", adId, { creative: JSON.stringify({ creative_id: creative.id }) });
    throw new Error("Meta no guardó los cambios como se esperaba. Se restauró la versión anterior.");
  }
  return {
    previousCreativeId: creative.id,
    newCreativeId: created.id,
    changes,
    verified,
    effectiveStatus: after.effective_status ?? "",
  };
}

/** Deshacer: vuelve a apuntar el anuncio a la creatividad anterior (que nunca se borró). */
export async function undoEdit(
  token: string,
  accountId: string,
  adId: string,
  previousCreativeId: string,
  expectedCurrentCreativeId: string,
): Promise<{ effectiveStatus: string }> {
  const ad = await fetchAd(token, accountId, adId);
  if (ad.creative?.id !== expectedCurrentCreativeId) {
    throw new Error("El anuncio ya fue modificado después de este cambio; no se puede deshacer automáticamente.");
  }
  await graph(token, "POST", adId, { creative: JSON.stringify({ creative_id: previousCreativeId }) });
  const after = await fetchAd(token, accountId, adId);
  if (after.creative?.id !== previousCreativeId) throw new Error("Meta no confirmó el cambio al deshacer.");
  return { effectiveStatus: after.effective_status ?? "" };
}
