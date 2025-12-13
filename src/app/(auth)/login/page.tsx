"use client";

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Brush } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Mock authentication
    setTimeout(() => {
      if ((email === 'admin@example.com' || email.startsWith('student')) && password === 'password') {
        login(email);
        const isAdmin = email === 'admin@example.com';
        router.push(isAdmin ? '/admin' : '/student');
      } else {
        toast({
          title: 'ログイン失敗',
          description: 'メールアドレスまたはパスワードが正しくありません。',
          variant: 'destructive',
        });
        setIsLoading(false);
      }
    }, 1000);
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
            <div className="pt-2 text-xs text-muted-foreground">
              <p>生徒: student1@example.com / password</p>
              <p>管理者: admin@example.com / password</p>
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
