const sep = (n: number) => Math.round(n).toLocaleString("es-AR");

export const fmtN = (n: number) => sep(n);
export const fmtARS = (n: number) => "$" + sep(n);
export const fmtBRL = (n: number) => "R$" + sep(n);
