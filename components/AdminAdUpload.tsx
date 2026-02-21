"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminAdUpload() {
  const REQUIRED_WIDTH = 300;
  const REQUIRED_HEIGHT = 600;

  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("PNGかJPEGのみ対応です");
      return;
    }

    const img = new window.Image();
    img.onload = async () => {
      if (
        img.width !== REQUIRED_WIDTH ||
        img.height !== REQUIRED_HEIGHT
      ) {
        alert("画像サイズは300×600のみ対応です");
        return;
      }

      setUploading(true);

      const fileName = `ad-${Date.now()}.png`;

      const { error } = await supabase.storage
        .from("ads")
        .upload(fileName, file, { upsert: true });

      if (error) {
        alert("アップロード失敗");
      } else {
        alert("アップロード成功！");
      }

      setUploading(false);
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4">
      <div className="font-bold">
        広告アップロード（300×600固定）
      </div>

      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleUpload(e.target.files[0]);
          }
        }}
      />

      {uploading && <div>アップロード中...</div>}
    </div>
  );
}