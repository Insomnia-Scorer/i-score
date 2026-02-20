import Image from "next/image";
import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex items-center gap-2 self-center font-medium">
          <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
            <div className="relative h-6 w-6">
              <Image
                src="/logo.png"
                alt="ロゴ"
                fill
                className="object-contain"
                sizes="24px"
              />
            </div>
          </div>
          Hakamata soft
        </div>
        <SignupForm />
      </div>
    </div>
  )
}
