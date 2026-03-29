export interface Book {
  id: string;
  name: string;
  price: number;
}

export interface Student {
  id: string;
  name: string;
  classId: number;
}

export interface ClassData {
  id: number;
  books: Book[];
}

export interface Order {
  id: string;
  studentId: string;
  bookIds: string[];
  totalPrice: number;
  date: string;
}
