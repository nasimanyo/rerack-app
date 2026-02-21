"use client";

import { useState } from "react";
import AdminAdUpload from "@/components/AdminAdUpload";

export default function AdminAdsPage() {
  const [code, setCode] = useState("");
  const SECRET = "Nasi-man-yo1209";

  if (code !== SECRET) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <input
          type="password"
          placeholder="管理コード"
          className="border p-2 rounded"
          onChange={(e) => setCode(e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-10">
      <div className="w-full max-w-xl space-y-6">
        <h1 className="text-2xl font-bold text-center">
          広告管理ページ
        </h1>

        <AdminAdUpload />
      </div>
    </div>
  );
}