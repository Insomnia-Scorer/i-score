"use client";
// src/app/not-found.tsx
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 px-4 text-center">
            <div className="space-y-2">
                <h2 className="text-4xl font-extrabold tracking-tight sm:text-5xl">404</h2>
                <p className="text-xl text-muted-foreground font-medium">ページが見つかりませんでした</p>
            </div>
            <p className="text-muted-foreground max-w-[500px]">
                お探しのページは削除されたか、名前が変更されたか、あるいは一時的に利用できない可能性があります。
            </p>
            <div className="flex items-center gap-4">
                <Button asChild variant="default" size="lg" className="rounded-full px-8">
                    <Link href="/">ホームに戻る</Link>
                </Button>
            </div>
        </div>
    )
}
