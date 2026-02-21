"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminAdUpload() {
  const REQUIRED_WIDTH = 300;
  const REQUIRED_HEIGHT = 600;

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewSize, setPreviewSize] = useState<{ w: number; h: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentAdUrl, setCurrentAdUrl] = useState<string | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const { data } = supabase.storage.from("ads").getPublicUrl("latest.png");
    if (data?.publicUrl) {
      setCurrentAdUrl(data.publicUrl + "?t=" + Date.now());
    }
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const validateFile = (f: File) => {
    setError(null);
    if (!["image/png", "image/jpeg"].includes(f.type)) {
      setError("PNG または JPEG の画像のみ対応です。");
      return;
    }

    const img = new window.Image();
    const url = URL.createObjectURL(f);
    img.onload = () => {
      if (img.width !== REQUIRED_WIDTH || img.height !== REQUIRED_HEIGHT) {
        setError(`画像サイズは ${REQUIRED_WIDTH}×${REQUIRED_HEIGHT} のみ対応です（検出: ${img.width}×${img.height}）。`);
        URL.revokeObjectURL(url);
        setPreviewUrl(null);
        setPreviewSize(null);
        setFile(null);
        return;
      }

      setPreviewUrl(url);
      setPreviewSize({ w: img.width, h: img.height });
      setFile(f);
    };
    img.onerror = () => {
      setError("画像の読み込みに失敗しました。別のファイルを試してください。");
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSuccess(false);
    const f = e.target.files?.[0];
    if (f) validateFile(f);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setSuccess(false);
    const f = e.dataTransfer.files?.[0];
    if (f) validateFile(f);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const triggerFileSelect = () => inputRef.current?.click();

  const upload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);

    const { error } = await supabase.storage.from("ads").upload("latest.png", file, { upsert: true });

    setUploading(false);
    if (error) {
      console.error(error);
      setError(error.message || "アップロードに失敗しました");
      return;
    }

    setSuccess(true);
    // Refresh current ad URL with cache-bust
    const { data } = supabase.storage.from("ads").getPublicUrl("latest.png");
    if (data?.publicUrl) setCurrentAdUrl(data.publicUrl + "?t=" + Date.now());
  };

  return (
    <div className="p-4 border rounded-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="font-bold">広告アップロード（300×600）</div>
        {currentAdUrl && (
          <div className="text-xs text-gray-500">現在の広告</div>
        )}
      </div>

      {currentAdUrl && (
        <div className="mb-2">
          <img src={currentAdUrl} alt="現在の広告" width={150} height={300} className="rounded shadow" />
        </div>
      )}

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="w-full border-2 border-dashed border-gray-300 rounded p-4 text-center cursor-pointer"
        onClick={triggerFileSelect}
        role="button"
        aria-label="広告画像を選択またはドラッグアンドドロップ">
        {!previewUrl ? (
          <div className="space-y-2">
            <div className="text-sm">ここにドラッグ＆ドロップ、またはクリックして選択</div>
            <div className="text-xs text-gray-500">サイズ: 300×600 px / PNG・JPEG</div>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <img src={previewUrl} alt="プレビュー" width={150} height={300} className="rounded shadow" />
            <div className="ml-4 text-sm text-gray-600">
              <div>選択済み: {file?.name}</div>
              <div>サイズ: {previewSize?.w}×{previewSize?.h}</div>
            </div>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/png,image/jpeg" className="hidden" onChange={handleInputChange} />

      {error && <div className="text-sm text-red-600">{error}</div>}

      <div className="flex items-center space-x-2">
        <button type="button" onClick={triggerFileSelect} className="px-3 py-1 bg-gray-100 rounded">
          画像を選択
        </button>
        <button
          type="button"
          onClick={upload}
          disabled={!file || !!error || uploading}
          className={`px-4 py-1 rounded text-white ${uploading || !file || error ? "bg-gray-400" : "bg-blue-600"}`}>
          {uploading ? "アップロード中..." : "アップロード"}
        </button>
        {success && <div className="text-sm text-green-600">アップロード完了</div>}
      </div>
    </div>
  );
}