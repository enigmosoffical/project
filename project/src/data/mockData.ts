import { PYQPaper, ExamType } from '../types';

export const examTypes: ExamType[] = [
  {
    id: 'jee',
    name: 'JEE (Main & Advanced)',
    icon: '⚛️',
    subjects: [
      { id: 'physics', name: 'Physics', papers: [] },
      { id: 'chemistry', name: 'Chemistry', papers: [] },
      { id: 'mathematics', name: 'Mathematics', papers: [] }
    ]
  },
  {
    id: 'neet',
    name: 'NEET',
    icon: '🩺',
    subjects: [
      { id: 'physics', name: 'Physics', papers: [] },
      { id: 'chemistry', name: 'Chemistry', papers: [] },
      { id: 'biology', name: 'Biology', papers: [] }
    ]
  },
  {
    id: 'cbse',
    name: 'CBSE Board',
    icon: '📚',
    subjects: [
      { id: 'physics', name: 'Physics', papers: [] },
      { id: 'chemistry', name: 'Chemistry', papers: [] },
      { id: 'mathematics', name: 'Mathematics', papers: [] },
      { id: 'english', name: 'English', papers: [] }
    ]
  },
  {
    id: 'gate',
    name: 'GATE',
    icon: '🏛️',
    subjects: [
      { id: 'cs', name: 'Computer Science', papers: [] },
      { id: 'ee', name: 'Electrical Engineering', papers: [] },
      { id: 'me', name: 'Mechanical Engineering', papers: [] }
    ]
  }
];

export const mockPapers: PYQPaper[] = [
  {
    id: '1',
    title: 'JEE Main Physics 2024',
    examType: 'JEE (Main & Advanced)',
    subject: 'Physics',
    year: 2024,
    downloadUrl: '#',
    viewUrl: '#',
    tags: ['Mechanics', 'Thermodynamics', 'High-frequency'],
    difficulty: 'Hard',
    downloads: 15420,
    size: '2.3 MB'
  },
  {
    id: '2',
    title: 'NEET Biology 2024',
    examType: 'NEET',
    subject: 'Biology',
    year: 2024,
    downloadUrl: '#',
    viewUrl: '#',
    tags: ['Genetics', 'Cell Biology', 'High-frequency'],
    difficulty: 'Medium',
    downloads: 12850,
    size: '1.8 MB'
  },
  {
    id: '3',
    title: 'CBSE Mathematics 2024',
    examType: 'CBSE Board',
    subject: 'Mathematics',
    year: 2024,
    downloadUrl: '#',
    viewUrl: '#',
    tags: ['Calculus', 'Algebra', 'Repeated-topic'],
    difficulty: 'Medium',
    downloads: 8950,
    size: '1.5 MB'
  },
  {
    id: '4',
    title: 'GATE Computer Science 2024',
    examType: 'GATE',
    subject: 'Computer Science',
    year: 2024,
    downloadUrl: '#',
    viewUrl: '#',
    tags: ['Algorithms', 'Data Structures', 'High-frequency'],
    difficulty: 'Hard',
    downloads: 6420,
    size: '2.1 MB'
  }
];

export const quickLinks = [
  { name: 'JEE Main 2024', count: 45, link: '/repository?exam=jee&year=2024' },
  { name: 'NEET 2024', count: 38, link: '/repository?exam=neet&year=2024' },
  { name: 'CBSE Class 12', count: 120, link: '/repository?exam=cbse&year=2024' },
  { name: 'GATE CS', count: 28, link: '/repository?exam=gate&subject=cs' }
];