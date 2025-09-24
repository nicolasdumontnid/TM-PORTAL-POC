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

  private getRandomPatientImage(): string {
    // Liste des images disponibles dans le dossier patient
    const patientImages = [
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
    
    // Sélection aléatoire
    const randomIndex = Math.floor(Math.random() * patientImages.length);
    return patientImages[randomIndex];
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

  getPatientInfo(): Observable<PatientInfo> {
    return of(this.mockPatientInfo).pipe(delay(200));
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