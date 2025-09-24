export interface Exam {
  id: string;
  patientName: string;
  examId: string;
  examType: string;
  date: Date;
  indication: string;
  aiStatus: 'green' | 'red' | 'orange';
  thumbnails: ExamThumbnail[];
  isPinned: boolean;
  isExpanded: boolean;
  category: 'inbox' | 'pending' | 'second-opinion' | 'completed';
  assignedDoctor?: string;
}

export interface ExamThumbnail {
  id: string;
  filename: string;
  imageUrl: string;
}

export interface SearchCriteria {
  query: string;
  page: number;
  pageSize: number;
}

export interface ExamSearchResult {
  exams: Exam[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}