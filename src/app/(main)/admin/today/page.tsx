
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, isSaturday, isSunday, addDays } from 'date-fns';
import { Loading } from '@/components/shared/Loading';
import { getAppSettings, getDefaultActiveDatesForMonth } from '@/lib/data';

/**
 * 「本日の運営」への自動リダイレクトページ
 * 今日が授業日（設定された開講日または週末）なら今日を表示し、
 * そうでなければ「次の授業日」を自動的に探して表示します。
 */
export default function AdminTodayPage() {
  const router = useRouter();

  useEffect(() => {
    async function redirectToClosestDay() {
      try {
        const today = new Date();
        const settings = await getAppSettings();
        
        let targetDate = today;
        let found = false;
        
        // 最大31日先まで授業日を探す
        for (let i = 0; i < 31; i++) {
          const checkDate = addDays(today, i);
          const dateStr = format(checkDate, 'yyyy-MM-dd');
          const monthKey = format(checkDate, 'yyyy-MM');
          
          const activeDates = settings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(checkDate);
          
          if (activeDates.includes(dateStr)) {
            targetDate = checkDate;
            found = true;
            break;
          }
        }
        
        router.replace(`/admin/day/${format(targetDate, 'yyyy-MM-dd')}`);
      } catch (error) {
        // エラー時はとりあえず今日の日付でリダイレクト
        router.replace(`/admin/day/${format(new Date(), 'yyyy-MM-dd')}`);
      }
    }

    redirectToClosestDay();
  }, [router]);

  return <Loading />;
}
