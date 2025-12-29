"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Brush } from 'lucide-react';
import { useAuth, initiateEmailSignIn } from '@/firebase';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      initiateEmailSignIn(auth, email, password);
      // The onAuthStateChanged listener in FirebaseProvider will handle the redirect
    } catch (error: any) {
        toast({
            title: 'ログインエラー',
            description: error.message || '予期せぬエラーが発生しました。',
            variant: 'destructive',
        });
        setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background">
      {bgImage && (
        <Image
          src={bgImage.imageUrl}
          alt={bgImage.description}
          fill
          className="object-cover opacity-10"
          data-ai-hint={bgImage.imageHint}
        />
      )}
      <Card className="z-10 w-full max-w-sm border-2 border-border/50 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleLogin}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Brush className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">書道教室Schedule</CardTitle>
            <CardDescription>ログインしてスケジュールを確認</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input
                id="email"
                type="email"
                placeholder="例: user@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                required
                disabled={isLoading}
              />
            </div>
            <div className="text-center text-sm">
              アカウントをお持ちでないですか？{' '}
              <Link href="/signup" className="text-primary underline">
                サインアップ
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? 'ログイン中...' : 'ログイン'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
