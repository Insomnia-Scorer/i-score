"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";

import { signIn } from "@/lib/auth-client"; // Client SDK

const formSchema = z.object({
  email: z.email({ message: "無効なメール形式です" }),
  password: z.string().min(6).max(50),
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

    // Better Auth のクライアントSDKを利用してsingIn
    await signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.refresh();
          router.push("/");
        },
        onError: (ctx) => {
          toast.error(ctx.error.message);
        },
      },
    );

    setLoading(false);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FieldGroup>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input placeholder="m@example.com" {...field} />
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
                <Field>
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader2 className="size-4 animate-spin" /> : "ログイン"}
                  </Button>
                  <FieldDescription className="text-center">
                    初めてのご利用ですか？ <a href="/signup">アカウント作成</a>
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </form>
          </Form>
        </CardContent>
      </Card>
      <footer className="mt-8 mb-4 text-xs text-center text-muted-foreground">
        <div className="mb-2">
          <span>Developed by </span>
          <a
            href="https://hakamata-soft.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-900 hover:underline"
          >
            insomnia-Scorer
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
