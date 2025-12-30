

// This file mocks data and API calls to a Firestore database.
// In a real application, you would replace this with actual Firebase SDK calls.

import { Student, TimeSlot, Lesson, SwapRequest, Announcement, LessonWithDetails, AppSettings, SwapRequestWithDetails } from './types';
import { addMonths, format, startOfMonth, endOfMonth, eachDayOfInterval, isSaturday, isSunday, parseISO } from 'date-fns';

const ADMIN_UID = 'admin@example.com';

let students: Student[] = [
    // 20 students with realistic data
    { uid: 'student1', name: '田中 恵子', course: '2perMonth', email: 'student1@example.com', createdAt: new Date('2023-01-10'), grade: '小3', age: 9, gender: 'female', displayTag: '小3/9歳/女', isActive: true, notes: 'アレルギーあり', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student2', name: '佐藤 太郎', course: '3perMonth', email: 'student2@example.com', createdAt: new Date('2023-01-15'), grade: '中1', age: 13, gender: 'male', displayTag: '中1/13歳/男', isActive: true, notes: '', preferredSlot: { enabled: true, dow: 'sat', slotKey: '10:00' } },
    { uid: 'student3', name: '鈴木 花子', course: '2perMonth', email: 'student3@example.com', createdAt: new Date('2023-02-01'), grade: '高2', age: 17, gender: 'female', displayTag: '高2/17歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student4', name: '高橋 健太', course: '3perMonth', email: 'student4@example.com', createdAt: new Date('2023-02-20'), grade: '大人', age: 35, gender: 'male', displayTag: '大人', isActive: true, notes: '', preferredSlot: { enabled: true, dow: 'sun', slotKey: '11:00' } },
    { uid: 'student5', name: '伊藤 さくら', course: '2perMonth', email: 'student5@example.com', createdAt: new Date('2023-03-05'), grade: '小5', age: 11, gender: 'female', displayTag: '小5/11歳/女', isActive: true, notes: '左利き', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student6', name: '渡辺 翔太', course: '3perMonth', email: 'student6@example.com', createdAt: new Date('2023-04-10'), grade: '小6', age: 12, gender: 'male', displayTag: '小6/12歳/男', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student7', name: '山本 美咲', course: '2perMonth', email: 'student7@example.com', createdAt: new Date('2023-05-12'), grade: '中2', age: 14, gender: 'female', displayTag: '中2/14歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student8', name: '中村 蓮', course: '3perMonth', email: 'student8@example.com', createdAt: new Date('2023-06-18'), grade: '大人', age: 42, gender: 'male', displayTag: '大人', isActive: false, notes: '海外出張のため長期休会', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student9', name: '小林 杏', course: '2perMonth', email: 'student9@example.com', createdAt: new Date('2023-07-22'), grade: '小2', age: 8, gender: 'female', displayTag: '小2/8歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student10', name: '加藤 陽菜', course: '3perMonth', email: 'student10@example.com', createdAt: new Date('2023-08-30'), grade: '小4', age: 10, gender: 'female', displayTag: '小4/10歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student11', name: '吉田 湊', course: '2perMonth', email: 'student11@example.com', createdAt: new Date('2023-09-05'), grade: '中3', age: 15, gender: 'male', displayTag: '中3/15歳/男', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student12', name: '山田 結衣', course: '3perMonth', email: 'student12@example.com', createdAt: new Date('2023-10-10'), grade: '高1', age: 16, gender: 'female', displayTag: '高1/16歳/女', isActive: true, notes: '', preferredSlot: { enabled: true, dow: 'sat', slotKey: '13:00' } },
    { uid: 'student13', name: '佐々木 陸', course: '2perMonth', email: 'student13@example.com', createdAt: new Date('2023-11-15'), grade: '大人', age: 28, gender: 'male', displayTag: '大人', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student14', name: '山口 莉子', course: '3perMonth', email: 'student14@example.com', createdAt: new Date('2023-12-20'), grade: '小1', age: 7, gender: 'female', displayTag: '小1/7歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student15', name: '松本 悠人', course: '2perMonth', email: 'student15@example.com', createdAt: new Date('2024-01-25'), grade: '小6', age: 12, gender: 'male', displayTag: '小6/12歳/男', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student16', name: '井上 楓', course: '3perMonth', email: 'student16@example.com', createdAt: new Date('2024-02-10'), grade: '中2', age: 14, gender: 'female', displayTag: '中2/14歳/女', isActive: true, notes: '', preferredSlot: { enabled: true, dow: 'sun', slotKey: '14:00' } },
    { uid: 'student17', name: '木村 拓海', course: '2perMonth', email: 'student17@example.com', createdAt: new Date('2024-03-18'), grade: '大人', age: 55, gender: 'male', displayTag: '大人', isActive: true, notes: '体験レッスン希望', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student18', name: '林 芽衣', course: '3perMonth', email: 'student18@example.com', createdAt: new Date('2024-04-02'), grade: '小3', age: 9, gender: 'female', displayTag: '小3/9歳/女', isActive: true, notes: '', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student19', name: '斎藤 蒼', course: '2perMonth', email: 'student19@example.com', createdAt: new Date('2024-05-09'), grade: '高3', age: 18, gender: 'male', displayTag: '高3/18歳/男', isActive: false, notes: '受験のため休会', preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' } },
    { uid: 'student20', name: '橋本 凛', course: '3perMonth', email: 'student20@example.com', createdAt: new Date('2024-06-21'), grade: '中1', age: 13, gender: 'female', displayTag: '中1/13歳/女', isActive: true, notes: '', preferredSlot: { enabled: true, dow: 'sat', slotKey: '15:00' } },
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
    activeDatesByMonth: {},
};

/**
 * Gets the default active dates for a given month (first 6 weekend days).
 * @param month The month to get active dates for.
 * @returns An array of date strings (YYYY-MM-DD).
 */
export const getDefaultActiveDatesForMonth = (month: Date): string[] => {
    const start = startOfMonth(month);
    const end = endOfMonth(month);
    const allWeekendDays = eachDayOfInterval({ start, end })
        .filter(day => isSaturday(day) || isSunday(day));
    return allWeekendDays.slice(0, 6).map(day => format(day, 'yyyy-MM-dd'));
}


// Generate slots and lessons for the current and next month
const generateInitialData = () => {
  let slots: TimeSlot[] = [];
  let lessons: Lesson[] = [];
  const today = new Date();
  // Generate for current, previous, and next two months
  const monthsToGenerate = [addMonths(today, -1), today, addMonths(today, 1), addMonths(today, 2)];

  monthsToGenerate.forEach(month => {
    const monthKey = format(month, 'yyyy-MM');
    const activeDates = appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(month);

    activeDates.forEach(dateStr => {
      fixedTimeSlotsDefinition.forEach(time => {
        const slotId = `${dateStr}-${time.startTime}`;
        slots.push({
          slotId: slotId,
          date: dateStr,
          startTime: time.startTime,
          endTime: time.endTime,
          capacity: appSettings.defaultSlotCapacity,
          assignedStudentIds: [],
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
    fromLessonId: '', // Will be populated dynamically if needed
    preferredDates: ['2024-08-10', '2024-08-17'],
    note: '学校行事のため、振替をお願いします。',
    status: 'pending',
    createdAt: new Date(),
  },
];


// --- Auto-apply preferred slots ---
const applyPreferredSlots = async () => {
    const today = new Date();
    const monthsToProcess = [today, addMonths(today, 1)];
    const activeStudentsWithPrefs = students.filter(s => s.isActive && s.preferredSlot.enabled);

    for (const student of activeStudentsWithPrefs) {
        for (const monthDate of monthsToProcess) {
            const monthKey = format(monthDate, 'yyyy-MM');
            const limit = student.course === '2perMonth' ? 2 : 3;
            let currentBookingsCount = await countStudentLessonsInMonth(student.uid, monthDate);

            if (currentBookingsCount >= limit) continue;

            const activeDates = appSettings.activeDatesByMonth[monthKey] || getDefaultActiveDatesForMonth(monthDate);
            const { dow, slotKey } = student.preferredSlot;

            for (const dateStr of activeDates) {
                if (currentBookingsCount >= limit) break;

                const date = parseISO(dateStr);
                const dateDow = date.getDay(); // 0=Sun, 6=Sat

                const dowMatches = dow === 'either' || (dow === 'sat' && dateDow === 6) || (dow === 'sun' && dateDow === 0);
                if (!dowMatches) continue;

                const slotId = `${dateStr}-${slotKey}`;
                const slot = slots.find(s => s.slotId === slotId);

                if (slot && slot.assignedStudentIds.length < slot.capacity) {
                    const alreadyBooked = lessons.some(l => l.studentId === student.uid && l.slotId === slotId && (l.status === 'approved' || l.status === 'scheduled'));
                    if (alreadyBooked) continue;
                    
                    // Re-check count inside loop to be safe
                    const count = lessons.filter(l => l.studentId === student.uid && findSlot(l.slotId)?.date.startsWith(monthKey) && (l.status === 'approved' || l.status === 'scheduled')).length;
                    if(count >= limit) continue;


                    // Add lesson
                    lessons.push({
                        lessonId: `lesson-${student.uid}-${slotId}`,
                        studentId: student.uid,
                        slotId: slotId,
                        status: 'approved',
                        priority: 'fixed',
                        updatedAt: new Date(),
                        createdBy: 'teacher',
                        source: 'preferredSlotAuto',
                    });

                    // Add student to slot
                    slot.assignedStudentIds.push(student.uid);

                    currentBookingsCount++;
                }
            }
        }
    }
}
// Run once on startup after a short delay
setTimeout(applyPreferredSlots, 100);

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
    return new Promise(resolve => setTimeout(() => resolve(students.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())), FAKE_DELAY));
}

export const getSlotsForMonth = async (month: Date): Promise<TimeSlot[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            const monthStr = format(month, 'yyyy-MM');
            resolve(JSON.parse(JSON.stringify(slots.filter(s => s.date.startsWith(monthStr)))));
        }, FAKE_DELAY);
    });
}

export const getSlotsForDay = async (date: string): Promise<TimeSlot[]> => {
    return new Promise(resolve => {
        setTimeout(() => {
            resolve(JSON.parse(JSON.stringify(slots.filter(s => s.date === date).sort((a,b) => a.startTime.localeCompare(b.startTime)))));
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

export const createStudent = async (data: Omit<Student, 'uid' | 'createdAt' | 'isActive' | 'preferredSlot'>): Promise<Student> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (!data.name || !data.email || !data.course) {
                return reject(new Error("Missing required fields."));
            }
            const newStudent: Student = {
                uid: `student${students.length + 1}`,
                createdAt: new Date(),
                isActive: true,
                preferredSlot: { enabled: false, dow: 'either', slotKey: '10:00' },
                ...data
            };
            students.push(newStudent);
            resolve(newStudent);
        }, FAKE_DELAY);
    });
}

export const updateStudent = async (studentId: string, data: Partial<Student>): Promise<Student> => {
    return new Promise((resolve, reject) => {
        setTimeout(async () => {
            const index = students.findIndex(s => s.uid === studentId);
            if (index !== -1) {
                const oldStudent = students[index];
                students[index] = { ...students[index], ...data };
                
                // If preferred slot was toggled, re-apply
                if (data.preferredSlot && oldStudent.preferredSlot.enabled !== data.preferredSlot.enabled && data.preferredSlot.enabled) {
                   await applyPreferredSlots();
                }

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
        }, FAKE_DELAY / 10);
    });
}

export const updateSlotAssignments = async (slotId: string, studentIds: string[]): Promise<TimeSlot> => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            let slot = slots.find(s => s.slotId === slotId);

            // If slot doesn't exist, create it.
            if (!slot) {
                const dateParts = slotId.split('-');
                if (dateParts.length < 4) return reject(new Error("Invalid slotId format."));
                
                const date = dateParts.slice(0, 3).join('-'); // "YYYY-MM-DD"
                const startTime = dateParts.slice(3).join(':'); // "HH:mm"
                
                const timeDef = fixedTimeSlotsDefinition.find(t => t.startTime === startTime);
                if (!date.match(/^\d{4}-\d{2}-\d{2}$/) || !timeDef) {
                    return reject(new Error("Invalid slotId format."));
                }
                const newSlot: TimeSlot = {
                    slotId,
                    date,
                    startTime: timeDef.startTime,
                    endTime: timeDef.endTime,
                    capacity: appSettings.defaultSlotCapacity,
                    assignedStudentIds: [],
                };
                slots.push(newSlot);
                slot = newSlot;
            }

            if (studentIds.length > slot.capacity) {
                return reject(new Error("Capacity exceeded"));
            }

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
                        createdBy: 'teacher',
                        source: 'manual',
                    });
                }
            });

            slot.assignedStudentIds = studentIds;
            resolve(JSON.parse(JSON.stringify(slot)));
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

    
