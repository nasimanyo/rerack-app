"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

const ADMIN_SECRET = "re2026"; // ← secret用コード

export default function SecretPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [postsCount, setPostsCount] = useState(0);
  const [noticesCount, setNoticesCount] = useState(0);
  const [todayPost, setTodayPost] = useState<boolean>(false);
  const [systemMode, setSystemMode] = useState("NORMAL");

  const [showAuth, setShowAuth] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  const [passwordInput, setPasswordInput] = useState("");

  const today = new Date().toISOString().split("T")[0];

  const fetchStats = async () => {
    setLoading(true);

    const { count: posts } = await supabase
      .from("posts")
      .select("*", { count: "exact", head: true });

    const { count: notices } = await supabase
      .from("notices")
      .select("*", { count: "exact", head: true });

    const { data: todayData } = await supabase
      .from("posts")
      .select("*")
      .eq("date", today)
      .maybeSingle();

    setPostsCount(posts || 0);
    setNoticesCount(notices || 0);
    setTodayPost(!!todayData);

    setLoading(false);
  };

  useEffect(() => {
    fetchStats();
  }, []);

  // 🔐 認証付き実行
  const requireAuth = (action: () => void) => {
    setPendingAction(() => action);
    setShowAuth(true);
  };

  const handleAuthConfirm = () => {
    if (passwordInput === ADMIN_SECRET) {
      setShowAuth(false);
      setPasswordInput("");
      pendingAction?.();
    } else {
      alert("認証失敗");
      setPasswordInput("");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f0f0f] text-white px-6 py-16">
      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-black mb-12 text-center">
          🕶 ADMIN DASHBOARD
        </h1>

        {loading ? (
          <div className="text-center text-gray-400 animate-pulse">
            データ取得中...
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-6 mb-12">
              <StatCard title="総投稿数" value={postsCount} />
              <StatCard title="お知らせ数" value={noticesCount} />
              <StatCard title="本日の投稿" value={todayPost ? "あり" : "なし"} />
            </div>

            <div className="bg-gray-900 p-8 rounded-3xl border border-gray-700 mb-12">
              <h2 className="text-xl font-bold mb-6">⚙ システムモード</h2>

              <div className="flex gap-4 flex-wrap">
                <button
                  onClick={() =>
                    requireAuth(() => setSystemMode("NORMAL"))
                  }
                  className="px-6 py-3 bg-green-600 rounded-2xl font-bold"
                >
                  NORMAL
                </button>

                <button
                  onClick={() =>
                    requireAuth(() => setSystemMode("MAINTENANCE"))
                  }
                  className="px-6 py-3 bg-yellow-600 rounded-2xl font-bold"
                >
                  MAINTENANCE
                </button>

                <button
                  onClick={() =>
                    requireAuth(() => setSystemMode("EMERGENCY"))
                  }
                  className="px-6 py-3 bg-red-600 rounded-2xl font-bold"
                >
                  EMERGENCY
                </button>
              </div>

              <p className="mt-6 text-lg">
                現在のモード：
                <span className="font-black ml-2">{systemMode}</span>
              </p>
            </div>

            <div className="flex gap-4 flex-wrap">
              <button
                onClick={() => requireAuth(fetchStats)}
                className="px-6 py-3 bg-blue-600 rounded-2xl font-bold"
              >
                🔄 データ再取得
              </button>

              <button
                onClick={() => router.push("/")}
                className="px-6 py-3 bg-gray-700 rounded-2xl font-bold"
              >
                ⬅ ホームへ戻る
              </button>
            </div>
          </>
        )}
      </div>

      {/* 🔐 認証モーダル */}
      {showAuth && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-700 w-80 text-center">
            <h2 className="text-xl font-bold mb-4">管理者認証</h2>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full p-3 rounded-xl bg-black border border-gray-600 mb-4 text-center"
              placeholder="パスワード"
            />
            <button
              onClick={handleAuthConfirm}
              className="w-full py-3 bg-red-600 rounded-xl font-bold"
            >
              認証
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value }: { title: string; value: any }) {
  return (
    <div className="bg-gray-900 p-6 rounded-3xl border border-gray-700 text-center">
      <p className="text-gray-400 text-sm mb-2">{title}</p>
      <p className="text-3xl font-black">{value}</p>
    </div>
  );
}
