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
import { Brush, Loader2 } from 'lucide-react';
import { useAuth, useFirestore } from '@/firebase';
import Link from 'next/link';
import { createUserWithEmailAndPassword, updateProfile, deleteUser } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const bgImage = PlaceHolderImages.find(img => img.id === 'login-bg');

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setIsLoading(true);

    if (password.length < 6) {
        toast({
            title: 'サインアップエラー',
            description: 'パスワードは6文字以上で入力してください。',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    let user;
    try {
      // 1. Authユーザー作成
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      user = userCredential.user;

      // 2. プロフィール更新
      await updateProfile(user, { displayName: name });

      // 3. Firestoreにユーザードキュメント作成
      const userDocRef = doc(firestore, 'users', user.uid);
      await setDoc(userDocRef, {
        uid: user.uid,
        name: name,
        email: email,
        role: email === 'admin@example.com' ? 'admin' : 'student',
        createdAt: serverTimestamp(),
      });

      toast({ title: '成功', description: 'アカウントを作成しました。' });
      router.push('/');

    } catch (error: any) {
        console.error('Signup Error:', error);
        
        // Firestoreへの書き込みに失敗した場合、Authユーザーだけ残るのを防ぐために削除を試みる
        if (user && error.code !== 'auth/email-already-in-use') {
            try { await deleteUser(user); } catch (e) { console.error('Cleanup error:', e); }
        }

        let errorMessage = '予期せぬエラーが発生しました。';
        if (error.code === 'auth/email-already-in-use') {
            errorMessage = 'このメールアドレスは既に登録されています。心当たりがない場合は、以前の登録が中途半端に終わっている可能性があります。ログイン画面からお試しください。';
        } else if (error.code === 'auth/weak-password') {
            errorMessage = 'パスワードが弱すぎます。別のパスワードをお試しください。';
        } else if (error.code === 'permission-denied') {
            errorMessage = 'データベースへの保存権限がありません。管理者にお問い合わせください。';
        }

        toast({
            title: 'サインアップエラー',
            description: errorMessage,
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
        <form onSubmit={handleSignup}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-primary/10 p-3">
              <Brush className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">アカウント作成</CardTitle>
            <CardDescription>必要事項を入力してください</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">お名前</Label>
              <Input
                id="name"
                type="text"
                placeholder="例: 山田 太郎"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
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
                placeholder="6文字以上"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
             <div className="text-center text-sm">
              すでにアカウントをお持ちですか？{' '}
              <Link href="/login" className="text-primary underline">
                ログイン
              </Link>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full font-bold" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isLoading ? '作成中...' : 'アカウントを作成'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
