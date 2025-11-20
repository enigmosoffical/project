export interface PYQPaper {
  id: string;
  title: string;
  examType: string;
  subject: string;
  year: number;
  downloadUrl: string;
  viewUrl: string;
  tags: string[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  downloads: number;
  size: string;
}

export interface ExamType {
  id: string;
  name: string;
  subjects: Subject[];
  icon: string;
}

export interface Subject {
  id: string;
  name: string;
  papers: PYQPaper[];
}

export interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

export interface FilterState {
  examType: string;
  subject: string;
  year: string;
  difficulty: string;
}