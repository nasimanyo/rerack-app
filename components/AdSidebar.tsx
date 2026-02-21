"use client";

import Image from "next/image";

export default function AdSidebar() {
  const AD_WIDTH = 300;
  const AD_HEIGHT = 600; // ← 縦長に変更

  const adImage = "/ads/vertical-ad.png"; // public/ads に配置

  return (
    <div className="flex flex-col items-center">
      <div className="text-sm font-bold text-gray-500 mb-3">
        広告（非収益掲載）
      </div>

      <div
        className="border rounded-xl overflow-hidden bg-white shadow"
        style={{ width: AD_WIDTH, height: AD_HEIGHT }}
      >
        <Image
          src={adImage}
          alt="広告"
          width={AD_WIDTH}
          height={AD_HEIGHT}
          className="object-cover"
        />
      </div>
    </div>
  );
}