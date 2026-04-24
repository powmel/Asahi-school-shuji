"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { Brush, CalendarDays, Loader2 } from "lucide-react";
import { useAuth } from "@/firebase";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const bgImage = PlaceHolderImages.find((img) => img.id === "login-bg");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // The onAuthStateChanged listener in FirebaseProvider will handle the redirect.
      // A successful login will trigger the logic in `src/app/page.tsx`.
      router.push("/");
    } catch (error: any) {
      toast({
        title: "ログインできませんでした",
        description:
          error.message || "メールアドレスとパスワードを確認してください。",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-foreground">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          priority
          className="object-cover opacity-[0.07]"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <div className="absolute inset-x-0 top-0 h-1 bg-secondary" />
      <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_420px]">
        <section className="hidden max-w-xl lg:block">
          <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
            <Brush className="h-7 w-7" aria-hidden="true" />
          </div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
            <CalendarDays className="h-3.5 w-3.5" aria-hidden="true" />
            朝日書道教室 スケジュール管理
          </p>
          <h1 className="font-headline text-4xl font-semibold leading-tight tracking-[0.02em] text-foreground">
            授業予定と振替を、迷わず確認できる場所へ。
          </h1>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            生徒・保護者は次回授業やお知らせを確認し、講師は月間スケジュールと振替申請を整理できます。
          </p>
        </section>

        <Card className="w-full border-border bg-card/95 shadow-sm backdrop-blur">
          <form onSubmit={handleLogin}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground lg:hidden">
                <Brush className="h-6 w-6" aria-hidden="true" />
              </div>
              <CardTitle className="font-headline text-2xl tracking-[0.02em]">
                ログイン
              </CardTitle>
              <CardDescription>
                登録済みのメールアドレスで予定を確認します。
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                  disabled={isLoading}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                アカウントをお持ちでない場合は{" "}
                <Link href="/signup" className="font-medium text-accent underline">
                  新規登録
                </Link>
              </p>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="h-11 w-full font-semibold" disabled={isLoading}>
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                {isLoading ? "ログイン中" : "ログイン"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </main>
  );
}
