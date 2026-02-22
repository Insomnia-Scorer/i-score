"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { z } from "zod";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";

import { FcGoogle } from "react-icons/fc"; // Google公式カラーアイコン
import { SiLine } from "react-icons/si";   // LINE公式アイコン

import { signIn } from "@/lib/auth-client"; // Client SDK

const formSchema = z.object({
  email: z.email({ message: "無効なメール形式です" }),
  password: z.string().min(6, { message: "パスワードは6文字以上必要です" }).max(50),
});

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);

    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          toast.success("ログインしました");
          router.refresh();
          router.push("/");
          // 💡 成功時は画面遷移するので setLoading(false) は呼ばない（ボタンがチラつくのを防ぐ）
        },
        onError: (ctx) => {
          toast.error(ctx.error.message || "ログインに失敗しました");
          setLoading(false); // 💡 エラー時のみローディングを解除し、再入力できるようにする
        },
      }
    );
  }

  return (
    <div className={cn("flex flex-col gap-6 w-full max-w-sm mx-auto", className)} {...props}>
      {/* 💡 shadow-sm で控えめな影をつけ、border-border で繊細な枠線を設定 */}
      <Card className="bg-background shadow-sm border-border">
        <CardHeader className="text-center space-y-1">
          <CardTitle className="text-2xl font-semibold tracking-tight">ログイン</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            i-Score にアクセスしてスコアを記録しましょう
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FieldGroup className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-foreground">メールアドレス</FormLabel>
                      <FormControl>
                        {/* 💡 focus時のリングを控えめな色にする */}
                        <Input 
                          placeholder="メールアドレス" 
                          className="h-12 text-base px-4 focus-visible:ring-1 focus-visible:ring-ring" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 font-medium text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-medium text-foreground">パスワード</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="********" 
                          type="password" 
                          className="h-12 text-base px-4 focus-visible:ring-1 focus-visible:ring-ring"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 font-medium text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <Field className="pt-2">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    // 💡 SNSボタンと同じ h-12 と text-base を適用し、メインカラー（bg-primary）で目立たせます
                    className="relative w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-sm text-base transition-colors"
                  >
                    {/* 💡 左端にアイコンを絶対配置。ロード中はスピナーに切り替わります */}
                    <div className="absolute left-4 flex items-center justify-center">
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Mail className="h-5 w-5" />
                      )}
                    </div>
                    
                    {/* 💡 テキストもSNSボタンに合わせて少し丁寧に */}
                    {isLoading ? "処理中..." : "メールアドレスでログイン"}
                  </Button>

                  {/* 💡 区切り線（OR） */}
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground font-medium">
                        または
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    {/* Googleボタン */}
                    <Button
                      type="button"
                      variant="outline"
                      // 💡 relative を追加し、ボタン自体の高さを h-12 (48px) にしてタップ領域を最大化
                      className="relative w-full h-12 bg-background font-medium hover:bg-muted/50 transition-colors text-foreground border-border shadow-sm text-base"
                      onClick={() => signIn.social({ provider: "google" })}
                    >
                      {/* 💡 アイコンを左端に絶対配置（absolute）し、ピクセル単位でサイズを固定 */}
                      <div className="absolute left-4 flex items-center justify-center">
                        <FcGoogle style={{ width: '22px', height: '22px' }} />
                      </div>
                      {/* テキストは完全に中央に配置されます */}
                      Googleで続ける
                    </Button>

                    {/* LINEボタン */}
                    <Button
                      type="button"
                      // 💡 こちらも h-12 に統一
                      className="relative w-full h-12 bg-[#06C755] hover:bg-[#05b34c] text-white font-medium transition-colors border-none shadow-sm text-base"
                      onClick={() => signIn.social({ provider: "line" })}
                    >
                      <div className="absolute left-4 flex items-center justify-center">
                        {/* 💡 LINEアイコンは少し余白が多いため、Googleよりわずかに大きく(24px)すると光学的なバランスが合います */}
                        <SiLine style={{ width: '24px', height: '24px' }} />
                      </div>
                      LINEで続ける
                    </Button>
                  </div>

                  <FieldDescription className="text-center mt-4 text-sm">
                    初めてのご利用ですか？{" "}
                    <a href="/signup" className="underline underline-offset-4 hover:text-primary font-medium transition-colors">
                      アカウント作成
                    </a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>

      <footer className="mt-4 text-xs text-center text-muted-foreground space-y-3">
        <div>
          <span>Developed by </span>
          <a
            href="https://github.com/Insomnia-Scorer/i-score"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium hover:text-foreground hover:underline transition-colors"
          >
            insomnia-Scorer
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 opacity-80">
          <span>Powered by</span>
          <span className="bg-foreground text-background px-1.5 py-0.5 rounded-sm font-semibold tracking-wide">Next.js</span>
          <span className="opacity-50">&</span>
          <span className="bg-[#06b6d4] text-white px-1.5 py-0.5 rounded-sm font-semibold tracking-wide">Tailwind</span>
        </div>
      </footer>
    </div>
  );
}