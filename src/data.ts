import { ClassData, Student } from './types';

export const CLASSES: ClassData[] = [
  {
    id: 1,
    books: [
      { id: '1-1', name: 'Thafseer', price: 45 },
      { id: '1-2', name: 'Fiqh', price: 35 },
      { id: '1-3', name: 'Akhlaq', price: 30 },
      { id: '1-4', name: 'Lisan', price: 40 },
    ],
  },
  {
    id: 3,
    books: [
      { id: '3-1', name: 'Thafseer', price: 55 },
      { id: '3-2', name: 'Fiqh', price: 45 },
      { id: '3-3', name: 'Akhlaq', price: 40 },
      { id: '3-4', name: 'Thareeq', price: 50 },
      { id: '3-5', name: 'Lisan', price: 45 },
    ],
  },
  {
    id: 4,
    books: [
      { id: '4-1', name: 'Thafseer', price: 60 },
      { id: '4-2', name: 'Fiqh', price: 50 },
      { id: '4-3', name: 'Akhlaq', price: 45 },
      { id: '4-4', name: 'Thareeq', price: 55 },
      { id: '4-5', name: 'Lisan', price: 50 },
    ],
  },
  {
    id: 5,
    books: [
      { id: '5-1', name: 'Thafseer', price: 65 },
      { id: '5-2', name: 'Fiqh', price: 55 },
      { id: '5-3', name: 'Akhlaq', price: 50 },
      { id: '5-4', name: 'Thareeq', price: 60 },
      { id: '5-5', name: 'Lisan', price: 55 },
    ],
  },
  {
    id: 6,
    books: [
      { id: '6-1', name: 'Thafseer', price: 70 },
      { id: '6-2', name: 'Fiqh', price: 60 },
      { id: '6-3', name: 'Akhlaq', price: 55 },
      { id: '6-4', name: 'Thareeq', price: 65 },
      { id: '6-5', name: 'Lisan', price: 60 },
    ],
  },
  {
    id: 7,
    books: [
      { id: '7-1', name: 'Thafseer', price: 75 },
      { id: '7-2', name: 'Fiqh', price: 65 },
      { id: '7-3', name: 'Akhlaq', price: 60 },
      { id: '7-4', name: 'Thareeq', price: 70 },
      { id: '7-5', name: 'Lisan', price: 65 },
    ],
  },
];

export const STUDENTS: Student[] = [
  { id: 's1', name: 'Ahmed', classId: 1 },
  { id: 's2', name: 'Fathima', classId: 1 },
  { id: 's3', name: 'Zainab', classId: 3 },
  { id: 's4', name: 'Ibrahim', classId: 3 },
  { id: 's5', name: 'Aisha', classId: 4 },
  { id: 's6', name: 'Yusuf', classId: 4 },
  { id: 's7', name: 'Maryam', classId: 5 },
  { id: 's8', name: 'Omar', classId: 5 },
  { id: 's9', name: 'Khadija', classId: 6 },
  { id: 's10', name: 'Ali', classId: 6 },
  { id: 's11', name: 'Hassan', classId: 7 },
  { id: 's12', name: 'Hussein', classId: 7 },
];
