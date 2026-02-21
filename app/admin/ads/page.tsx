"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function UploadPage() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    try {
      setUploading(true);

      const file = event.target.files?.[0];
      if (!file) return;

      // サイズ制限（例: 300x600専用想定）
      if (!file.type.startsWith("image/")) {
        alert("画像のみアップロード可能です");
        return;
      }

      const fileName = `${Date.now()}-${file.name}`;

      const { error } = await supabase.storage
        .from("ads")
        .upload(fileName, file);

      if (error) {
        alert(error.message);
        return;
      }

      alert("アップロード成功！");
    } catch (error) {
      alert("アップロード失敗");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ padding: 40 }}>
      <h1>広告アップロード</h1>
      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={uploading}
      />
    </div>
  );
}