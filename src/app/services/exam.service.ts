import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';
import { Exam, ExamThumbnail, SearchCriteria, ExamSearchResult } from '../models/exam.model';

@Injectable({
  providedIn: 'root'
})
export class ExamService {
  private examsSubject = new BehaviorSubject<Exam[]>([]);
  private currentSortSubject = new BehaviorSubject<string>('date-desc');
  private searchQuerySubject = new BehaviorSubject<string>('');
  private currentCategoryFilterSubject = new BehaviorSubject<string>('inbox');
  private allMockExams: Exam[] = [
    // Inbox exams (17 examens)
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
      category: 'inbox',
      thumbnails: [
        { id: '1-1', filename: 'axial_1.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' },
        { id: '1-2', filename: 'axial_2.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' },
        { id: '1-3', filename: 'sagittal_1.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' },
        { id: '1-4', filename: 'coronal_1.dcm', imageUrl: 'assets/public/images/radio/radio4.png' },
        { id: '1-5', filename: 'report.pdf', imageUrl: 'assets/public/images/radio/radio5.jpg' },
        { id: '1-6', filename: 'axial_3.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' }
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
      category: 'inbox',
      thumbnails: [
        { id: '2-1', filename: 'T1_axial.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' },
        { id: '2-2', filename: 'T2_axial.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' },
        { id: '2-3', filename: 'FLAIR_sag.dcm', imageUrl: 'assets/public/images/radio/radio9.JPG' }
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
      category: 'inbox',
      thumbnails: [
        { id: '3-1', filename: 'AP_view.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' },
        { id: '3-2', filename: 'Lateral_view.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' }
      ]
    },
    {
      id: '4',
      patientName: 'Claire Dubois',
      examId: '25091200789_04',
      examType: 'CT - Thorax - 2025-09-11 16:30',
      date: new Date('2025-09-11T16:30:00'),
      indication: 'Persistent cough evaluation - FEMALE - 58y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      thumbnails: [
        { id: '4-1', filename: 'axial_thorax.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' },
        { id: '4-2', filename: 'coronal_thorax.dcm', imageUrl: 'assets/public/images/radio/radio4.png' }
      ]
    },
    {
      id: '5',
      patientName: 'Michel Leroy',
      examId: '25091200567_05',
      examType: 'Ultrasound - Abdomen - 2025-09-11 14:15',
      date: new Date('2025-09-11T14:15:00'),
      indication: 'Abdominal pain investigation - MALE - 62y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      thumbnails: [
        { id: '5-1', filename: 'us_abdomen.dcm', imageUrl: 'assets/public/images/radio/radio5.jpg' },
        { id: '5-2', filename: 'us_liver.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' }
      ]
    },
    {
      id: '6',
      patientName: 'Sylvie Moreau',
      examId: '25091200345_06',
      examType: 'MRI - Knee - 2025-09-10 10:20',
      date: new Date('2025-09-10T10:20:00'),
      indication: 'Sports injury assessment - FEMALE - 34y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      thumbnails: [
        { id: '6-1', filename: 'T1_knee.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' },
        { id: '6-2', filename: 'T2_knee.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' }
      ]
    },
    {
      id: '7',
      patientName: 'François Bernard',
      examId: '25091200123_07',
      examType: 'CT - Head - 2025-09-10 08:45',
      date: new Date('2025-09-10T08:45:00'),
      indication: 'Headache evaluation - MALE - 45y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      thumbnails: [
        { id: '7-1', filename: 'axial_head.dcm', imageUrl: 'assets/public/images/radio/radio9.JPG' },
        { id: '7-2', filename: 'coronal_head.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' }
      ]
    },
    {
      id: '8',
      patientName: 'Isabelle Petit',
      examId: '25091200890_08',
      examType: 'Mammography - Bilateral - 2025-09-09 15:30',
      date: new Date('2025-09-09T15:30:00'),
      indication: 'Routine screening - FEMALE - 52y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      thumbnails: [
        { id: '8-1', filename: 'CC_right.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' },
        { id: '8-2', filename: 'MLO_left.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' }
      ]
    },
    // Pending exams (3 examens)
    {
      id: '9',
      patientName: 'Robert Garnier',
      examId: '25091200456_09',
      examType: 'X-RAY - Spine - 2025-09-09 11:00',
      date: new Date('2025-09-09T11:00:00'),
      indication: 'Back pain evaluation - MALE - 67y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Robert Garnier',
      thumbnails: [
        { id: '9-1', filename: 'AP_spine.dcm', imageUrl: 'assets/public/images/radio/radio4.png' },
        { id: '9-2', filename: 'Lateral_spine.dcm', imageUrl: 'assets/public/images/radio/radio5.jpg' }
      ]
    },
    {
      id: '10',
      patientName: 'Nathalie Roux',
      examId: '25091200234_10',
      examType: 'CT - Pelvis - 2025-09-08 13:45',
      date: new Date('2025-09-08T13:45:00'),
      indication: 'Pelvic pain investigation - FEMALE - 41y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Nathalie Roux',
      thumbnails: [
        { id: '10-1', filename: 'axial_pelvis.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' },
        { id: '10-2', filename: 'coronal_pelvis.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' }
      ]
    },
    {
      id: '11',
      patientName: 'Thierry Blanc',
      examId: '25091200678_11',
      examType: 'MRI - Shoulder - 2025-09-08 09:30',
      date: new Date('2025-09-08T09:30:00'),
      indication: 'Rotator cuff injury - MALE - 55y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Thierry Blanc',
      thumbnails: [
        { id: '11-1', filename: 'T1_shoulder.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' },
        { id: '11-2', filename: 'T2_shoulder.dcm', imageUrl: 'assets/public/images/radio/radio9.JPG' }
      ]
    },
    {
      id: '12',
      patientName: 'Valérie Durand',
      examId: '25091200345_12',
      examType: 'Ultrasound - Thyroid - 2025-09-07 16:00',
      date: new Date('2025-09-07T16:00:00'),
      indication: 'Thyroid nodule evaluation - FEMALE - 48y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Valérie Durand',
      thumbnails: [
        { id: '12-1', filename: 'us_thyroid.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' },
        { id: '12-2', filename: 'us_thyroid_doppler.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' }
      ]
    },
    {
      id: '13',
      patientName: 'Alain Mercier',
      examId: '25091200789_13',
      examType: 'CT - Abdomen - 2025-09-07 12:15',
      date: new Date('2025-09-07T12:15:00'),
      indication: 'Digestive symptoms evaluation - MALE - 59y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Alain Mercier',
      thumbnails: [
        { id: '13-1', filename: 'axial_abdomen.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' },
        { id: '13-2', filename: 'coronal_abdomen.dcm', imageUrl: 'assets/public/images/radio/radio4.png' }
      ]
    },
    {
      id: '14',
      patientName: 'Céline Fabre',
      examId: '25091200567_14',
      examType: 'MRI - Brain - 2025-09-06 14:30',
      date: new Date('2025-09-06T14:30:00'),
      indication: 'Migraine investigation - FEMALE - 36y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Céline Fabre',
      thumbnails: [
        { id: '14-1', filename: 'T1_brain.dcm', imageUrl: 'assets/public/images/radio/radio5.jpg' },
        { id: '14-2', filename: 'T2_brain.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' }
      ]
    },
    {
      id: '15',
      patientName: 'Didier Lemoine',
      examId: '25091200123_15',
      examType: 'X-RAY - Hip - 2025-09-06 10:45',
      date: new Date('2025-09-06T10:45:00'),
      indication: 'Hip pain assessment - MALE - 71y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Didier Lemoine',
      thumbnails: [
        { id: '15-1', filename: 'AP_hip.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' },
        { id: '15-2', filename: 'Lateral_hip.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' }
      ]
    },
    {
      id: '16',
      patientName: 'Monique Girard',
      examId: '25091200890_16',
      examType: 'CT - Thorax - 2025-09-05 15:20',
      date: new Date('2025-09-05T15:20:00'),
      indication: 'Lung nodule follow-up - FEMALE - 64y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Monique Girard',
      thumbnails: [
        { id: '16-1', filename: 'axial_thorax.dcm', imageUrl: 'assets/public/images/radio/radio9.JPG' },
        { id: '16-2', filename: 'coronal_thorax.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' }
      ]
    },
    {
      id: '17',
      patientName: 'Philippe Roussel',
      examId: '25091200456_17',
      examType: 'Ultrasound - Cardiac - 2025-09-05 11:30',
      date: new Date('2025-09-05T11:30:00'),
      indication: 'Cardiac function assessment - MALE - 68y',
      aiStatus: 'green',
      isPinned: false,
      isExpanded: false,
      category: 'inbox',
      assignedDoctor: 'Dr. Philippe Roussel',
      thumbnails: [
        { id: '17-1', filename: 'us_cardiac.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' },
        { id: '17-2', filename: 'us_cardiac_doppler.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' }
      ]
    },
    // Pending exams (3 examens)
    {
      id: '18',
      patientName: 'Sophie Martin',
      examId: '25091200234_18',
      examType: 'MRI - Spine - 2025-09-11 14:20',
      date: new Date('2025-09-11T14:20:00'),
      indication: 'Lower back pain, suspected herniated disc - FEMALE - 45y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'pending',
      thumbnails: [
        { id: '18-1', filename: 'T1_sagittal.dcm', imageUrl: 'assets/public/images/radio/radio4.png' },
        { id: '18-2', filename: 'T2_axial.dcm', imageUrl: 'assets/public/images/radio/radio5.jpg' },
        { id: '18-3', filename: 'STIR_coronal.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' }
      ]
    },
    {
      id: '19',
      patientName: 'Pierre Dubois',
      examId: '25091200345_19',
      examType: 'CT - Thorax - 2025-09-11 11:45',
      date: new Date('2025-09-11T11:45:00'),
      indication: 'Persistent cough, rule out pulmonary nodules - MALE - 58y',
      aiStatus: 'green',
      isPinned: true,
      isExpanded: false,
      category: 'pending',
      thumbnails: [
        { id: '19-1', filename: 'axial_lung.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' },
        { id: '19-2', filename: 'coronal_chest.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' }
      ]
    },
    {
      id: '20',
      patientName: 'Emma Rousseau',
      examId: '25091200456_20',
      examType: 'Mammography - Bilateral - 2025-09-11 09:30',
      date: new Date('2025-09-11T09:30:00'),
      indication: 'Routine screening mammography - FEMALE - 52y',
      aiStatus: 'red',
      isPinned: false,
      isExpanded: false,
      category: 'pending',
      thumbnails: [
        { id: '20-1', filename: 'CC_right.dcm', imageUrl: 'assets/public/images/radio/radio9.JPG' },
        { id: '20-2', filename: 'CC_left.dcm', imageUrl: 'assets/public/images/radio/radio1.jpg' },
        { id: '20-3', filename: 'MLO_right.dcm', imageUrl: 'assets/public/images/radio/radio2.jpg' },
        { id: '20-4', filename: 'MLO_left.dcm', imageUrl: 'assets/public/images/radio/radio3.jpg' }
      ]
    },
    // Second Opinion exams (2 examens)
    {
      id: '21',
      patientName: 'Antoine Moreau',
      examId: '25091200567_21',
      examType: 'CT - Head - 2025-09-10 16:15',
      date: new Date('2025-09-10T16:15:00'),
      indication: 'Post-surgical follow-up, brain tumor resection - MALE - 34y',
      aiStatus: 'red',
      isPinned: true,
      isExpanded: false,
      category: 'second-opinion',
      thumbnails: [
        { id: '21-1', filename: 'axial_brain.dcm', imageUrl: 'assets/public/images/radio/radio4.png' },
        { id: '21-2', filename: 'contrast_axial.dcm', imageUrl: 'assets/public/images/radio/radio5.jpg' },
        { id: '21-3', filename: 'sagittal_brain.dcm', imageUrl: 'assets/public/images/radio/radio6.JPG' }
      ]
    },
    {
      id: '22',
      patientName: 'Isabelle Leroy',
      examId: '25091200678_22',
      examType: 'MRI - Pelvis - 2025-09-10 13:00',
      date: new Date('2025-09-10T13:00:00'),
      indication: 'Suspected endometriosis, pelvic pain - FEMALE - 29y',
      aiStatus: 'orange',
      isPinned: false,
      isExpanded: false,
      category: 'second-opinion',
      assignedDoctor: 'Dr. Isabelle Leroy',
      thumbnails: [
        { id: '22-1', filename: 'T2_axial_pelvis.dcm', imageUrl: 'assets/public/images/radio/radio7.JPG' },
        { id: '22-2', filename: 'T1_sagittal.dcm', imageUrl: 'assets/public/images/radio/radio8.JPG' }
      ]
    }
  ];
  
  constructor(private configService: ConfigService) {
    this._applyFiltersAndSortAndEmit();
  }

  setSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
    this._applyFiltersAndSortAndEmit();
  }

  getSearchQuery(): Observable<string> {
    return this.searchQuerySubject.asObservable();
  }

  private _applyFiltersAndSortAndEmit(): void {
    const currentCategory = this.currentCategoryFilterSubject.value;
    const searchQuery = this.searchQuerySubject.value;
    const sortOrder = this.currentSortSubject.value;

    // Filter by category
    let filteredExams = this.allMockExams.filter(exam => {
      switch (currentCategory) {
        case 'inbox': return exam.category === 'inbox';
        case 'pending': return exam.category === 'pending';
        case 'second-opinion': return exam.category === 'second-opinion';
        case 'completed': return exam.category === 'completed';
        default: return exam.category === 'inbox';
      }
    });

    // Apply search filter
    if (searchQuery.trim()) {
      filteredExams = filteredExams.filter(exam => 
        this.matchesSearchQuery(exam, searchQuery)
      );
    }

    // Apply sorting
    const sortedExams = this.sortExams([...filteredExams], sortOrder);

    // Emit results
    this.examsSubject.next(sortedExams);
  }

  setFilter(filter: string): void {
    this.currentCategoryFilterSubject.next(filter);
    this._applyFiltersAndSortAndEmit();
  }

  setSortOrder(sortOrder: string): void {
    console.log('ExamService: Setting sort order to', sortOrder);
    this.currentSortSubject.next(sortOrder);
    this._applyFiltersAndSortAndEmit();
  }

  getCurrentSort(): Observable<string> {
    return this.currentSortSubject.asObservable();
  }

  private sortExams(exams: Exam[], sortOrder: string): Exam[] {
    switch (sortOrder) {
      case 'date-desc':
        return exams.sort((a, b) => b.date.getTime() - a.date.getTime());
      case 'date-asc':
        return exams.sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'patient-name':
        return exams.sort((a, b) => a.patientName.localeCompare(b.patientName));
      default:
        return exams;
    }
  }

  getCurrentFilter(): Observable<string> {
    return this.currentCategoryFilterSubject.asObservable();
  }

  private matchesSearchQuery(exam: Exam, query: string): boolean {
    const searchTerm = query.toLowerCase();
    
    // Search in patient name (split by space for first/last name)
    const patientNameParts = exam.patientName.toLowerCase().split(' ');
    const patientNameMatch = patientNameParts.some(part => part.includes(searchTerm)) || 
                            exam.patientName.toLowerCase().includes(searchTerm);
    
    // Search in assigned doctor (if exists)
    const assignedDoctor = exam.assignedDoctor?.toLowerCase() || '';
    const doctorNameParts = assignedDoctor.split(' ');
    const doctorNameMatch = doctorNameParts.some(part => part.includes(searchTerm)) || 
                           assignedDoctor.includes(searchTerm);
    
    // Search in exam ID
    const examIdMatch = exam.examId.toLowerCase().includes(searchTerm);
    
    // Search in date (multiple formats)
    const dateStr = exam.date.toLocaleDateString('fr-FR');
    const isoDateStr = exam.date.toISOString().split('T')[0];
    const dateMatch = dateStr.includes(searchTerm) || isoDateStr.includes(searchTerm);
    
    // Search in indication
    const indicationMatch = exam.indication.toLowerCase().includes(searchTerm);
    
    // Search in AI status
    const statusMatch = exam.aiStatus.toLowerCase().includes(searchTerm);
    
    // Search in exam type
    const examTypeMatch = exam.examType.toLowerCase().includes(searchTerm);
    
    return patientNameMatch || doctorNameMatch || examIdMatch || 
           dateMatch || indicationMatch || statusMatch || examTypeMatch;
  }

  getById(id: string): Observable<Exam | null> {
    return of(this.allMockExams.find(exam => exam.id === id) || null).pipe(delay(300));
  }

  search(criteria: SearchCriteria): Observable<ExamSearchResult> {
    let filteredExams = [...this.allMockExams];

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
    this.allMockExams.push(newExam);
    this._applyFiltersAndSortAndEmit();
    return of(newExam).pipe(delay(300));
  }

  update(id: string, updates: Partial<Exam>): Observable<Exam | null> {
    const index = this.allMockExams.findIndex(exam => exam.id === id);
    if (index === -1) {
      return of(null).pipe(delay(300));
    }

    this.allMockExams[index] = { ...this.allMockExams[index], ...updates };
    this._applyFiltersAndSortAndEmit();
    return of(this.allMockExams[index]).pipe(delay(300));
  }

  delete(id: string): Observable<boolean> {
    const index = this.allMockExams.findIndex(exam => exam.id === id);
    if (index === -1) {
      return of(false).pipe(delay(300));
    }

    this.allMockExams.splice(index, 1);
    this._applyFiltersAndSortAndEmit();
    return of(true).pipe(delay(300));
  }

  getAll(): Observable<Exam[]> {
    return this.examsSubject.asObservable();
  }

  expandAll(): Observable<boolean> {
    console.log('ExamService: Expanding all exams');
    this.allMockExams.forEach((exam: Exam) => {
      exam.isExpanded = true;
    });
    
    this._applyFiltersAndSortAndEmit();
    console.log('ExamService: All exams expanded, applied sort and emitted new state');
    return of(true).pipe(delay(50));
  }

  collapseAll(): Observable<boolean> {
    console.log('ExamService: Collapsing all exams');
    this.allMockExams.forEach((exam: Exam) => {
      exam.isExpanded = false;
    });
    this._applyFiltersAndSortAndEmit();
    console.log('ExamService: All exams collapsed, applied sort and emitted new state');
    return of(true).pipe(delay(50));
  }
}