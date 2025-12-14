
// This file mocks data and API calls to a Firestore database.
// In a real application, you would replace this with actual Firebase SDK calls.

import { Student, TimeSlot, Lesson, SwapRequest, Announcement, LessonWithDetails, AppSettings, SwapRequestWithDetails } from './types';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, getMonth, getYear, getDate, getDay } from 'date-fns';

const ADMIN_UID = 'admin@example.com';

let students: Student[] = [
  { uid: 'student1', name: '田中 恵子', course: '2perMonth', email: 'student1@example.com', createdAt: new Date('2023-01-10'), grade: '小3', age: 9, gender: 'female', displayTag: '小3/9歳/女', isActive: true, notes: 'アレルギーあり' },
  { uid: 'student2', name: '佐藤 太郎', course: '3perMonth', email: 'student2@example.com', createdAt: new Date('2023-01-15'), grade: '中1', age: 13, gender: 'male', displayTag: '中1/13歳/男', isActive: true },
  { uid: 'student3', name: '鈴木 花子', course: '2perMonth', email: 'student3@example.com', createdAt: new Date('2023-02-01'), grade: '高2', age: 17, gender: 'female', displayTag: '高2/17歳/女', isActive: true },
  { uid: 'student4', name: '高橋 健太', course: '3perMonth', email: 'student4@example.com', createdAt: new Date('2023-02-20'), grade: '大人', age: 35, gender: 'male', displayTag: '大人', isActive: true },
  { uid: 'student5', name: '伊藤 さくら', course: '2perMonth', email: 'student5@example.com', createdAt: new Date('2023-03-05'), grade: '小5', age: 11, gender: 'female', displayTag: '小5/11歳/女', isActive: true, notes: '左利き' },
  { uid: 'student6', name: '渡辺 翔太', course: '3perMonth', email: 'student6@example.com', createdAt: new Date('2023-04-10'), grade: '小6', age: 12, gender: 'male', displayTag: '小6/12歳/男', isActive: true },
  { uid: 'student7', name: '山本 美咲', course: '2perMonth', email: 'student7@example.com', createdAt: new Date('2023-05-12'), grade: '中2', age: 14, gender: 'female', displayTag: '中2/14歳/女', isActive: true },
  { uid: 'student8', name: '中村 蓮', course: '3perMonth', email: 'student8@example.com', createdAt: new Date('2023-06-18'), grade: '大人', age: 42, gender: 'male', displayTag: '大人', isActive: true },
  { uid: 'student9', name: '小林 杏', course: '2perMonth', email: 'student9@example.com', createdAt: new Date('2023-07-22'), grade: '小2', age: 8, gender: 'female', displayTag: '小2/8歳/女', isActive: true },
  { uid: 'student10', name: '加藤 陽菜', course: '3perMonth', email: 'student10@example.com', createdAt: new Date('2023-08-30'), grade: '小4', age: 10, gender: 'female', displayTag: '小4/10歳/女', isActive: true },
  { uid: 'student11', name: '吉田 湊', course: '2perMonth', email: 'student11@example.com', createdAt: new Date('2023-09-05'), grade: '中3', age: 15, gender: 'male', displayTag: '中3/15歳/男', isActive: true },
  { uid: 'student12', name: '山田 結衣', course: '3perMonth', email: 'student12@example.com', createdAt: new Date('2023-10-10'), grade: '高1', age: 16, gender: 'female', displayTag: '高1/16歳/女', isActive: true },
  { uid: 'student13', name: '佐々木 陸', course: '2perMonth', email: 'student13@example.com', createdAt: new Date('2023-11-15'), grade: '大人', age: 28, gender: 'male', displayTag: '大人', isActive: true },
  { uid: 'student14', name: '山口 莉子', course: '3perMonth', email: 'student14@example.com', createdAt: new Date('2023-12-20'), grade: '小1', age: 7, gender: 'female', displayTag: '小1/7歳/女', isActive: true },
  { uid: 'student15', name: '松本 悠人', course: '2perMonth', email: 'student15@example.com', createdAt: new Date('2024-01-25'), grade: '小6', age: 12, gender: 'male', displayTag: '小6/12歳/男', isActive: true },
  { uid: 'student16', name: '井上 楓', course: '3perMonth', email: 'student16@example.com', createdAt: new Date('2024-02-10'), grade: '中2', age: 14, gender: 'female', displayTag: '中2/14歳/女', isActive: true },
  { uid: 'student17', name: '木村 拓海', course: '2perMonth', email: 'student17@example.com', createdAt: new Date('2024-03-18'), grade: '大人', age: 55, gender: 'male', displayTag: '大人', isActive: true, notes: '体験レッスン希望' },
  { uid: 'student18', name: '林 芽衣', course: '3perMonth', email: 'student18@example.com', createdAt: new Date('2024-04-02'), grade: '小3', age: 9, gender: 'female', displayTag: '小3/9歳/女', isActive: true },
  { uid: 'student19', name: '斎藤 蒼', course: '2perMonth', email: 'student19@example.com', createdAt: new Date('2024-05-09'), grade: '高3', age: 18, gender: 'male', displayTag: '高3/18歳/男', isActive: true },
  { uid: 'student20', name: '橋本 凛', course: '3perMonth', email: 'student20@example.com', createdAt: new Date('2024-06-21'), grade: '中1', age: 13, gender: 'female', displayTag: '中1/13歳/女', isActive: false },
];


export const fixedTimeSlotsDefinition = [
  { startTime: '10:00', endTime: '10:50' },
  { startTime: '11:00', endTime: '11:50' },
  { startTime: '13:00', endTime: '13:50' },
  { startTime: '14:00', endTime: '14:50' },
  { startTime: '15:00', endTime: '15:50' },
];

let appSettings: AppSettings = {
    defaultSlotCapacity: 4,
    defaultActiveWeekendWeeks: ['week1', 'week2', 'week3'],
    activeWeekendWeeksByMonth: {
        // Example override for a specific month
        // "2024-08": ["week2", "week3", "week4"]
    }
};

/**
 * Returns the week number of a date within its month.
 * Assumes weeks start on Sunday.
 * The first week is the one containing the 1st of the month.
 * @param date The date to check.
 * @returns The week number (1-5).
 */
export const getWeekOfMonth = (date: Date): `week${1|2|3|4|5}` => {
    const dayOfMonth = getDate(date);
    const dayOfWeek = getDay(date);
    // This calculation is a bit tricky. It finds the "day number" of the first day of the week,
    // then calculates the week number.
    const firstDayOfMonth = new Date(getYear(date), getMonth(date), 1);
    const week = Math.ceil((dayOfMonth + firstDayOfMonth.getDay()) / 7);
    return `week${week}` as `week${1|2|3|4|5}`;
};


// Generate slots and lessons for the current and next month
const generateInitialData = () => {
  let slots: TimeSlot[] = [];
  let lessons: Lesson[] = [];
  const today = new Date();
  const monthsToGenerate = [today, addMonths(today, 1), addMonths(today, 2)];

  monthsToGenerate.forEach(month => {
    const monthKey = format(month, 'yyyy-MM');
    const activeWeeks = appSettings.activeWeekendWeeksByMonth[monthKey] || appSettings.defaultActiveWeekendWeeks;

    const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) });
    const weekendDays = days.filter(day => {
        const isWeekend = isSaturday(day) || isSunday(day);
        if (!isWeekend) return false;
        const weekOfMonth = getWeekOfMonth(day);
        return activeWeeks.includes(weekOfMonth);
    });

    weekendDays.forEach(day => {
      fixedTimeSlotsDefinition.forEach(time => {
        const slotId = `${format(day, 'yyyy-MM-dd')}-${time.startTime}`;
        const assignedStudentIds: string[] = [];

        slots.push({
          slotId: slotId,
          date: format(day, 'yyyy-MM-dd'),
          startTime: time.startTime,
          endTime: time.endTime,
          capacity: appSettings.defaultSlotCapacity,
          assignedStudentIds: assignedStudentIds,
        });
      });
    });
  });

  // Seed bookings for current month
  const currentMonthSlots = slots.filter(s => s.date.startsWith(format(today, 'yyyy-MM')));
  if (currentMonthSlots.length > 0) {
      // student2 (3perMonth) -> 4 lessons (over limit)
      for (let i = 0; i < 4; i++) {
        const slot = currentMonthSlots[i*2];
        if (slot && !slot.assignedStudentIds.includes('student2')) {
          slot.assignedStudentIds.push('student2');
          lessons.push({ lessonId: `lesson-student2-${slot.slotId}`, studentId: 'student2', slotId: slot.slotId, status: 'approved', priority: 'normal', updatedAt: new Date() });
        }
      }
      // student1 (2perMonth) -> 2 lessons (at limit)
       for (let i = 0; i < 2; i++) {
        const slot = currentMonthSlots[i*3];
        if (slot && !slot.assignedStudentIds.includes('student1')) {
          slot.assignedStudentIds.push('student1');
          lessons.push({ lessonId: `lesson-student1-${slot.slotId}`, studentId: 'student1', slotId: slot.slotId, status: 'approved', priority: 'normal', updatedAt: new Date() });
        }
      }
       // student3 (2perMonth) -> 1 lesson (under limit)
      const slotForS3 = currentMonthSlots[5];
      if (slotForS3 && !slotForS3.assignedStudentIds.includes('student3')) {
          slotForS3.assignedStudentIds.push('student3');
          lessons.push({ lessonId: `lesson-student3-${slotForS3.slotId}`, studentId: 'student3', slotId: slotForS3.slotId, status: 'approved', priority: 'normal', updatedAt: new Date() });
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

export const getAppSettings = async (): Promise<AppSettings> => {
    return new Promise(resolve => setTimeout(() => resolve(appSettings), FAKE_DELAY / 2));
}

export const updateAppSettings = async (newSettings: Partial<AppSettings>): Promise<AppSettings> => {
    return new Promise(resolve => {
        setTimeout(() => {
            appSettings = { ...appSettings, ...newSettings };
            resolve(appSettings);
        }, FAKE_DELAY);
    });
}

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

export const updateStudent = async (studentId: string, data: Partial<Student>): Promise<Student> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = students.findIndex(s => s.uid === studentId);
            if (index !== -1) {
                students[index] = { ...students[index], ...data };
                resolve(students[index]);
            } else {
                reject(new Error("Student not found."));
            }
        }, FAKE_DELAY);
    });
};

export const deleteStudent = async (studentId: string): Promise<void> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const initialLength = students.length;
            students = students.filter(s => s.uid !== studentId);
            if (students.length < initialLength) {
                // Also remove their lessons
                lessons = lessons.filter(l => l.studentId !== studentId);
                // And remove from slots
                slots.forEach(slot => {
                    slot.assignedStudentIds = slot.assignedStudentIds.filter(id => id !== studentId);
                });
                resolve();
            } else {
                reject(new Error("Student not found."));
            }
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
                       (l.status === 'approved' || l.status === 'scheduled') &&
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

export const getAllSwapRequests = async (): Promise<SwapRequestWithDetails[]> => {
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
            }).filter((r): r is SwapRequestWithDetails => r !== null);
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

    