"use client";

import AdminAdUpload from "@/components/AdminAdUpload";

export default function UploadPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">広告アップロード</h1>
      <AdminAdUpload />
    </div>
  );
}