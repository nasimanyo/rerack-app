"use client";

import Image from "next/image";
import { useState } from "react";

export default function AdSidebar() {
  const AD_WIDTH = 300;
  const AD_HEIGHT = 250;

  const [adImage, setAdImage] = useState("/ads/default.png");

  return (
    <div className="flex flex-col items-center space-y-4">
      <div className="text-sm font-bold text-gray-500">
        広告（非収益掲載枠）
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