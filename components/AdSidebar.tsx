"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function AdSidebar() {
  const [adUrl, setAdUrl] = useState<string | null>(null);

  useEffect(() => {
    const { data } = supabase.storage
      .from("ads")
      .getPublicUrl("latest.png");

    if (data?.publicUrl) {
      setAdUrl(data.publicUrl + "?t=" + Date.now()); // キャッシュ防止
    }
  }, []);

  return (
    <div className="flex flex-col items-center">
      {adUrl ? (
        <Image
          src={adUrl}
          alt="広告"
          width={300}
          height={600}
          className="rounded-xl shadow"
        />
      ) : (
        <div className="w-[300px] h-[600px] bg-gray-200 rounded-xl flex items-center justify-center">
          広告なし
        </div>
      )}

      <div className="text-xs text-gray-400 text-center mt-3">
        ※非営利掲載枠です。企業広告は募集していません。
      </div>
    </div>
  );
}