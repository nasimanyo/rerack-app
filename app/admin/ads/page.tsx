"use client";

import AdminAdUpload from "@/components/AdminAdUpload";
import SecretGate from "@/components/SecretGate";

export default function UploadPage() {
  return (
    <SecretGate password={"Haruki_1209"}>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">広告アップロード</h1>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="md:w-1/2">
            <AdminAdUpload fileName="left.png" title="左側広告アップロード（300×600）" />
          </div>
          <div className="md:w-1/2">
            <AdminAdUpload fileName="right.png" title="右側広告アップロード（300×600）" />
          </div>
        </div>
      </div>
    </SecretGate>
  );
}