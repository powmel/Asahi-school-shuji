// This file mocks data and API calls to a Firestore database.
// In a real application, you would replace this with actual Firebase SDK calls.

import { Student, TimeSlot, Lesson, SwapRequest, Announcement, LessonWithDetails } from './types';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, set } from 'date-fns';

const ADMIN_UID = 'admin@example.com';

const students: Student[] = [
  { uid: 'student1', name: '田中 恵子', course: '2perMonth', email: 'student1@example.com', createdAt: new Date('2023-01-10') },
  { uid: 'student2', name: '佐藤 太郎', course: '3perMonth', email: 'student2@example.com', createdAt: new Date('2023-01-15') },
  { uid: 'student3', name: '鈴木 花子', course: '2perMonth', email: 'student3@example.com', createdAt: new Date('2023-02-01') },
  { uid: 'student4', name: '高橋 健太', course: '3perMonth', email: 'student4@example.com', createdAt: new Date('2023-02-20') },
  { uid: 'student5', name: '伊藤 さくら', course: '2perMonth', email: 'student5@example.com', createdAt: new Date('2023-03-05') },
];

const fixedTimeSlots = [
  { startTime: '10:00', endTime: '10:50' },
  { startTime: '11:00', endTime: '11:50' },
  { startTime: '13:00', endTime: '13:50' },
  { startTime: '14:00', endTime: '14:50' },
  { startTime: '15:00', endTime: '15:50' },
];

// Generate slots and lessons for the current and next month
const generateInitialData = () => {
  let slots: TimeSlot[] = [];
  let lessons: Lesson[] = [];
  const today = new Date();
  const monthsToGenerate = [today, addMonths(today, 1)];

  monthsToGenerate.forEach(month => {
    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
    const weekendDays = days.filter(day => isSaturday(day) || isSunday(day));

    weekendDays.forEach(day => {
      fixedTimeSlots.forEach(time => {
        const slotId = `${format(day, 'yyyy-MM-dd')}-${time.startTime}`;
        const studentCount = Math.floor(Math.random() * 3); // 0 to 2 students
        const assignedStudentIds = students.slice(0, studentCount).map(s => s.uid);
        
        slots.push({
          slotId: slotId,
          date: format(day, 'yyyy-MM-dd'),
          startTime: time.startTime,
          endTime: time.endTime,
          capacity: 4,
          assignedStudentIds: assignedStudentIds,
        });

        assignedStudentIds.forEach(studentId => {
          lessons.push({
            lessonId: `lesson-${studentId}-${slotId}`,
            studentId: studentId,
            slotId: slotId,
            status: 'scheduled',
            updatedAt: day,
          });
        });
      });
    });
  });

  return { slots, lessons };
};

const initialData = generateInitialData();
let slots: TimeSlot[] = initialData.slots;
let lessons: Lesson[] = initialData.lessons;

let announcements: Announcement[] = [
  { id: 'anno1', title: '【重要】教室移転のお知らせ', body: '来月より、教室が新しい場所に移転します。詳細は別途メールにてご連絡いたします。', published: true, createdAt: new Date('2023-04-01') },
  { id: 'anno2', title: '夏期講習の申し込み開始', body: '夏期講習の申し込みを開始しました。ご希望の方はお早めにお申し込みください。', published: true, createdAt: new Date('2023-03-15') },
  { id: 'anno3', title: '新しい筆の入荷', body: '新しい種類の筆を入荷しました。ぜひお試しください。', published: true, createdAt: new Date('2023-03-01') },
  { id: 'anno4', title: '年末年始の休講日（下書き）', body: '年末年始は12月28日から1月4日まで休講となります。', published: false, createdAt: new Date('2023-02-15') },
];

let swapRequests: SwapRequest[] = [
  {
    requestId: 'swap1',
    studentId: 'student1',
    fromLessonId: lessons.find(l => l.studentId === 'student1')?.lessonId || '',
    preferredDates: ['2024-08-10', '2024-08-17'],
    note: '学校行事のため、振替をお願いします。',
    status: 'pending',
    createdAt: new Date(),
  },
];


// Mock API functions
const FAKE_DELAY = 500;

const findSlot = (slotId: string) => slots.find(s => s.slotId === slotId);
const findStudent = (studentId: string) => students.find(s => s.uid === studentId);
const findLesson = (lessonId: string) => lessons.find(l => l.lessonId === lessonId);

const toLessonWithDetails = (lesson: Lesson): LessonWithDetails | null => {
  const slot = findSlot(lesson.slotId);
  const student = findStudent(lesson.studentId);
  if (!slot || !student) return null;
  return {
    ...lesson,
    studentName: student.name,
    slotDate: slot.date,
    slotStartTime: slot.startTime,
    slotEndTime: slot.endTime,
  }
}

export const getStudentUpcomingLessons = async (studentId: string): Promise<LessonWithDetails[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const studentLessons = lessons
        .filter(l => l.studentId === studentId && new Date(findSlot(l.slotId)?.date || 0) >= new Date())
        .map(toLessonWithDetails)
        .filter((l): l is LessonWithDetails => l !== null)
        .sort((a, b) => new Date(a.slotDate).getTime() - new Date(b.slotDate).getTime());
      resolve(studentLessons);
    }, FAKE_DELAY);
  });
};

export const getLessonDetails = async (lessonId: string, studentId: string): Promise<LessonWithDetails | null> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const lesson = findLesson(lessonId);
            if (!lesson || lesson.studentId !== studentId) {
                reject(new Error("Lesson not found or access denied."));
                return;
            }
            const details = toLessonWithDetails(lesson);
            if (details) {
                resolve(details);
            } else {
                reject(new Error("Could not retrieve lesson details."));
            }
        }, FAKE_DELAY);
    });
};


export const getPublishedAnnouncements = async (): Promise<Announcement[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(announcements.filter(a => a.published).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()));
    }, FAKE_DELAY);
  });
};

// --- Admin Functions ---

export const getAllStudents = async (): Promise<Student[]> => {
    return new Promise(resolve => setTimeout(() => resolve(students), FAKE_DELAY));
}

export const getSlotsForMonth = async (month: Date): Promise<TimeSlot[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const monthStr = format(month, 'yyyy-MM');
            resolve(slots.filter(s => s.date.startsWith(monthStr)));
        }, FAKE_DELAY);
    });
}

export const updateSlotAssignments = async (slotId: string, studentIds: string[]): Promise<TimeSlot> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const slotIndex = slots.findIndex(s => s.slotId === slotId);
            if (slotIndex === -1) return reject(new Error("Slot not found"));
            
            const slot = slots[slotIndex];
            if (studentIds.length > slot.capacity) return reject(new Error("Capacity exceeded"));

            const oldStudentIds = new Set(slot.assignedStudentIds);
            const newStudentIds = new Set(studentIds);

            // Remove lessons for students who are no longer in the slot
            oldStudentIds.forEach(studentId => {
                if (!newStudentIds.has(studentId)) {
                    lessons = lessons.filter(l => !(l.slotId === slotId && l.studentId === studentId));
                }
            });

            // Add lessons for new students
            newStudentIds.forEach(studentId => {
                if (!oldStudentIds.has(studentId)) {
                    lessons.push({
                        lessonId: `lesson-${studentId}-${slotId}`,
                        studentId: studentId,
                        slotId: slotId,
                        status: 'scheduled',
                        updatedAt: new Date(),
                    });
                }
            });

            slots[slotIndex].assignedStudentIds = studentIds;
            resolve(slots[slotIndex]);
        }, FAKE_DELAY);
    });
};


export const getAllAnnouncements = async (): Promise<Announcement[]> => {
    return new Promise(resolve => setTimeout(() => resolve(announcements.sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())), FAKE_DELAY));
}

export const saveAnnouncement = async (announcement: Partial<Announcement>): Promise<Announcement> => {
    return new Promise(resolve => {
        setTimeout(() => {
            if (announcement.id) {
                const index = announcements.findIndex(a => a.id === announcement.id);
                if (index !== -1) {
                    announcements[index] = { ...announcements[index], ...announcement };
                    resolve(announcements[index]);
                }
            } else {
                const newAnnouncement: Announcement = {
                    id: `anno${announcements.length + 1}`,
                    title: '',
                    body: '',
                    published: false,
                    createdAt: new Date(),
                    ...announcement
                };
                announcements.unshift(newAnnouncement);
                resolve(newAnnouncement);
            }
        }, FAKE_DELAY)
    });
}

export const getAllSwapRequests = async () => {
     return new Promise(resolve => {
        setTimeout(() => {
            const detailedRequests = swapRequests.map(req => {
                const fromLesson = lessons.find(l => l.lessonId === req.fromLessonId);
                if (!fromLesson) return null;

                const lessonDetails = toLessonWithDetails(fromLesson);
                if (!lessonDetails) return null;

                return {
                    ...req,
                    studentName: lessonDetails.studentName,
                    fromLesson: lessonDetails,
                }
            }).filter(Boolean);
            resolve(detailedRequests);
        }, FAKE_DELAY);
     });
}

export const updateSwapRequestStatus = async (requestId: string, status: 'approved' | 'rejected'): Promise<SwapRequest> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = swapRequests.findIndex(r => r.requestId === requestId);
            if (index === -1) return reject(new Error("Request not found"));
            swapRequests[index].status = status;
            
            // If approved, also update the original lesson status
            if (status === 'approved') {
                const lessonId = swapRequests[index].fromLessonId;
                const lessonIndex = lessons.findIndex(l => l.lessonId === lessonId);
                if (lessonIndex !== -1) {
                    lessons[lessonIndex].status = 'swapped';
                }
            }

            resolve(swapRequests[index]);
        }, FAKE_DELAY);
    });
};

export const createSwapRequest = async (request: Omit<SwapRequest, 'requestId' | 'createdAt' | 'status'>): Promise<SwapRequest> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const newRequest: SwapRequest = {
                ...request,
                requestId: `swap${swapRequests.length + 1}`,
                createdAt: new Date(),
                status: 'pending'
            };
            swapRequests.push(newRequest);

            const lessonIndex = lessons.findIndex(l => l.lessonId === request.fromLessonId);
            if (lessonIndex !== -1) {
                lessons[lessonIndex].status = 'swap_pending';
            }

            resolve(newRequest);
        }, FAKE_DELAY);
    });
};
