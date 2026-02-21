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
import { ArrowLeft, Loader2 } from "lucide-react";

import { signUp } from "@/lib/auth-client"; // Client SDK

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
      <Card>
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
                        <Input placeholder="○山 太郎" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="test@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
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
                        <Input placeholder="********" {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex flex-col gap-4 mt-6">
                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : "登録"}
                  </Button>
                  <Button type="button" variant="ghost" className="w-full" onClick={onCancel}>
                    <ArrowLeft className="mr-2 size-4" />
                    ログイン画面に戻る
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <footer className="mt-8 mb-4 text-xs text-center text-muted-foreground">
        <div className="mb-2">
          <span>Developed by </span>
          <a
            href="https://i-score.insomnia-scorer.workers.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 hover:underline"
          >
            Insomnia-Scorer
          </a>
        </div>

        <div className="flex text-xs items-center justify-center gap-2">
          <span className="text-muted-foreground">Powered by</span>
          {/* Next.js のブランドカラー (黒/白) */}
          <span className="bg-black text-white px-2 py-0.5 rounded font-bold">Next.js</span>
          <span className="text-gray-800">&</span>
          {/* Tailwind CSS のブランドカラー (シアン) */}
          <span className="bg-cyan-500 text-white px-2 py-0.5 rounded font-bold">Tailwind CSS</span>
        </div>
      </footer>
    </div>
  );
}
