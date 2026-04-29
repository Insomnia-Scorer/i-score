// filepath: `src/app/(public)/terms/page.tsx`
import React from "react";
import { Scale, Gavel, Ban, AlertTriangle, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="space-y-10">
      
      {/* 🌟 タイトルセクション：ポリシーとデザインを統一 */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border/40 pb-10">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Scale className="h-6 w-6 text-primary" />
            </div>
            <span className="text-xs font-black tracking-widest text-primary uppercase">Service Rules</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter">
            TERMS OF <span className="text-muted-foreground/50">SERVICE</span>
          </h1>
        </div>
        
        <div className="flex items-center gap-2 text-muted-foreground/60 bg-muted/30 px-4 py-2 rounded-full border border-border/20">
          <Gavel className="h-3.5 w-3.5" />
          <span className="text-[10px] font-bold uppercase tracking-wider">Effective: 2026.04.01</span>
        </div>
      </div>

      {/* 🌟 本文コンテンツ */}
      <div className="grid gap-12 text-sm leading-relaxed text-muted-foreground/90">
        
        <section className="relative">
          <p className="italic font-medium leading-relaxed border-l-4 border-primary pl-4 py-1">
            本規約は、iS Baseball Lab（以下、「当ラボ」）が提供する「iScore」（以下、「本サービス」）の利用条件を定めるものです。ユーザーの皆さまには、本規約に従って本サービスをご利用いただきます。
          </p>
        </section>

        {/* 第1条・第2条：標準レイアウト */}
        <div className="grid md:grid-cols-2 gap-8">
          <section className="space-y-4 p-6 rounded-3xl bg-muted/20 border border-border/20">
            <h2 className="text-lg font-black text-foreground flex items-center gap-3">
              <span className="text-primary text-xs font-mono">Art.01</span>
              適用
            </h2>
            <p className="text-xs leading-relaxed">
              本規約は、ユーザーと当ラボとの間の本サービスの利用に関わる一切の関係に適用されるものとします。
            </p>
          </section>

          <section className="space-y-4 p-6 rounded-3xl bg-muted/20 border border-border/20">
            <h2 className="text-lg font-black text-foreground flex items-center gap-3">
              <span className="text-primary text-xs font-mono">Art.02</span>
              アカウント管理
            </h2>
            <p className="text-xs leading-relaxed">
              ユーザーは自己の責任においてアカウント情報を適切に管理するものとし、第三者への譲渡・貸与は一切禁止します。
            </p>
          </section>
        </div>

        {/* 第3条：禁止事項（視覚的に目立たせる） */}
        <section className="group bg-red-500/[0.02] border border-red-500/10 rounded-[32px] p-6 md:p-8">
          <h2 className="text-xl font-black text-foreground mb-6 flex items-center gap-3">
            <div className="p-2 bg-red-500/10 rounded-lg">
              <Ban className="h-5 w-5 text-red-500" />
            </div>
            禁止事項
          </h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              "法令または公序良俗に違反する行為",
              "犯罪行為に関連する行為",
              "知的財産権（著作権・商標権）を侵害する行為",
              "サーバーやネットワーク機能を破壊する行為",
              "情報を商業的に利用する行為",
              "運営を妨害するおそれのある行為"
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-3 text-xs p-3 rounded-xl bg-background/50 border border-border/40 shadow-sm">
                <ShieldAlert className="h-4 w-4 text-red-500/50 shrink-0 mt-0.5" />
                {text}
              </li>
            ))}
          </ul>
        </section>

        {/* 第4条・第5条 */}
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-lg font-black text-foreground flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500/50" />
              本サービスの提供の停止等
            </h2>
            <div className="pl-8 space-y-3 border-l border-border/40 ml-2.5">
              <p>当ラボは、保守点検、天災、事故、その他困難と判断した事由がある場合、事前に通知することなく本サービスの全部または一部を停止できるものとします。</p>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-lg font-black text-foreground flex items-center gap-3">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted font-mono text-xs">05</span>
              免責事項
            </h2>
            <div className="pl-11">
              <p className="bg-muted/40 p-4 rounded-2xl text-xs italic">
                当ラボは、本サービスに事実上または法律上の瑕疵（バグ、エラー、セキュリティの欠陥等）がないことを明示的にも黙示的にも保証しておりません。
              </p>
            </div>
          </section>
        </div>

      </div>
    </div>
  );
}
