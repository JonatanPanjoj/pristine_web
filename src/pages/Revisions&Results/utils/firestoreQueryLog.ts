// utils/firestoreQueryLog.ts
// Logger liviano para medir cuántas consultas y lecturas (aprox) hace cada
// adapter. Se crea UNA instancia por invocación del adapter (no singleton),
// así el tablero general y el detallado no se mezclan aunque corran en paralelo.
//
// Estimación de lecturas facturadas:
//   getDoc                → 1
//   getDocs               → max(1, docs devueltos)   (query vacía factura 1)
//   getCountFromServer    → max(1, ceil(count/1000)) (1 lectura por cada 1,000
//                            entradas de índice contadas)
//
// Solo imprime fuera de producción.

export type QueryOp = "getDoc" | "getDocs" | "count";

export interface QueryLogEntry {
  op: QueryOp;
  consulta: string;      // etiqueta legible de qué se consultó
  requests: number;      // llamadas HTTP (las queries "in" partidas suman >1)
  lecturas: number;      // lecturas facturadas aproximadas
}

const ENABLED =
  typeof process === "undefined" || process.env.NODE_ENV !== "production";

const now = () =>
  typeof performance !== "undefined" ? performance.now() : Date.now();

export const createQueryLog = (title: string) => {
  const t0 = now();
  const entries: QueryLogEntry[] = [];

  return {
    add(op: QueryOp, consulta: string, opts?: { requests?: number; lecturas?: number }) {
      entries.push({
        op,
        consulta,
        requests: opts?.requests ?? 1,
        lecturas: Math.max(1, opts?.lecturas ?? 1),
      });
    },

    report() {
      if (!ENABLED || entries.length === 0) return;
      const ms = Math.round(now() - t0);
      const totalReq = entries.reduce((a, e) => a + e.requests, 0);
      const totalReads = entries.reduce((a, e) => a + e.lecturas, 0);

      console.groupCollapsed(
        `🔥 Firestore · ${title} — ${totalReq} consultas · ~${totalReads} lecturas · ${ms} ms`
      );
      console.table(entries);
      console.log(
        `Total: ${totalReq} consultas, ~${totalReads} lecturas facturadas (aprox), ${ms} ms`
      );
      console.groupEnd();
    },
  };
};

export type QueryLog = ReturnType<typeof createQueryLog>;
