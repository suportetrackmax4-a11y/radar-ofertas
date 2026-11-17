const DIACRITICS = /[̀-ͯ]/g;

export function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}

/** Normaliza o termo de busca: sem acentos, minúsculo e sem curingas do SQL (% _ \). */
export function normalizeSearch(input: string): string {
  return input
    .normalize("NFD")
    .replace(DIACRITICS, "")
    .toLowerCase()
    .replace(/[%_\\,()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 80);
}
