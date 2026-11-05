import { Fragment, type ReactNode } from "react";

// Markdown mínimo y seguro para las respuestas del agente: negrita, cursiva, código,
// enlaces, listas, títulos y tablas simples. No inyecta HTML.

function enLinea(texto: string, base: string): ReactNode[] {
  const out: ReactNode[] = [];
  const re = /(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\(https?:\/\/[^)\s]+\)|\*[^*\s][^*]*\*|_[^_\s][^_]*_)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(texto))) {
    if (m.index > last) out.push(texto.slice(last, m.index));
    const t = m[0];
    const k = `${base}-${i++}`;
    if (t.startsWith("**")) out.push(<strong key={k}>{t.slice(2, -2)}</strong>);
    else if (t.startsWith("`")) out.push(<code key={k} className="rounded bg-bg-2 px-1 py-0.5 text-[12px]">{t.slice(1, -1)}</code>);
    else if (t.startsWith("[")) {
      const mm = t.match(/^\[([^\]]+)\]\((.+)\)$/)!;
      out.push(<a key={k} href={mm[2]} target="_blank" rel="noreferrer" className="text-cyan underline underline-offset-2">{mm[1]}</a>);
    } else out.push(<em key={k}>{t.slice(1, -1)}</em>);
    last = m.index + t.length;
  }
  if (last < texto.length) out.push(texto.slice(last));
  return out;
}

export function Markdown({ texto }: { texto: string }) {
  const lineas = texto.replace(/\r/g, "").split("\n");
  const bloques: ReactNode[] = [];
  let i = 0;
  let n = 0;
  while (i < lineas.length) {
    const l = lineas[i];
    const k = `b${n++}`;
    if (l.startsWith("```")) {
      const cod: string[] = [];
      i++;
      while (i < lineas.length && !lineas[i].startsWith("```")) cod.push(lineas[i++]);
      i++;
      bloques.push(<pre key={k} className="overflow-x-auto rounded-lg bg-bg-2 p-3 text-[12px]"><code>{cod.join("\n")}</code></pre>);
      continue;
    }
    if (/^\s*\|.*\|\s*$/.test(l)) {
      const filas: string[][] = [];
      while (i < lineas.length && /^\s*\|.*\|\s*$/.test(lineas[i])) {
        const celdas = lineas[i].trim().slice(1, -1).split("|").map((c) => c.trim());
        if (!celdas.every((c) => /^:?-{2,}:?$/.test(c))) filas.push(celdas);
        i++;
      }
      bloques.push(
        <div key={k} className="overflow-x-auto">
          <table className="text-[13px]">
            <tbody>
              {filas.map((f, fi) => (
                <tr key={fi} className={fi === 0 ? "border-b border-line font-semibold" : "border-b border-line/50"}>
                  {f.map((c, ci) => <td key={ci} className="px-2 py-1 align-top">{enLinea(c, `${k}-${fi}-${ci}`)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (/^\s*([-*•]|\d+[.)])\s+/.test(l)) {
      const items: string[] = [];
      const ordenada = /^\s*\d+[.)]/.test(l);
      while (i < lineas.length && /^\s*([-*•]|\d+[.)])\s+/.test(lineas[i])) items.push(lineas[i++].replace(/^\s*([-*•]|\d+[.)])\s+/, ""));
      const Lista = ordenada ? "ol" : "ul";
      bloques.push(
        <Lista key={k} className={`${ordenada ? "list-decimal" : "list-disc"} flex flex-col gap-0.5 pl-5`}>
          {items.map((it, ii) => <li key={ii}>{enLinea(it, `${k}-${ii}`)}</li>)}
        </Lista>,
      );
      continue;
    }
    const h = l.match(/^#{1,4}\s+(.*)$/);
    if (h) {
      bloques.push(<p key={k} className="font-semibold">{enLinea(h[1], k)}</p>);
      i++;
      continue;
    }
    if (!l.trim()) {
      i++;
      continue;
    }
    const parrafo: string[] = [];
    while (i < lineas.length && lineas[i].trim() && !/^(```|#{1,4}\s|\s*([-*•]|\d+[.)])\s+|\s*\|)/.test(lineas[i])) parrafo.push(lineas[i++]);
    bloques.push(
      <p key={k}>
        {parrafo.map((p, pi) => (
          <Fragment key={pi}>
            {pi > 0 && <br />}
            {enLinea(p, `${k}-${pi}`)}
          </Fragment>
        ))}
      </p>,
    );
  }
  return <div className="flex flex-col gap-2">{bloques}</div>;
}
