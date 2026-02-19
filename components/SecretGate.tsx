"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SecretGate() {
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = () => {
    if (password === "re2026") { // ← ダミーパスワード
      router.push("/secret");    // ← 飛ばしたいページ
    } else {
      alert("パスワードが違います");
    }
  };

  return (
    <div className="flex gap-2">
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
