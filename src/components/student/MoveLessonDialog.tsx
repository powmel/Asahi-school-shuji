"use client";

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/shared/Loading';
import { getAvailableSlotsForMove, moveLessonToSlotWithToken } from '@/lib/data';
import type { TimeSlot } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';

type SlotWithAvailability = TimeSlot & { availableSeats: number };

interface MoveLessonDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    lessonId: string;
    currentSlotId: string;
    onMoveSuccess: () => void;
}

export function MoveLessonDialog({
    open,
    onOpenChange,
    lessonId,
    currentSlotId,
    onMoveSuccess,
}: MoveLessonDialogProps) {
    const { user } = useUser();
    const { toast } = useToast();
    const [slots, setSlots] = useState<SlotWithAvailability[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [moving, setMoving] = useState(false);

    useEffect(() => {
        if (open && currentSlotId && user) {
            setLoading(true);
            setSelectedSlotId(null);
            const currentDate = parseISO(currentSlotId.substring(0, 10));
            user.getIdToken()
                .then(idToken => getAvailableSlotsForMove(currentSlotId, currentDate, idToken))
                .then(data => {
                    setSlots(data);
                    setLoading(false);
                })
                .catch(err => {
                    toast({
                        title: 'エラー',
                        description: err.message || '空きスロットの取得に失敗しました。',
                        variant: 'destructive',
                    });
                    setLoading(false);
                });
        }
    }, [open, currentSlotId, user, toast]);

    const handleMove = async () => {
        if (!selectedSlotId || !user) return;
        
        setMoving(true);
        try {
            const idToken = await user.getIdToken();
            await moveLessonToSlotWithToken(lessonId, selectedSlotId, idToken);
            toast({
                title: '移動完了',
                description: 'レッスンを移動しました。',
            });
            onMoveSuccess();
            onOpenChange(false);
        } catch (err: any) {
            toast({
                title: '移動エラー',
                description: err.message || 'レッスンの移動に失敗しました。',
                variant: 'destructive',
            });
        } finally {
            setMoving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>レッスンを移動</DialogTitle>
                    <DialogDescription>
                        移動先の時間帯を選択してください。
                    </DialogDescription>
                </DialogHeader>
                
                {loading ? (
                    <Loading />
                ) : (
                    <div className="space-y-2 py-4">
                        {slots.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">
                                移動可能な時間帯が見つかりません。
                            </p>
                        ) : (
                            slots.map(slot => (
                                <button
                                    key={slot.slotId}
                                    onClick={() => setSelectedSlotId(slot.slotId)}
                                    className={`w-full p-4 border rounded-lg text-left transition-colors ${
                                        selectedSlotId === slot.slotId
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-muted'
                                    }`}
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <div className="font-semibold">
                                                {format(parseISO(slot.date), 'M月d日(E)', { locale: ja })}
                                            </div>
                                            <div className="text-sm text-muted-foreground">
                                                {slot.startTime} - {slot.endTime}
                                            </div>
                                        </div>
                                        <div className="text-sm">
                                            残席: {slot.availableSeats} / {slot.capacity}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                )}
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={moving}>
                        キャンセル
                    </Button>
                    <Button onClick={handleMove} disabled={!selectedSlotId || moving}>
                        {moving ? '移動中...' : '移動する'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
