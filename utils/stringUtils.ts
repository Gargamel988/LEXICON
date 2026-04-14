/**
 * Turkish-aware string utilities to handle special characters like 'İ' and 'ı'.
 */

export const toUpperTurkish = (str: string): string => {
  return str
    .replace(/i/g, "İ")
    .replace(/ı/g, "I")
    .toUpperCase();
};

export const toLowerTurkish = (str: string): string => {
  return str
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase();
};

export const includesTurkish = (base: string, search: string): boolean => {
  return toUpperTurkish(base).includes(toUpperTurkish(search));
};
