import Image from "next/image";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <div className="relative h-6 w-6">
              <Image src="/logo.png" alt="ロゴ" fill className="object-contain" sizes="24px" />
            </div>
          </div>
          i-Score
        </div>
        <LoginForm />
        <div className="mt-4 text-center text-sm text-muted-foreground">
          <p>テストアカウントも用意しています。</p>
          <p className="font-mono mt-1">admin@test.com / kyouhayuki</p>
        </div>{" "}
      </div>
    </div>
  );
}
