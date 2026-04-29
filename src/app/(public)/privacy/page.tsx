// filepath: `src/app/(public)/privacy/page.tsx`
import React from "react";
import { ShieldCheck, CalendarDays, ScrollText } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="space-y-10">
      
      {/* 🌟 タイトルセクション：アイコンと文字で信頼感を演出 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <ShieldCheck className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-black tracking-widest text-primary uppercase">Trust & Security</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
            PRIVACY <span className="text-muted-foreground/50">POLICY</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground/60 bg-muted/30 px-4 py-2 rounded-full border border-border/20">
          <CalendarDays className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Last Updated: 2026.04.30</span>
        </div>
      </div>

      {/* 🌟 本文：セクションごとにカード風の装飾を入れつつ、余白を活かす */}
      <div className="grid gap-12 text-sm leading-relaxed text-muted-foreground/90">
        
        <section className="relative">
          <div className="flex items-start gap-4">
            <div className="mt-1">
              <ScrollText className="h-5 w-5 text-primary/40" />
            </div>
            <p className="flex-1 italic font-medium leading-relaxed">
              iS Baseball Lab（以下、「当ラボ」）は、提供するアプリケーション「iScore」（以下、「本サービス」）における、ユーザーの個人情報の取扱いについて、以下の通りポリシーを定めます。
            </p>
          </div>
        </section>

        {/* 第1条 */}
        <section className="group">
          <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-3 group-hover:text-primary transition-colors">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted font-mono text-xs">01</span>
            個人情報
          </h2>
          <div className="pl-11 space-y-4">
            <p>
              「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、特定の個人を識別できる情報（氏名、生年月日、連絡先、特定の個人を識別できるデータ等）を指します。
            </p>
          </div>
        </section>

        {/* 第2条 */}
        <section className="group">
          <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-3 group-hover:text-primary transition-colors">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted font-mono text-xs">02</span>
            収集方法
          </h2>
          <div className="pl-11">
            <p>
              当ラボは、ユーザーが利用登録をする際に氏名、メールアドレス、SNSアカウント情報（Google、LINE等）を収集することがあります。また、提携先から取引記録等の情報を収集する場合があります。
            </p>
          </div>
        </section>

        {/* 第3条 */}
        <section className="group border-l-2 border-primary/10 pl-6 py-2 bg-primary/[0.01] rounded-r-2xl">
          <h2 className="text-lg font-black text-foreground mb-4 flex items-center gap-3">
            <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-primary-foreground font-mono text-xs shadow-lg shadow-primary/20">03</span>
            利用目的
          </h2>
          <div className="pl-3 space-y-4">
            <p className="font-bold text-foreground/80">収集した情報は以下の目的で利用されます：</p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {[
                "本サービスの提供・運営",
                "本人確認およびお問い合わせ対応",
                "新機能、重要なお知らせの通知",
                "不正利用の防止および特定",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2 text-xs bg-muted/40 p-3 rounded-xl border border-border/20">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* 第4条・第5条 */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="p-6 rounded-3xl bg-muted/20 border border-border/20">
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
              04. Third Party
            </h3>
            <p className="text-xs">
              法令で認められる場合を除き、あらかじめユーザーの同意を得ることなく第三者に個人情報を提供することはありません。
            </p>
          </section>

          <section className="p-6 rounded-3xl bg-muted/20 border border-border/20">
            <h3 className="text-sm font-black text-foreground mb-3 flex items-center gap-2 uppercase tracking-widest">
              05. Changes
            </h3>
            <p className="text-xs">
              本ポリシーの内容は、ユーザーに通知することなく変更できるものとします。変更後の内容は本サイトに掲載したときから効力を生じます。
            </p>
          </section>
        </div>

      </div>
    </div>
  );
}
