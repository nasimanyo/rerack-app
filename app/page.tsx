import React from "react";

export default function ServiceClosed() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-center">
          サービス終了のお知らせ
        </h1>

        <div className="text-gray-700 space-y-4 text-sm md:text-base leading-relaxed">
          <p>
            本ページ「re!RACK」は、2026年4月11日をもちまして、サービスを終了することとなりました。
          </p>

          <p>
            これまでの約1年間、多くの皆様にアクセス・ご利用いただき、心より感謝申し上げます。
            日々ご利用いただいた皆様の存在が、本サービスを支える大きな力となっておりました。
          </p>

          <p>
            re!RACKは、より良いサービスを目指し、数多くのアップデートや改善、そして改名などを重ねながら運営を続けてまいりました。
            試行錯誤の連続ではありましたが、その一つひとつの取り組みは、開発者にとってかけがえのない経験となり、多くの学びを得ることができました。
          </p>

          <p>
            また、日頃からご利用いただいた皆様、そして様々な形で関わってくださったすべての方々に、改めて深く御礼申し上げます。
            皆様からいただいたご意見やご支援があったからこそ、ここまでサービスを続けることができました。
          </p>

          <p>
            本サービスは終了となりますが、re!RACKで得た経験や想いは、今後の活動へと確実に活かしてまいります。
            そして、これからも皆様のご活躍を陰ながら応援し続けていくことをお約束いたします。
          </p>

          <p className="pt-4">
            これまで本当にありがとうございました。
          </p>
        </div>

        {/* クレジット */}
        <div className="mt-10 border-t pt-6 text-sm text-gray-600 space-y-1">
          <p className="font-semibold text-gray-700">運営・制作</p>
          <p>コーディングアシスト: TAM様</p>
          <p>デザイン・UIアシスト: しゅんさく様</p>
          <p>運営募集のご協力: gamecreatorscamp (集英社)</p>
          <p>database: supabase</p>
          <p>デプロイ: github・vercel</p>

          <p className="pt-3 font-semibold">Special Thanks</p>
          <p>ご利用いただいた皆様</p>
        </div>

        <div className="mt-8 text-right text-gray-600">
          <p>re!RACK 運営・管理者</p>
          <p className="font-semibold">なしまん</p>
        </div>
      </div>
    </div>
  );
}