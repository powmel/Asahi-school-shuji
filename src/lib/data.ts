// This file mocks data and API calls to a Firestore database.
// In a real application, you would replace this with actual Firebase SDK calls.

import { Student, TimeSlot, Lesson, SwapRequest, Announcement, LessonWithDetails } from './types';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, getMonth, getYear } from 'date-fns';

const ADMIN_UID = 'admin@example.com';

const students: Student[] = [
  { uid: 'student1', name: '田中 恵子', course: '2perMonth', email: 'student1@example.com', createdAt: new Date('2023-01-10'), grade: '小3', age: 9, gender: 'female', displayTag: '小3/9歳/女' },
  { uid: 'student2', name: '佐藤 太郎', course: '3perMonth', email: 'student2@example.com', createdAt: new Date('2023-01-15'), grade: '中1', age: 13, gender: 'male', displayTag: '中1/13歳/男' },
  { uid: 'student3', name: '鈴木 花子', course: '2perMonth', email: 'student3@example.com', createdAt: new Date('2023-02-01'), grade: '高2', age: 17, gender: 'female', displayTag: '高2/17歳/女' },
  { uid: 'student4', name: '高橋 健太', course: '3perMonth', email: 'student4@example.com', createdAt: new Date('2023-02-20'), grade: '大人', age: 35, gender: 'male', displayTag: '大人' },
  { uid: 'student5', name: '伊藤 さくら', course: '2perMonth', email: 'student5@example.com', createdAt: new Date('2023-03-05'), grade: '小5', age: 11, gender: 'female', displayTag: '小5/11歳/女'  },
];

export const fixedTimeSlotsDefinition = [
  { startTime: '10:00', endTime: '10:50' },
  { startTime: '11:00', endTime: '11:50' },
  { startTime: '13:00', endTime: '13:50' },
  { startTime: '14:00', endTime: '14:50' },
  { startTime: '15:00', endTime: '15:50' },
];

const DEFAULT_SLOT_CAPACITY = 4;

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
      fixedTimeSlotsDefinition.forEach(time => {
        const slotId = `${format(day, 'yyyy-MM-dd')}-${time.startTime}`;
        
        let assignedStudentIds: string[] = [];
        // Make some slots full, some partial, some empty
        const studentCountFactor = Math.random();
        if (studentCountFactor > 0.7) { // Full
          assignedStudentIds = ['student1', 'student2', 'student3', 'student4'].slice(0, DEFAULT_SLOT_CAPACITY);
        } else if (studentCountFactor > 0.3) { // Partial
          const studentCount = Math.floor(Math.random() * (DEFAULT_SLOT_CAPACITY -1)) + 1;
          assignedStudentIds = students.slice(0, studentCount).map(s => s.uid);
        }
        
        slots.push({
          slotId: slotId,
          date: format(day, 'yyyy-MM-dd'),
          startTime: time.startTime,
          endTime: time.endTime,
          capacity: DEFAULT_SLOT_CAPACITY,
          assignedStudentIds: assignedStudentIds,
        });

        assignedStudentIds.forEach(studentId => {
          lessons.push({
            lessonId: `lesson-${studentId}-${slotId}`,
            studentId: studentId,
            slotId: slotId,
            status: 'approved', // Use 'approved' for counting
            priority: 'normal',
            updatedAt: day,
          });
        });
      });
    });
  });

  // Ensure some students are near/over their limits for demo
  const currentMonth = getMonth(today);
  const currentYear = getYear(today);
  const student2Lessons = lessons.filter(l => l.studentId === 'student2' && getMonth(new Date(slots.find(s=>s.slotId === l.slotId)!.date)) === currentMonth && getYear(new Date(slots.find(s=>s.slotId === l.slotId)!.date)) === currentYear);
  if (student2Lessons.length < 4) {
      const availableSlot = slots.find(s => s.assignedStudentIds.length < s.capacity && !s.assignedStudentIds.includes('student2') && getMonth(new Date(s.date)) === currentMonth && getYear(new Date(s.date)) === currentYear);
      if(availableSlot) {
          availableSlot.assignedStudentIds.push('student2');
          lessons.push({
            lessonId: `lesson-student2-${availableSlot.slotId}`,
            studentId: 'student2',
            slotId: availableSlot.slotId,
            status: 'approved',
            priority: 'normal',
            updatedAt: new Date(),
          });
      }
  }


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

export const getSlotsForDay = async (date: string): Promise<TimeSlot[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(slots.filter(s => s.date === date).sort((a,b) => a.startTime.localeCompare(b.startTime)));
        }, FAKE_DELAY);
    });
}

export const getStudentDetails = async (studentId: string): Promise<Student | undefined> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(findStudent(studentId));
        }, FAKE_DELAY);
    });
};

export const countStudentLessonsInMonth = async (studentId: string, month: Date): Promise<number> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const monthStr = format(month, 'yyyy-MM');
            const count = lessons.filter(l => {
                const slot = findSlot(l.slotId);
                return l.studentId === studentId &&
                       l.status === 'approved' &&
                       slot &&
                       slot.date.startsWith(monthStr);
            }).length;
            resolve(count);
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
                        status: 'approved',
                        priority: 'normal',
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
