"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
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
import { ArrowLeft, Loader2, Mail } from "lucide-react";

import { FcGoogle } from "react-icons/fc"; // Google公式カラーアイコン
import { SiLine } from "react-icons/si";   // LINE公式アイコン

import { signUp, signIn } from "@/lib/auth-client"; // Client SDK

const formSchema = z.object({
  email: z.email({ message: "無効なメール形式です" }),
  userName: z.string().min(4, { message: "ユーザー名は4文字以上必要です" }),
  password: z
    .string()
    .min(8, { message: "パスワードは8文字以上必要です" })
    .max(50, { message: "パスワードは50文字以内にしてください" }),
});

export function SignupForm({ className, ...props }: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      userName: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    const { error } = await signUp.email({
      email: values.email,
      password: values.password,
      name: values.userName,
    });
    if (error) {
      toast.error(error.message);
      setIsLoading(false);
      return;
    }
    // 成功時
    toast.success("登録が完了しました");
    router.push("/");

    setIsLoading(false);
  }

  function onCancel(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault(); // フォーム送信を防ぐ
    e.stopPropagation(); // 親要素へのイベント伝播を防ぐ
    router.push("/login");
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="bg-background shadow-sm border-border">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">アカウントの作成</CardTitle>
          <CardDescription>利用者情報を登録してください。</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ユーザー名</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="ユーザー名"
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
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
                      <FormLabel>パスワード</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="********"
                          className="h-12 text-base px-4 focus-visible:ring-1 focus-visible:ring-ring"
                          {...field}
                          type="password"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 dark:text-red-400 font-medium text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-4 mt-6">
                  <Button 
                    type="submit" 
                    variant="outline"
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
                    {isLoading ? "処理中..." : "メールアドレスで登録"}
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

                  {/* 💡 SNSボタンエリア（サインアップ用） */}
                  <div className="flex flex-col gap-3">
                    {/* Googleボタン */}
                    <Button
                      type="button"
                      variant="outline"
                      className="relative w-full h-12 bg-background font-medium hover:bg-muted/50 transition-colors text-foreground border-border shadow-sm text-base"
                      onClick={() => signIn.social({ provider: "google" })}
                    >
                      <div className="absolute left-4 flex items-center justify-center">
                        <FcGoogle style={{ width: '22px', height: '22px' }} />
                      </div>
                      {/* 💡 テキストを「登録」に変更 */}
                      Googleで登録
                    </Button>

                    {/* LINEボタン */}
                    <Button
                      type="button"
                      variant="outline"
                      className="relative w-full h-12 bg-[#06C755] hover:bg-[#05b34c] text-white font-medium transition-colors border-none shadow-sm text-base"
                      onClick={() => signIn.social({ provider: "line" })}
                    >
                      <div className="absolute left-4 flex items-center justify-center">
                        <SiLine style={{ width: '24px', height: '24px' }} />
                      </div>
                      {/* 💡 テキストを「登録」に変更 */}
                      LINEで登録
                    </Button>
                  </div>

                  <Button type="button" variant="ghost" className="underline underline-offset-4 hover:text-primary font-medium transition-colors" onClick={onCancel}>
                    <ArrowLeft className="mr-2 size-4" />
                    ログイン画面に戻る
                  </Button>
                </div>
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
