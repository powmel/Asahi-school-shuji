'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Link as LinkIcon } from 'lucide-react';
import { Loading } from '@/components/shared/Loading';
import { doc, getDoc } from 'firebase/firestore';


export default function LinkAccountPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const [studentCode, setStudentCode] = useState('');
  const [linkToken, setLinkToken] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingPage, setIsLoadingPage] = useState(true);

  useEffect(() => {
    if (!isUserLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef).then(docSnap => {
        if (docSnap.exists()) {
          const userData = docSnap.data();
          if (userData.role === 'admin') {
            router.replace('/admin'); // Admin should not be here
          } else if (userData.linkedStudentId) {
            router.replace('/student'); // Already linked
          } else {
            setIsLoadingPage(false); // Show the page for unlinked students
          }
        } else {
           router.replace('/login');
        }
      });
    }
  }, [user, isUserLoading, firestore, router]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!user) {
      toast({ title: 'エラー', description: '認証されていません。再度ログインしてください。', variant: 'destructive' });
      setIsSubmitting(false);
      router.push('/login');
      return;
    }

    try {
        const idToken = await user.getIdToken();
        const response = await fetch('/api/link-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${idToken}`,
            },
            body: JSON.stringify({ studentCode, linkToken }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || '連携に失敗しました。');
        }

        toast({ title: '成功', description: 'アカウントの連携が完了しました。' });
        router.push('/'); // Redirect to home, which will then redirect to the correct dashboard

    } catch (error: any) {
        toast({
            title: '連携エラー',
            description: 'おそらく連携がうまく行ってない。トークンや生徒コードの認証はどうやってるの？',
            variant: 'destructive',
        });
    } finally {
        setIsSubmitting(false);
    }
  };

  if (isUserLoading || isLoadingPage) {
      return <Loading />
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background">
      <Card className="z-10 w-full max-w-sm border-2 border-border/50 shadow-2xl backdrop-blur-sm">
        <form onSubmit={handleSubmit}>
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex items-center justify-center rounded-full bg-primary/10 p-3">
              <LinkIcon className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="font-headline text-2xl">アカウント連携</CardTitle>
            <CardDescription>管理者から共有された生徒コードと連携トークンを入力してください。</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student-code">生徒コード</Label>
              <Input
                id="student-code"
                placeholder="例: @std0001"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link-token">連携トークン</Label>
              <Input
                id="link-token"
                placeholder="6桁の数字"
                value={linkToken}
                onChange={(e) => setLinkToken(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <Button type="submit" className="w-full font-bold" disabled={isSubmitting}>
              {isSubmitting ? '連携中...' : 'アカウントを連携'}
            </Button>
             <Button variant="link" className="text-sm text-muted-foreground" onClick={() => router.push('/')}>
                戻る
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
