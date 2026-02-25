"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  children?: React.ReactNode;
  password?: string;
  redirectPath?: string;
};

export default function SecretGate({ children, password = "nasimanch", redirectPath }: Props) {
  const [input, setInput] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const router = useRouter();

  const storageKey = `secret_auth_${password}`;

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const v = sessionStorage.getItem(storageKey);
      if (v === "1") setAuthenticated(true);
    } catch (e) {
      // ignore
    }
  }, [storageKey]);

  const handleSubmit = () => {
    if (input === password) {
      if (redirectPath) {
        router.push(redirectPath);
        return;
      }
      try {
        sessionStorage.setItem(storageKey, "1");
      } catch (e) {
        // ignore
      }
      setAuthenticated(true);
    } else {
      alert("パスワードが違います");
    }
  };

  if (authenticated) {
    return <>{children ?? null}</>;
  }

  return (
    <div className="flex gap-2">
      <input
        type="password"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="パスワード"
        className="border px-3 py-2 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-black text-white px-4 py-2 rounded"
      >
        送信
      </button>
    </div>
  );
}
