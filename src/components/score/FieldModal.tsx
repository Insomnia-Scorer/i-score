// src/components/score/FieldModal.tsx
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FieldModalProps {
    show: boolean;
    onClose: () => void;
    onFinalize: (e: React.MouseEvent<HTMLDivElement>) => void;
}

export function FieldModal({ show, onClose, onFinalize }: FieldModalProps) {
    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="w-full max-w-[360px] bg-card border border-border rounded-2xl p-6 shadow-2xl flex flex-col items-center relative animate-in zoom-in-95 duration-200">
                <Button variant="ghost" size="icon" className="absolute top-3 right-3 rounded-full text-muted-foreground hover:bg-muted" onClick={onClose}>
                    <X className="h-5 w-5" />
                </Button>

                <h2 className="text-lg font-black tracking-tight mb-2 flex items-center gap-2">どこに飛びましたか？</h2>
                <p className="text-xs text-muted-foreground mb-6">グラウンドの図を直接タップして記録します</p>

                <div className="w-full aspect-square relative cursor-crosshair drop-shadow-lg" onClick={onFinalize}>
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        <path d="M 50 90 L 15 20 Q 50 5 85 20 Z" fill="#15803d" stroke="#4ade80" strokeWidth="0.5" />
                        <path d="M 50 90 L 68 54 Q 50 35 32 54 Z" fill="#a16207" />
                        <line x1="50" y1="90" x2="15" y2="20" stroke="white" strokeWidth="0.5" />
                        <line x1="50" y1="90" x2="85" y2="20" stroke="white" strokeWidth="0.5" />
                        <polygon points="50,88 52,90 50,92 48,90" fill="white" />
                        <polygon points="63,66 65,68 63,70 61,68" fill="white" />
                        <polygon points="50,44 52,46 50,48 48,46" fill="white" />
                        <polygon points="37,66 39,68 37,70 35,68" fill="white" />
                    </svg>
                </div>
            </div>
        </div>
    );
}
