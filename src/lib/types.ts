export type User = {
  uid: string;
  email: string | null;
  name?: string;
};

export type Student = {
  uid: string;
  name: string;
  course: '2perMonth' | '3perMonth';
  email: string;
  createdAt: Date;
};

export type TimeSlot = {
  slotId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  capacity: number;
  assignedStudentIds: string[];
};

export type Lesson = {
  lessonId: string;
  studentId: string;
  slotId: string;
  status: 'scheduled' | 'swap_pending' | 'swapped' | 'canceled';
  priority: 'fixed' | 'normal';
  updatedAt: Date;
};

export type SwapRequest = {
  requestId: string;
  studentId: string;
  fromLessonId: string;
  preferredDates: string[]; // YYYY-MM-DD
  note: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedSlotId?: string;
  createdAt: Date;
};

export type Announcement = {
  id: string;
  title: string;
  body: string;
  published: boolean;
  createdAt: Date;
};

// For UI display
export type LessonWithDetails = Lesson & {
  studentName: string;
  slotDate: string;
  slotStartTime: string;
  slotEndTime: string;
};

export type SwapRequestWithDetails = SwapRequest & {
  studentName: string;
  fromLesson: LessonWithDetails;
};
