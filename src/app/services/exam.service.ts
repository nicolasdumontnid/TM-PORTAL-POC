import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import { Exam, ExamThumbnail, SearchCriteria, ExamSearchResult } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private examsSubject = new BehaviorSubject<Exam[]>([]);
  private allMockExams: Exam[] = [
    // Inbox exams
    {
      id: '1',
      patientName: 'Jean Dupont',
      examId: '25091200872_01',
      examType: 'CT - Abdomen - 2025-09-12 09:05',
      date: new Date('2025-09-12T09:05:00'),
      indication: 'Follow-up scan for previously identified lesion in the upper right quadrant, patient reports mild discomfort.',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '1-1', filename: 'axial_1.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' },
        { id: '1-2', filename: 'axial_2.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' },
        { id: '1-3', filename: 'sagittal_1.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '1-4', filename: 'coronal_1.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' },
        { id: '1-5', filename: 'report.pdf', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' },
        { id: '1-6', filename: 'axial_3.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' }
      ]
    },
    {
      id: '2',
      patientName: 'Marie Curie',
      examId: '25091200456_03',
      examType: 'MRI - Brain - 2025-09-12 08:30',
      date: new Date('2025-09-12T08:30:00'),
      indication: 'suspected tumor - FEMALE - 67y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '2-1', filename: 'T1_axial.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '2-2', filename: 'T2_axial.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' },
        { id: '2-3', filename: 'FLAIR_sag.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' }
      ]
    },
    {
      id: '3',
      patientName: 'Louis Pasteur',
      examId: '25091200112_02',
      examType: 'X-RAY - Chest - 2025-09-12 07:45',
      date: new Date('2025-09-12T07:45:00'),
      indication: 'Routine check-up - MALE - 72y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '3-1', filename: 'AP_view.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '3-2', filename: 'Lateral_view.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' }
      ]
    },
    // Pending exams
    {
      id: '4',
      patientName: 'Sophie Martin',
      examId: '25091200234_04',
      examType: 'MRI - Spine - 2025-09-11 14:20',
      date: new Date('2025-09-11T14:20:00'),
      indication: 'Lower back pain, suspected herniated disc - FEMALE - 45y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '4-1', filename: 'T1_sagittal.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' },
        { id: '4-2', filename: 'T2_axial.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '4-3', filename: 'STIR_coronal.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' }
      ]
    },
    {
      id: '5',
      patientName: 'Pierre Dubois',
      examId: '25091200345_05',
      examType: 'CT - Thorax - 2025-09-11 11:45',
      date: new Date('2025-09-11T11:45:00'),
      indication: 'Persistent cough, rule out pulmonary nodules - MALE - 58y',
      aiStatus: 'green',
      isPinned: true,
      isExpanded: false,
      thumbnails: [
        { id: '5-1', filename: 'axial_lung.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '5-2', filename: 'coronal_chest.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' }
      ]
    },
    {
      id: '6',
      patientName: 'Emma Rousseau',
      examId: '25091200456_06',
      examType: 'Mammography - Bilateral - 2025-09-11 09:30',
      date: new Date('2025-09-11T09:30:00'),
      indication: 'Routine screening mammography - FEMALE - 52y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '6-1', filename: 'CC_right.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' },
        { id: '6-2', filename: 'CC_left.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '6-3', filename: 'MLO_right.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' },
        { id: '6-4', filename: 'MLO_left.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' }
      ]
    },
    // Second Opinion exams
    {
      id: '7',
      patientName: 'Antoine Moreau',
      examId: '25091200567_07',
      examType: 'CT - Head - 2025-09-10 16:15',
      date: new Date('2025-09-10T16:15:00'),
      indication: 'Post-surgical follow-up, brain tumor resection - MALE - 34y',
      aiStatus: 'red',
      isPinned: true,
      isExpanded: false,
      thumbnails: [
        { id: '7-1', filename: 'axial_brain.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' },
        { id: '7-2', filename: 'contrast_axial.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '7-3', filename: 'sagittal_brain.dcm', imageUrl: 'https://i.ibb.co/9gZ2YjM/scan-thumb-2.png' }
      ]
    },
    {
      id: '8',
      patientName: 'Isabelle Leroy',
      examId: '25091200678_08',
      examType: 'MRI - Pelvis - 2025-09-10 13:00',
      date: new Date('2025-09-10T13:00:00'),
      indication: 'Suspected endometriosis, pelvic pain - FEMALE - 29y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      thumbnails: [
        { id: '8-1', filename: 'T2_axial_pelvis.dcm', imageUrl: 'https://i.ibb.co/yQdZn5P/scan-thumb-3.png' },
        { id: '8-2', filename: 'T1_sagittal.dcm', imageUrl: 'https://i.ibb.co/JqjTz3j/scan-thumb-1.png' }
      ]
    }
  ];
  
  private currentFilter = new BehaviorSubject<string>('inbox');
  private mockExams: Exam[] = [];

  constructor() {
    this.updateExamsForFilter('inbox');
  }

  private updateExamsForFilter(filter: string): void {
    switch (filter) {
      case 'inbox':
        this.mockExams = this.allMockExams.filter(exam => ['1', '2', '3'].includes(exam.id));
        break;
      case 'pending':
        this.mockExams = this.allMockExams.filter(exam => ['4', '5', '6'].includes(exam.id));
        break;
      case 'second-opinion':
        this.mockExams = this.allMockExams.filter(exam => ['7', '8'].includes(exam.id));
        break;
      case 'completed':
        this.mockExams = [];
        break;
      default:
        this.mockExams = this.allMockExams.filter(exam => ['1', '2', '3'].includes(exam.id));
    }
    this.currentFilter.next(filter);
    this.examsSubject.next([...this.mockExams]);
  }

  setFilter(filter: string): void {
    this.updateExamsForFilter(filter);
  }

  getCurrentFilter(): Observable<string> {
    return this.currentFilter.asObservable();
  }

  getById(id: string): Observable<Exam | null> {
    return of(this.mockExams.find(exam => exam.id === id) || null).pipe(delay(300));
  }

  search(criteria: SearchCriteria): Observable<ExamSearchResult> {
    let filteredExams = [...this.mockExams];

    if (criteria.query) {
      const query = criteria.query.toLowerCase();
      filteredExams = filteredExams.filter(exam => 
        exam.patientName.toLowerCase().includes(query) ||
        exam.examId.toLowerCase().includes(query) ||
        exam.indication.toLowerCase().includes(query)
      );
    }

    const startIndex = (criteria.page - 1) * criteria.pageSize;
    const endIndex = startIndex + criteria.pageSize;
    const paginatedExams = filteredExams.slice(startIndex, endIndex);

    return of({
      exams: paginatedExams,
      totalCount: filteredExams.length,
      currentPage: criteria.page,
      totalPages: Math.ceil(filteredExams.length / criteria.pageSize)
    }).pipe(delay(300));
  }

  create(exam: Omit<Exam, 'id'>): Observable<Exam> {
    const newExam: Exam = {
      ...exam,
      id: Date.now().toString()
    };
    this.mockExams.push(newExam);
    this.examsSubject.next([...this.mockExams]);
    return of(newExam).pipe(delay(300));
  }

  update(id: string, updates: Partial<Exam>): Observable<Exam | null> {
    const index = this.mockExams.findIndex(exam => exam.id === id);
    if (index === -1) {
      return of(null).pipe(delay(300));
    }

    this.mockExams[index] = { ...this.mockExams[index], ...updates };
    
    // Also update in allMockExams
    const allIndex = this.allMockExams.findIndex(exam => exam.id === id);
    if (allIndex !== -1) {
      this.allMockExams[allIndex] = { ...this.allMockExams[allIndex], ...updates };
    }
    
    this.examsSubject.next([...this.mockExams]);
    return of(this.mockExams[index]).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.mockExams.findIndex(exam => exam.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }

    this.mockExams.splice(index, 1);
    this.examsSubject.next([...this.mockExams]);
    return of(true).pipe(delay(300));
  }

  getAll(): Observable<Exam[]> {
    return this.examsSubject.asObservable();
  }

  expandAll(): Observable<boolean> {
    this.mockExams.forEach(exam => {
      exam.isExpanded = true;
    });
    return of(true).pipe(delay(100));
  }

  collapseAll(): Observable<boolean> {
    this.mockExams.forEach(exam => {
      exam.isExpanded = false;
    });
    return of(true).pipe(delay(100));
  }
}