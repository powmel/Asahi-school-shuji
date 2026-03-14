
'use client';
import {
    getFirestore,
    doc,
    collection,
    getDocs,
    getDoc,
    setDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp,
    serverTimestamp,
    runTransaction,
    writeBatch,
} from 'firebase/firestore';
import type { Student, TimeSlot, Lesson, SwapRequest, Announcement, LessonWithDetails, AppSettings, SwapRequestWithDetails } from './types';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday } from 'date-fns';
import { initializeFirebase } from '@/firebase';


// This function ensures that Firestore is initialized before we try to use it.
export const getDb = () => {
    const { firestore } = initializeFirebase();
    return firestore;
};

export const fixedTimeSlotsDefinition = [
  { startTime: '10:00', endTime: '10:50' },
  { startTime: '11:00', endTime: '11:50' },
  { startTime: '13:00', endTime: '13:50' },
  { startTime: '14:00', endTime: '14:50' },
  { startTime: '15:00', endTime: '15:50' },
];

export const getDefaultActiveDatesForMonth = (month: Date): string[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allWeekendDays = eachDayOfInterval({ start, end })
        .filter(day => isSaturday(day) || isSunday(day));
    return allWeekendDays.slice(0, 6).map(day => format(day, 'yyyy-MM-dd'));
}

// --- Helper Functions to get references ---
const getStudentRef = (studentId: string) => doc(getDb(), 'students', studentId);
const getLessonRef = (lessonId: string) => doc(getDb(), 'lessons', lessonId);
const getAnnouncementRef = (announcementId: string) => doc(getDb(), 'announcements', announcementId);
const getSwapRequestRef = (requestId: string) => doc(getDb(), 'swapRequests', requestId);

// --- Student API ---
export const getAllStudents = async (): Promise<Student[]> => {
    const q = query(collection(getDb(), 'students'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
        ...doc.data(),
        uid: doc.id,
        createdAt: (doc.data().createdAt as Timestamp)?.toDate(),
        linkTokenExpiresAt: (doc.data().linkTokenExpiresAt as Timestamp)?.toDate(),
    } as Student));
};

export const getStudentDetails = async (studentId: string): Promise<Student | undefined> => {
    const studentDoc = await getDoc(getStudentRef(studentId));
    if (studentDoc.exists()) {
        const data = studentDoc.data();
        return {
            ...data,
            uid: studentDoc.id,
            createdAt: (data.createdAt as Timestamp)?.toDate(),
            linkTokenExpiresAt: (data.linkTokenExpiresAt as Timestamp)?.toDate(),
        } as Student;
    }
    return undefined;
};

export const createStudent = async (data: Partial<Omit<Student, 'uid' | 'createdAt'>>): Promise<string> => {
    const db = getDb();
    
    try {
        const newStudentId = await runTransaction(db, async (transaction) => {
            const counterRef = doc(db, 'counters', 'studentCounter');
            const counterSnap = await transaction.get(counterRef);

            let newCount;
            if (!counterSnap.exists()) {
                newCount = 1;
                transaction.set(counterRef, { current: newCount });
            } else {
                newCount = counterSnap.data().current + 1;
                transaction.update(counterRef, { current: newCount });
            }

            const studentCode = `@std${String(newCount).padStart(4, '0')}`;
            const linkToken = Math.floor(100000 + Math.random() * 900000).toString();
            const linkTokenExpiresAt = new Date();
            linkTokenExpiresAt.setDate(linkTokenExpiresAt.getDate() + 7);

            const newStudentRef = doc(collection(db, 'students'));

            transaction.set(newStudentRef, {
                ...data,
                studentCode,
                linkToken,
                linkTokenExpiresAt: Timestamp.fromDate(linkTokenExpiresAt),
                isActive: data.isActive ?? true,
                createdAt: serverTimestamp(),
            });
            
            return newStudentRef.id;
        });

        return newStudentId;

    } catch (e) {
        console.error("Transaction failed: ", e);
        throw e;
    }
};

export const updateStudent = async (studentId: string, data: Partial<Student>): Promise<void> => {
    const { uid, studentCode, linkedUserId, ...updateData } = data;
    return await updateDoc(getStudentRef(studentId), updateData);
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    const db = getDb();
    const batch = writeBatch(db);

    batch.delete(getStudentRef(studentId));

    const lessonsQuery = query(collection(db, 'lessons'), where('studentId', '==', studentId));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    lessonsSnapshot.forEach(doc => batch.delete(doc.ref));

    const studentDoc = await getStudentDetails(studentId);
    if(studentDoc?.linkedUserId) {
        batch.delete(doc(db, 'users', studentDoc.linkedUserId));
    }
    
    return await batch.commit();
};


// --- Lesson and Slot API ---
export const getStudentUpcomingLessons = async (authUid: string): Promise<LessonWithDetails[]> => {
    const db = getDb();
    
    const userRef = doc(db, 'users', authUid);
    const userDoc = await getDoc(userRef);
    if (!userDoc.exists() || !userDoc.data().linkedStudentId) {
        return [];
    }
    const studentDocId = userDoc.data().linkedStudentId;


    const q = query(collection(getDb(), 'lessons'), where('studentId', '==', studentDocId));
    const lessonSnap = await getDocs(q);
    const lessons = lessonSnap.docs.map(doc => ({ ...doc.data(), lessonId: doc.id } as Lesson));

    const student = await getStudentDetails(studentDocId);
    if (!student) return [];

    return lessons.map(l => ({
        ...l,
        studentName: student.name,
        slotDate: l.slotId.substring(0, 10),
        slotStartTime: l.slotId.substring(11),
        slotEndTime: fixedTimeSlotsDefinition.find(fts => fts.startTime === l.slotId.substring(11))?.endTime || '',
    })).sort((a,b) => new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime());
};

export const getLessonDetails = async (lessonId: string, authUid: string): Promise<LessonWithDetails | null> => {
    const db = getDb();
    const lessonDoc = await getDoc(getLessonRef(lessonId));
    if (!lessonDoc.exists()) return null;

    const lessonData = { ...lessonDoc.data(), lessonId: lessonDoc.id } as Lesson;
    
    const userRef = doc(db, 'users', authUid);
    const userDoc = await getDoc(userRef);

    const userData = userDoc.data();
    const isAdmin = userData && userData.role === 'admin';

    if(!isAdmin && (!userDoc.exists() || !userData || userData.linkedStudentId !== lessonData.studentId)) {
        throw new Error("Permission denied.");
    }
    
    const student = await getStudentDetails(lessonData.studentId);
    if (!student) return null;

    return {
        ...lessonData,
        studentName: student.name,
        slotDate: lessonData.slotId.substring(0, 10),
        slotStartTime: lessonData.slotId.substring(11),
        slotEndTime: fixedTimeSlotsDefinition.find(fts => fts.startTime === lessonData.slotId.substring(11))?.endTime || '',
    };
};

export const countStudentLessonsInMonth = async (studentId: string, month: Date): Promise<number> => {
    const monthStr = format(month, 'yyyy-MM');
    const q = query(
        collection(getDb(), 'lessons'), 
        where('studentId', '==', studentId),
        where('status', 'in', ['approved', 'scheduled'])
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.filter(doc => doc.data().slotId.startsWith(monthStr)).length;
}

export const getSlotsForMonth = async (month: Date): Promise<TimeSlot[]> => {
    const monthStr = format(month, 'yyyy-MM');
    const lessonsQuery = query(collection(getDb(), 'lessons'), where('status', 'in', ['approved', 'scheduled']));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    const lessonsInMonth = lessonsSnapshot.docs
        .map(d => d.data() as Lesson)
        .filter(l => l.slotId.startsWith(monthStr));

    const slotsMap: Map<string, TimeSlot> = new Map();
    const settings = await getAppSettings();

    const activeDates = settings.activeDatesByMonth[monthStr] || getDefaultActiveDatesForMonth(month);

    for (const date of activeDates) {
        for (const timeDef of fixedTimeSlotsDefinition) {
            const slotId = `${date}-${timeDef.startTime}`;
            slotsMap.set(slotId, {
                slotId,
                date,
                startTime: timeDef.startTime,
                endTime: timeDef.endTime,
                capacity: settings.defaultSlotCapacity,
                assignedStudentIds: [],
            });
        }
    }
    
    lessonsInMonth.forEach(lesson => {
        let slot = slotsMap.get(lesson.slotId);
        if (slot) {
            slot.assignedStudentIds.push(lesson.studentId);
        }
    });

    return Array.from(slotsMap.values());
}

export const getSlotsForDay = async (date: string): Promise<TimeSlot[]> => {
    const lessonsQuery = query(collection(getDb(), 'lessons'), where('status', 'in', ['approved', 'scheduled']));
    const lessonsSnapshot = await getDocs(lessonsQuery);
    const lessonsOnDay = lessonsSnapshot.docs.map(d => d.data() as Lesson).filter(l => l.slotId.startsWith(date));
    
    const slotsMap: Map<string, TimeSlot> = new Map();
    const settings = await getAppSettings();
    
    fixedTimeSlotsDefinition.forEach(timeDef => {
        const slotId = `${date}-${timeDef.startTime}`;
        slotsMap.set(slotId, {
            slotId,
            date,
            startTime: timeDef.startTime,
            endTime: timeDef.endTime,
            capacity: settings.defaultSlotCapacity,
            assignedStudentIds: [],
        });
    });

    lessonsOnDay.forEach(lesson => {
        let slot = slotsMap.get(lesson.slotId);
        if (slot) {
            slot.assignedStudentIds.push(lesson.studentId);
        }
    });

    return Array.from(slotsMap.values()).sort((a,b) => a.startTime.localeCompare(b.startTime));
};

export const updateSlotAssignments = async (slotId: string, studentIds: string[]): Promise<void> => {
    const db = getDb();
    
    await runTransaction(db, async (transaction) => {
        const lessonsQuery = query(collection(db, 'lessons'), where('slotId', '==', slotId), where('status', 'in', ['approved', 'scheduled']));
        const currentLessonsSnap = await getDocs(lessonsQuery);
        
        const currentStudentIds = new Set(currentLessonsSnap.docs.map(doc => doc.data().studentId));
        const newStudentIds = new Set(studentIds);

        // Students to remove
        for (const doc of currentLessonsSnap.docs) {
            const studentId = doc.data().studentId;
            if (!newStudentIds.has(studentId)) {
                transaction.delete(doc.ref);
            }
        }

        // Students to add
        for (const studentId of newStudentIds) {
            if (!currentStudentIds.has(studentId)) {
                const newLessonRef = doc(collection(db, 'lessons'));
                transaction.set(newLessonRef, {
                    studentId,
                    slotId,
                    status: 'approved',
                    priority: 'normal',
                    updatedAt: serverTimestamp(),
                    createdBy: 'teacher',
                    source: 'manual',
                });
            }
        }
    });
};

// --- Announcement API ---
export const getPublishedAnnouncements = async (): Promise<Announcement[]> => {
    const q = query(collection(getDb(), 'announcements'), where('published', '==', true));
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id, createdAt: (doc.data().createdAt as Timestamp).toDate() } as Announcement))
        .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const getAllAnnouncements = async (): Promise<Announcement[]> => {
    const snapshot = await getDocs(collection(getDb(), 'announcements'));
    return snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id, createdAt: (doc.data().createdAt as Timestamp).toDate() } as Announcement))
        .sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime());
};

export const saveAnnouncement = async (announcement: Partial<Announcement>): Promise<void> => {
    if (announcement.id) {
        const { id, ...data } = announcement;
        await updateDoc(getAnnouncementRef(id), { ...data, updatedAt: serverTimestamp() });
    } else {
        await addDoc(collection(getDb(), 'announcements'), { ...announcement, createdAt: serverTimestamp() });
    }
};

// --- Swap Request API ---
export const createSwapRequest = async (request: Omit<SwapRequest, 'requestId' | 'createdAt' | 'status'>): Promise<void> => {
    const db = getDb();
    const batch = writeBatch(db);

    const newRequestRef = doc(collection(db, 'swapRequests'));
    batch.set(newRequestRef, { ...request, status: 'pending', createdAt: serverTimestamp() });
    
    const lessonRef = getLessonRef(request.fromLessonId);
    batch.update(lessonRef, { status: 'swap_pending' });

    await batch.commit();
};

export const getAllSwapRequests = async (): Promise<SwapRequestWithDetails[]> => {
    const db = getDb();
    const snapshot = await getDocs(collection(db, 'swapRequests'));
    const requests = snapshot.docs.map(doc => ({ ...doc.data(), requestId: doc.id, createdAt: (doc.data().createdAt as Timestamp).toDate() } as SwapRequest));
    
    const detailedRequests: SwapRequestWithDetails[] = [];
    for(const req of requests) {
        const user = { uid: 'admin' };
        const lesson = await getLessonDetails(req.fromLessonId, user.uid); 
        const student = await getStudentDetails(req.studentId);
        if(student && lesson) {
            detailedRequests.push({ ...req, studentName: student.name, fromLesson: lesson });
        }
    }
    return detailedRequests;
};

export const updateSwapRequestStatus = async (requestId: string, status: 'approved' | 'rejected'): Promise<void> => {
    const db = getDb();
    const batch = writeBatch(db);
    const reqRef = getSwapRequestRef(requestId);

    batch.update(reqRef, { status });

    const requestSnap = await getDoc(reqRef);
    if(!requestSnap.exists()) throw new Error("Swap request not found");
    const request = requestSnap.data() as SwapRequest;

    if(status === 'approved') {
        batch.update(getLessonRef(request.fromLessonId), { status: 'swapped' });
    } else if (status === 'rejected') {
        batch.update(getLessonRef(request.fromLessonId), { status: 'scheduled' });
    }

    await batch.commit();
};


// --- App Settings ---
export const getAppSettings = async (): Promise<AppSettings> => {
    const docRef = doc(getDb(), 'settings', 'app');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as AppSettings;
    }
    return {
        defaultSlotCapacity: 4,
        activeDatesByMonth: {},
    };
};

export const updateAppSettings = async (newSettings: Partial<AppSettings>): Promise<void> => {
    const docRef = doc(getDb(), 'settings', 'app');
    await setDoc(docRef, newSettings, { merge: true });
};

// --- Lesson Move API (Student Self-Service) ---

export const moveLessonToSlotWithToken = async (
    lessonId: string,
    targetSlotId: string,
    idToken: string
): Promise<void> => {
    const response = await fetch('/api/move-lesson', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ lessonId, targetSlotId }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || 'レッスンの移動に失敗しました。');
    }
};

export const getAvailableSlotsForMove = async (
    excludeSlotId: string,
    month: Date,
    idToken: string
): Promise<Array<TimeSlot & { availableSeats: number }>> => {
    const monthStr = format(month, 'yyyy-MM');
    
    const response = await fetch('/api/available-slots', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${idToken}`,
        },
        body: JSON.stringify({ excludeSlotId, month: monthStr }),
    });

    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.error || '空きスロットの取得に失敗しました。');
    }

    return data;
};
