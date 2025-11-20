export interface FieldType {
  id: string;
  name: string;
  description?: string;
  display_order: number;
  is_required: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FieldValue {
  id: string;
  field_type_id: string;
  name: string;
  code?: string;
  description?: string;
  display_order: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  field_type?: FieldType;
}

export interface FieldHierarchy {
  id: string;
  parent_field_type_id: string;
  child_field_type_id: string;
  is_required: boolean;
  created_at: string;
  parent_field_type?: FieldType;
  child_field_type?: FieldType;
}

export interface Subject {
  id: string;
  name: string;
  code?: string;
  description?: string;
  credits?: number;
  is_active: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
  field_values?: FieldValue[];
}

export interface PYQPaper {
  id: string;
  title: string;
  subject_id?: string;
  year: number;
  file_url: string;
  file_size?: number;
  difficulty_level?: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  download_count: number;
  is_active: boolean;
  metadata: Record<string, any>;
  uploaded_by?: string;
  uploaded_at: string;
  updated_at: string;
  subject?: Subject;
  field_values?: FieldValue[];
}

export interface SubjectFieldMapping {
  id: string;
  subject_id: string;
  field_value_id: string;
  created_at: string;
}

export interface PaperFieldMapping {
  id: string;
  paper_id: string;
  field_value_id: string;
  created_at: string;
}

export interface DynamicFieldForm {
  selectedFields: Record<string, string>;
  subject_id?: string;
  title: string;
  year: number;
  difficulty_level?: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
  file?: File;
}

export interface BulkImportData {
  field_types?: FieldType[];
  field_values?: FieldValue[];
  subjects?: Subject[];
  papers?: PYQPaper[];
}

export interface AdminStats {
  total_papers: number;
  total_subjects: number;
  total_field_types: number;
  total_field_values: number;
  recent_uploads: number;
  popular_subjects: Array<{
    subject: Subject;
    paper_count: number;
  }>;
}