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