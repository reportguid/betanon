import { useEffect, useState, useCallback } from "react";

const KEY = "etherox_state_v1";

export type Txn = {
  id: string;
  title: string;
  amount: number;
  ts: number;
  kind: "credit" | "debit";
};

export type EtheroxState = {
  signedIn: boolean;
  fullName: string;
  email: string;
  balance: number;
  welcomeClaimed: boolean;
  surpriseShown: boolean;
  txns: Txn[];
  reduceMotion: boolean;
};

const initial: EtheroxState = {
  signedIn: false,
  fullName: "",
  email: "",
  balance: 0,
  welcomeClaimed: false,
  surpriseShown: false,
  txns: [],
  reduceMotion: false,
};

function read(): EtheroxState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function write(s: EtheroxState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("etherox-state"));
}

export function useEtherox() {
  const [state, setState] = useState<EtheroxState>(initial);
  useEffect(() => {
    setState(read());
    const h = () => setState(read());
    window.addEventListener("etherox-state", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("etherox-state", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const update = useCallback((patch: Partial<EtheroxState> | ((s: EtheroxState) => EtheroxState)) => {
    const cur = read();
    const next = typeof patch === "function" ? patch(cur) : { ...cur, ...patch };
    write(next);
  }, []);

  const credit = useCallback((title: string, amount: number) => {
    const cur = read();
    const txn: Txn = { id: crypto.randomUUID(), title, amount, ts: Date.now(), kind: "credit" };
    write({ ...cur, balance: cur.balance + amount, txns: [txn, ...cur.txns] });
  }, []);

  const signOut = useCallback(() => write(initial), []);

  return { state, update, credit, signOut };
}

export function formatNaira(n: number) {
  return "₦" + n.toLocaleString("en-NG");
}