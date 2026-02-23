"use client";

import AdSidebar from "@/components/AdSidebar";

export default function AdFixedSides() {
  return (
    <>
      {/* 左側固定広告 */}
      <div className="hidden lg:block fixed left-6 top-1/2 -translate-y-1/2">
        <AdSidebar fileName="left.png" />
      </div>

      {/* 右側固定広告 */}
      <div className="hidden lg:block fixed right-6 top-1/2 -translate-y-1/2">
        <AdSidebar fileName="right.png" />
      </div>
    </>
  );
}
