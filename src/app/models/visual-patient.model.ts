export interface PatientInfo {
  id: string;
  name: string;
  dateOfBirth: Date;
  patientNumber: string;
  examNumber: string;
  gender: 'M' | 'F' | 'Other';
  photo: string;
}

export interface RadiologicalRequest {
  description: string;
}

export interface AISummary {
  medicalSector: string;
  status: 'Hospitalized' | 'Outpatient';
  healthSummary: string;
}

export interface RadioReport {
  conclusion: string;
}

export interface PatientRecord {
  id: string;
  date: Date;
  examName: string;
  description: string;
}

export interface AnatomicalRegion {
  name: string;
  color: string;
}

export interface ExamPoint {
  id: string;
  date: Date;
  examName: string;
  anatomicalRegion: string;
  description: string;
  department: string;
  isFuture?: boolean;
}

export interface MedicalImage {
  id: string;
  url: string;
  filename: string;
  examDate?: Date;
  examType?: string;
}

export interface ImagesByDate {
  date: Date;
  displayDate: string;
  images: MedicalImage[];
}

export interface VisualPatientBlock {
  id: string;
  type: 'patient-info' | 'radiological-request' | 'ai-summary' | 'radio-report' | 'patient-records' | 'calendar-map' | 'images-preview';
  title: string;
  visible: boolean;
}

export interface GraphicFilter {
  view: 'department' | 'anatomy';
  department: string;
  anatomy: string;
  timeline: string;
}

export interface Department {
  id: string;
  name: string;
}

export interface AnatomyRegion {
  id: string;
  name: string;
}

export interface ReportingData {
  patient: {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    address: string;
  };
  prescribingDoctor: {
    name: string;
    specialty: string;
    hospital: string;
  };
  reportSections: {
    indication: string;
    technicalInformation: string;
    report: string;
    conclusion: string;
    billing: string;
    findings: string;
  };
}