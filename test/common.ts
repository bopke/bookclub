import { Book } from '../src/books/entities/book.entity';

export const exampleBook: Book = {
  id: '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
  title: 'Best book ever, look it up!',
  author: 'Nick Morgan',
  isbn: '9788301183165',
  numberOfPages: 320,
  rating: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
  comments: [],
};

export const nonexistentBookId: string = 'deadbeef-dead-beef-dead-deadbeefdead';
