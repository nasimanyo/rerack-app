"use client";

import { useState } from "react";

export default function AdminAdUpload() {
  const REQUIRED_WIDTH = 300;
  const REQUIRED_HEIGHT = 250;

  const [preview, setPreview] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      alert("PNGまたはJPEGのみ対応です");
      return;
    }

    const img = new window.Image();
    img.onload = () => {
      if (
        img.width !== REQUIRED_WIDTH ||
        img.height !== REQUIRED_HEIGHT
      ) {
        alert("画像サイズは300x250のみ対応です");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result as string);

        // 実運用ならここでStorage保存
      };
      reader.readAsDataURL(file);
    };

    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="space-y-4 p-4 border rounded-xl">
      <div className="font-bold">広告画像アップロード（300×250固定）</div>

      <input
        type="file"
        accept="image/png,image/jpeg"
        onChange={(e) => {
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
          }
        }}
      />

      {preview && (
        <div className="border rounded overflow-hidden w-[300px] h-[250px]">
          <img
            src={preview}
            alt="preview"
            className="object-cover w-full h-full"
          />
        </div>
      )}
    </div>
  );
}