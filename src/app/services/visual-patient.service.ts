import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { PatientInfo, RadiologicalRequest, AISummary, RadioReport, PatientRecord, ExamPoint, ImagesByDate, VisualPatientBlock, Department, AnatomyRegion } from '../models/visual-patient.model';

@Injectable({
  providedIn: 'root'
})
export class VisualPatientService {
  private mockPatientInfo: PatientInfo = {
    id: '1',
    name: 'Jean Dupont',
    dateOfBirth: new Date('1975-03-15'),
    patientNumber: 'P-2025-001234',
    examNumber: '25091200872_01',
    gender: 'M',
    photo: this.getRandomPatientImage()
  };

  private getPatientImageByGender(gender: 'M' | 'F' | 'Other'): string {
    let availableImages: string[];
    
    if (gender === 'M') {
      // Images masculines
      availableImages = [
        'assets/public/images/patient/patient0.JPG',
        'assets/public/images/patient/patient4.JPG',
        'assets/public/images/patient/patient7.JPG',
        'assets/public/images/patient/patient8.JPG',
        'assets/public/images/patient/patient9.JPG'
      ];
    } else if (gender === 'F') {
      // Images féminines
      availableImages = [
        'assets/public/images/patient/patient1.JPG',
        'assets/public/images/patient/patient2.JPG',
        'assets/public/images/patient/patient3.JPG',
        'assets/public/images/patient/patient5.JPG',
        'assets/public/images/patient/patient6.JPG'
      ];
    } else {
      // Genre autre ou non spécifié - utiliser toutes les images
      availableImages = [
        'assets/public/images/patient/patient0.JPG',
        'assets/public/images/patient/patient1.JPG',
        'assets/public/images/patient/patient2.JPG',
        'assets/public/images/patient/patient3.JPG',
        'assets/public/images/patient/patient4.JPG',
        'assets/public/images/patient/patient5.JPG',
        'assets/public/images/patient/patient6.JPG',
        'assets/public/images/patient/patient7.JPG',
        'assets/public/images/patient/patient8.JPG',
        'assets/public/images/patient/patient9.JPG'
      ];
    }
    
    // Sélection aléatoire parmi les images appropriées
    const randomIndex = Math.floor(Math.random() * availableImages.length);
    return availableImages[randomIndex];
  }

  private getRandomPatientImage(): string {
    return this.getPatientImageByGender('M'); // Par défaut pour la compatibilité
  }

  private mockRadiologicalRequest: RadiologicalRequest = {
    description: 'Cancer staging, six months after chemotherapy'
  };

  private mockAISummary: AISummary = {
    medicalSector: 'Oncology',
    status: 'Outpatient',
    healthSummary: 'Patient shows significant improvement following chemotherapy treatment. Recent imaging indicates reduction in tumor size with no new metastatic lesions detected. Overall prognosis remains positive with continued monitoring recommended.'
  };

  private mockRadioReport: RadioReport = {
    conclusion: 'The CT scan of the abdomen shows marked improvement compared to previous studies. The previously identified lesion in the upper right quadrant has decreased in size by approximately 40%. No new suspicious lesions are identified. The liver, spleen, and kidneys appear normal. Lymph nodes are within normal limits. Recommendation: Continue current treatment protocol and follow-up imaging in 3 months.'
  };

  private mockPatientRecords: PatientRecord[] = [
    {
      id: '1',
      date: new Date('2025-01-15'),
      examName: 'CT Abdomen',
      description: 'Follow-up scan for previously identified lesion in the upper right quadrant'
    },
    {
      id: '2',
      date: new Date('2025-01-10'),
      examName: 'Lab Report',
      description: 'Complete blood count and liver function tests'
    },
    {
      id: '3',
      date: new Date('2025-01-05'),
      examName: 'Blood Sample',
      description: 'Tumor markers and inflammatory indicators'
    },
    {
      id: '4',
      date: new Date('2024-12-20'),
      examName: 'MRI Brain',
      description: 'Routine brain imaging to rule out metastases'
    },
    {
      id: '5',
      date: new Date('2024-12-15'),
      examName: 'X-Ray Chest',
      description: 'Chest radiography for pulmonary assessment'
    },
    {
      id: '6',
      date: new Date('2024-12-01'),
      examName: 'CT Thorax',
      description: 'Thoracic imaging for staging evaluation'
    },
    {
      id: '7',
      date: new Date('2024-11-20'),
      examName: 'Ultrasound',
      description: 'Abdominal ultrasound examination'
    },
    {
      id: '8',
      date: new Date('2024-11-10'),
      examName: 'PET Scan',
      description: 'Whole body PET-CT for metabolic assessment'
    },
    {
      id: '9',
      date: new Date('2024-10-25'),
      examName: 'Biopsy',
      description: 'Tissue sampling for histopathological analysis'
    },
    {
      id: '10',
      date: new Date('2024-10-15'),
      examName: 'Mammography',
      description: 'Bilateral mammographic examination'
    }
  ];

  private mockExamPoints: ExamPoint[] = [
    {
      id: '1',
      date: new Date('2025-01-15'),
      examName: 'CT Abdomen',
      anatomicalRegion: 'Upper Limb - Pelvis',
      description: 'Follow-up scan showing improvement',
      department: 'Radiology'
    },
    {
      id: '2',
      date: new Date('2024-12-20'),
      examName: 'MRI Brain',
      anatomicalRegion: 'Head - Shoulder',
      description: 'Brain imaging to rule out metastases',
      department: 'Neurology'
    },
    {
      id: '3',
      date: new Date('2024-12-15'),
      examName: 'X-Ray Chest',
      anatomicalRegion: 'Shoulder - Upper Limb',
      description: 'Chest radiography for pulmonary assessment',
      department: 'Pulmonology'
    },
    {
      id: '4',
      date: new Date('2024-11-20'),
      examName: 'Ultrasound Abdomen',
      anatomicalRegion: 'Upper Limb - Pelvis',
      description: 'Abdominal ultrasound examination',
      department: 'Gastroenterology'
    },
    {
      id: '5',
      date: new Date('2024-10-25'),
      examName: 'CT Pelvis',
      anatomicalRegion: 'Pelvis - Lower Limb',
      description: 'Pelvic imaging for staging',
      department: 'Oncology'
    },
    {
      id: '6',
      date: new Date('2024-09-10'),
      examName: 'Spine MRI',
      anatomicalRegion: 'Others',
      description: 'Spinal column examination',
      department: 'Orthopedics'
    },
    {
      id: '7',
      date: new Date('2024-08-05'),
      examName: 'Cardiac Echo',
      anatomicalRegion: 'Shoulder - Upper Limb',
      description: 'Cardiac function assessment',
      department: 'Cardiology'
    },
    {
      id: '8',
      date: new Date('2024-07-12'),
      examName: 'Brain CT',
      anatomicalRegion: 'Head - Shoulder',
      description: 'Emergency brain scan',
      department: 'Emergency'
    },
    {
      id: '9',
      date: new Date('2021-03-15'),
      examName: 'Knee X-Ray',
      anatomicalRegion: 'Lower Limb - Foot',
      description: 'Knee joint evaluation',
      department: 'Orthopedics'
    },
    {
      id: '10',
      date: new Date('2020-11-22'),
      examName: 'Chest CT',
      anatomicalRegion: 'Shoulder - Upper Limb',
      description: 'Pulmonary nodule follow-up',
      department: 'Pulmonology'
    },
    // Future appointments
    {
      id: '11',
      date: new Date('2025-07-15'),
      examName: 'CT Scanner Follow-up',
      anatomicalRegion: 'Upper Limb - Pelvis',
      description: 'Scheduled follow-up CT scan',
      department: 'Radiology',
      isFuture: true
    },
    {
      id: '12',
      date: new Date('2025-09-10'),
      examName: 'MRI Brain',
      anatomicalRegion: 'Head - Shoulder',
      description: 'Scheduled brain MRI',
      department: 'Neurology',
      isFuture: true
    },
    {
      id: '13',
      date: new Date('2025-12-20'),
      examName: 'Annual Check-up',
      anatomicalRegion: 'Shoulder - Upper Limb',
      description: 'Annual comprehensive examination',
      department: 'Radiology',
      isFuture: true
    }
  ];

  private mockImagesByDate: ImagesByDate[] = [
    {
      date: new Date(),
      displayDate: 'Today',
      images: [
        { id: '1', url: 'assets/public/images/radio/radio1.jpg', filename: 'ct_scan_001.dcm', examDate: new Date(), examType: 'CT Abdomen' },
        { id: '2', url: 'assets/public/images/radio/radio2.jpg', filename: 'ct_scan_002.dcm', examDate: new Date(), examType: 'CT Abdomen' },
        { id: '3', url: 'assets/public/images/radio/radio3.jpg', filename: 'ct_scan_003.dcm', examDate: new Date(), examType: 'CT Abdomen' },
        { id: '4', url: 'assets/public/images/radio/radio4.png', filename: 'ct_scan_004.dcm', examDate: new Date(), examType: 'CT Abdomen' }
      ]
    },
    {
      date: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000),
      displayDate: '6 months ago',
      images: [
        { id: '5', url: 'assets/public/images/radio/radio5.jpg', filename: 'ct_scan_005.dcm', examDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), examType: 'MRI Brain' },
        { id: '6', url: 'assets/public/images/radio/radio6.JPG', filename: 'ct_scan_006.dcm', examDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), examType: 'MRI Brain' },
        { id: '7', url: 'assets/public/images/radio/radio7.JPG', filename: 'ct_scan_007.dcm', examDate: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000), examType: 'MRI Brain' }
      ]
    },
    {
      date: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000),
      displayDate: '1 year ago',
      images: [
        { id: '8', url: 'assets/public/images/radio/radio8.JPG', filename: 'ct_scan_008.dcm', examDate: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), examType: 'X-Ray Chest' },
        { id: '9', url: 'assets/public/images/radio/radio9.JPG', filename: 'ct_scan_009.dcm', examDate: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000), examType: 'X-Ray Chest' }
      ]
    }
  ];

  private defaultBlocks: VisualPatientBlock[] = [
    { id: '1', type: 'patient-info', title: 'Patient Information', visible: true },
    { id: '2', type: 'radiological-request', title: 'Radiological Request', visible: true },
    { id: '3', type: 'ai-summary', title: 'IA Summary', visible: true },
    { id: '4', type: 'radio-report', title: 'Last Radio Report Conclusion', visible: true },
    { id: '5', type: 'patient-records', title: 'Top 10 Patient Record Information', visible: true },
    { id: '6', type: 'calendar-map', title: 'Calendar Map', visible: true },
    { id: '7', type: 'images-preview', title: 'All Images preview', visible: true }
  ];

  private mockDepartments: Department[] = [
    { id: 'radiology', name: 'Radiology' },
    { id: 'neurology', name: 'Neurology' },
    { id: 'pulmonology', name: 'Pulmonology' },
    { id: 'gastroenterology', name: 'Gastroenterology' },
    { id: 'oncology', name: 'Oncology' },
    { id: 'orthopedics', name: 'Orthopedics' },
    { id: 'cardiology', name: 'Cardiology' },
    { id: 'emergency', name: 'Emergency' }
  ];

  private mockAnatomyRegions: AnatomyRegion[] = [
    { id: 'head-shoulder', name: 'Head - Shoulder' },
    { id: 'shoulder-arm', name: 'Shoulder - Upper Limb' },
    { id: 'arm-pelvis', name: 'Upper Limb - Pelvis' },
    { id: 'pelvis-leg', name: 'Pelvis - Lower Limb' },
    { id: 'leg-foot', name: 'Lower Limb - Foot' }
  ];

  getById(id: string): Observable<any> {
    return of(null).pipe(delay(200));
  }

  search(criteria: { query: string; page: number; pageSize: number }): Observable<any> {
    return of({ items: [], totalCount: 0 }).pipe(delay(200));
  }

  create(item: any): Observable<any> {
    return of(item).pipe(delay(200));
  }

  update(id: string, updates: any): Observable<any> {
    return of(updates).pipe(delay(200));
  }

  delete(id: string): Observable<boolean> {
    return of(true).pipe(delay(200));
  }

  getPatientInfo(examId?: string): Observable<PatientInfo> {
    if (examId) {
      // Si un examId est fourni, créer les informations patient basées sur l'examen
      return this.createPatientInfoFromExam(examId);
    }
    return of(this.mockPatientInfo).pipe(delay(200));
  }

  private createPatientInfoFromExam(examId: string): Observable<PatientInfo> {
    // Simuler la récupération des données d'examen
    // Dans une vraie application, ceci ferait un appel API
    const mockExamData = this.getMockExamData(examId);
    
    if (mockExamData) {
      const patientInfo: PatientInfo = {
        id: mockExamData.id,
        name: mockExamData.patientName,
        dateOfBirth: this.generateDateOfBirth(mockExamData.patientName),
        patientNumber: `P-2025-${mockExamData.id.padStart(6, '0')}`,
        examNumber: mockExamData.examId,
        gender: this.getGenderFromName(mockExamData.patientName),
        photo: this.getPatientImageByGender(this.getGenderFromName(mockExamData.patientName)),
        examType: mockExamData.examType,
        indication: mockExamData.indication
      };
      return of(patientInfo).pipe(delay(200));
    }
    
    return of(this.mockPatientInfo).pipe(delay(200));
  }

  private getMockExamData(examId: string): any {
    // Données d'examens simulées basées sur celles du ExamService
    const mockExams = [
      { id: '1', patientName: 'Jean Dupont', examId: '25091200872_01', examType: 'CT - Abdomen - 2025-09-12 09:05', indication: 'Follow-up scan for previously identified lesion in the upper right quadrant, patient reports mild discomfort.' },
      { id: '2', patientName: 'Marie Curie', examId: '25091200456_03', examType: 'MRI - Brain - 2025-09-12 08:30', indication: 'suspected tumor - FEMALE - 67y' },
      { id: '3', patientName: 'Louis Pasteur', examId: '25091200112_02', examType: 'X-RAY - Chest - 2025-09-12 07:45', indication: 'Routine check-up - MALE - 72y' },
      { id: '4', patientName: 'Claire Dubois', examId: '25091200789_04', examType: 'CT - Thorax - 2025-09-11 16:30', indication: 'Persistent cough evaluation - FEMALE - 58y' },
      { id: '5', patientName: 'Michel Leroy', examId: '25091200567_05', examType: 'Ultrasound - Abdomen - 2025-09-11 14:15', indication: 'Abdominal pain investigation - MALE - 62y' },
      { id: '6', patientName: 'Sylvie Moreau', examId: '25091200345_06', examType: 'MRI - Knee - 2025-09-10 10:20', indication: 'Sports injury assessment - FEMALE - 34y' },
      { id: '7', patientName: 'François Bernard', examId: '25091200123_07', examType: 'CT - Head - 2025-09-10 08:45', indication: 'Headache evaluation - MALE - 45y' },
      { id: '8', patientName: 'Isabelle Petit', examId: '25091200890_08', examType: 'Mammography - Bilateral - 2025-09-09 15:30', indication: 'Routine screening - FEMALE - 52y' },
      { id: '9', patientName: 'Robert Garnier', examId: '25091200456_09', examType: 'X-RAY - Spine - 2025-09-09 11:00', indication: 'Back pain evaluation - MALE - 67y' },
      { id: '10', patientName: 'Nathalie Roux', examId: '25091200234_10', examType: 'CT - Pelvis - 2025-09-08 13:45', indication: 'Pelvic pain investigation - FEMALE - 41y' },
      { id: '11', patientName: 'Thierry Blanc', examId: '25091200678_11', examType: 'MRI - Shoulder - 2025-09-08 09:30', indication: 'Rotator cuff injury - MALE - 55y' },
      { id: '12', patientName: 'Valérie Durand', examId: '25091200345_12', examType: 'Ultrasound - Thyroid - 2025-09-07 16:00', indication: 'Thyroid nodule evaluation - FEMALE - 48y' },
      { id: '13', patientName: 'Alain Mercier', examId: '25091200789_13', examType: 'CT - Abdomen - 2025-09-07 12:15', indication: 'Digestive symptoms evaluation - MALE - 59y' },
      { id: '14', patientName: 'Céline Fabre', examId: '25091200567_14', examType: 'MRI - Brain - 2025-09-06 14:30', indication: 'Migraine investigation - FEMALE - 36y' },
      { id: '15', patientName: 'Didier Lemoine', examId: '25091200123_15', examType: 'X-RAY - Hip - 2025-09-06 10:45', indication: 'Hip pain assessment - MALE - 71y' },
      { id: '16', patientName: 'Monique Girard', examId: '25091200890_16', examType: 'CT - Thorax - 2025-09-05 15:20', indication: 'Lung nodule follow-up - FEMALE - 64y' },
      { id: '17', patientName: 'Philippe Roussel', examId: '25091200456_17', examType: 'Ultrasound - Cardiac - 2025-09-05 11:30', indication: 'Cardiac function assessment - MALE - 68y' },
      { id: '18', patientName: 'Sophie Martin', examId: '25091200234_18', examType: 'MRI - Spine - 2025-09-11 14:20', indication: 'Lower back pain, suspected herniated disc - FEMALE - 45y' },
      { id: '19', patientName: 'Pierre Dubois', examId: '25091200345_19', examType: 'CT - Thorax - 2025-09-11 11:45', indication: 'Persistent cough, rule out pulmonary nodules - MALE - 58y' },
      { id: '20', patientName: 'Emma Rousseau', examId: '25091200456_20', examType: 'Mammography - Bilateral - 2025-09-11 09:30', indication: 'Routine screening mammography - FEMALE - 52y' },
      { id: '21', patientName: 'Antoine Moreau', examId: '25091200567_21', examType: 'CT - Head - 2025-09-10 16:15', indication: 'Post-surgical follow-up, brain tumor resection - MALE - 34y' },
      { id: '22', patientName: 'Isabelle Leroy', examId: '25091200678_22', examType: 'MRI - Pelvis - 2025-09-10 13:00', indication: 'Suspected endometriosis, pelvic pain - FEMALE - 29y' }
    ];
    
    return mockExams.find(exam => exam.examId === examId);
  }

  private getGenderFromName(name: string): 'M' | 'F' | 'Other' {
    // Noms masculins
    const maleNames = ['Jean', 'Louis', 'Michel', 'François', 'Robert', 'Thierry', 'Alain', 'Didier', 'Philippe', 'Pierre', 'Antoine'];
    // Noms féminins
    const femaleNames = ['Marie', 'Claire', 'Sylvie', 'Isabelle', 'Nathalie', 'Valérie', 'Céline', 'Monique', 'Sophie', 'Emma'];
    
    const firstName = name.split(' ')[0];
    
    if (maleNames.includes(firstName)) {
      return 'M';
    } else if (femaleNames.includes(firstName)) {
      return 'F';
    }
    
    return 'Other';
  }

  private generateDateOfBirth(name: string): Date {
    // Générer une date de naissance basée sur le nom pour la cohérence
    const hash = name.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const year = 1940 + Math.abs(hash % 60); // Entre 1940 et 2000
    const month = Math.abs(hash % 12);
    const day = 1 + Math.abs(hash % 28);
    
    return new Date(year, month, day);
  }

  getRadiologicalRequest(): Observable<RadiologicalRequest> {
    return of(this.mockRadiologicalRequest).pipe(delay(200));
  }

  getAISummary(): Observable<AISummary> {
    return of(this.mockAISummary).pipe(delay(200));
  }

  getRadioReport(): Observable<RadioReport> {
    return of(this.mockRadioReport).pipe(delay(200));
  }

  getPatientRecords(): Observable<PatientRecord[]> {
    return of([...this.mockPatientRecords]).pipe(delay(200));
  }

  getExamPoints(): Observable<ExamPoint[]> {
    return of([...this.mockExamPoints]).pipe(delay(200));
  }

  getImagesByDate(): Observable<ImagesByDate[]> {
    return of([...this.mockImagesByDate]).pipe(delay(200));
  }

  getDefaultBlocks(): Observable<VisualPatientBlock[]> {
    return of([...this.defaultBlocks]).pipe(delay(200));
  }

  getDepartments(): Observable<Department[]> {
    return of([...this.mockDepartments]).pipe(delay(200));
  }

  getAnatomyRegions(): Observable<AnatomyRegion[]> {
    return of([...this.mockAnatomyRegions]).pipe(delay(200));
  }

  getReportingData(): Observable<any> {
    const mockReportingData = {
      patient: {
        firstName: 'Jean',
        lastName: 'Dupont',
        dateOfBirth: new Date('1975-03-15'),
        address: '123 Rue de la Paix, 75001 Paris, France'
      },
      prescribingDoctor: {
        name: 'Dr. Marie Dubois',
        specialty: 'Oncologist',
        hospital: 'Clinique du Parc'
      },
      reportSections: {
        indication: 'Cancer staging, six months after chemotherapy',
        technicalInformation: 'CT scan of the abdomen with IV contrast. Slice thickness: 5mm. Reconstruction: axial, coronal, and sagittal planes.',
        report: 'The CT scan shows marked improvement compared to previous studies. The previously identified lesion in the upper right quadrant has decreased in size by approximately 40%.',
        conclusion: 'Significant improvement following chemotherapy treatment. No new metastatic lesions detected. Continue current treatment protocol.',
        billing: 'CT Abdomen with contrast - Code: 74177',
        findings: 'Liver, spleen, and kidneys appear normal. Lymph nodes are within normal limits. No suspicious lesions identified.'
      }
    };
    return of(mockReportingData).pipe(delay(200));
  }
}