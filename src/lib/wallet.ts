import { useEffect, useState, useCallback } from "react";

const KEY = "etherum_state_v1";

export type Txn = {
  id: string;
  title: string;
  amount: number;
  ts: number;
  kind: "credit" | "debit";
};

export type EtherumState = {
  signedIn: boolean;
  fullName: string;
  email: string;
  balance: number;
  welcomeClaimed: boolean;
  surpriseShown: boolean;
  txns: Txn[];
  reduceMotion: boolean;
};

const initial: EtherumState = {
  signedIn: false,
  fullName: "",
  email: "",
  balance: 0,
  welcomeClaimed: false,
  surpriseShown: false,
  txns: [],
  reduceMotion: false,
};

function read(): EtherumState {
  if (typeof window === "undefined") return initial;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function write(s: EtherumState) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(s));
  window.dispatchEvent(new CustomEvent("etherum-state"));
}

export function useEtherum() {
  const [state, setState] = useState<EtherumState>(initial);
  useEffect(() => {
    setState(read());
    const h = () => setState(read());
    window.addEventListener("etherum-state", h);
    window.addEventListener("storage", h);
    return () => {
      window.removeEventListener("etherum-state", h);
      window.removeEventListener("storage", h);
    };
  }, []);

  const update = useCallback((patch: Partial<EtherumState> | ((s: EtherumState) => EtherumState)) => {
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