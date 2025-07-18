//Causes trouble in expect(service.create)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { BooksService } from './books.service';
import { DeleteResult, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { NotFoundException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';
import { Comment } from '../comments/entities/comment.entity';
import { exampleBook, nonexistentBookId } from '../../test/common';

describe('BooksService', () => {
  let service: BooksService;
  let bookRepo: MockProxy<Repository<Book>>;
  let commentRepo: MockProxy<Repository<Comment>>;

  beforeEach(() => {
    bookRepo = mock<Repository<Book>>();
    commentRepo = mock<Repository<Comment>>();
    service = new BooksService(bookRepo, commentRepo);
  });

  describe('create', () => {
    it('should create and save a new book', async () => {
      const dto = {
        title: exampleBook.title,
        author: exampleBook.author,
        isbn: exampleBook.isbn,
        numberOfPages: exampleBook.numberOfPages,
        rating: exampleBook.rating,
      };
      bookRepo.create.mockReturnValue(exampleBook);
      bookRepo.save.mockResolvedValue(exampleBook);

      const result = await service.create(dto);

      expect(bookRepo.create).toHaveBeenCalledWith(dto);
      expect(bookRepo.save).toHaveBeenCalledWith(exampleBook);
      expect(result).toEqual(exampleBook);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      bookRepo.findAndCount.mockResolvedValue([[exampleBook], 1]);

      const result = await service.findAll(1, 10);

      expect(bookRepo.findAndCount).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        skip: 0,
        take: 10,
      });
      expect(result).toEqual({
        data: [exampleBook],
        total: 1,
        page: 1,
        limit: 10,
      });
    });
  });

  describe('findOne', () => {
    it('should return a book by ID', async () => {
      bookRepo.findOneBy.mockResolvedValue(exampleBook);

      const result = await service.findOne(exampleBook.id);

      expect(bookRepo.findOneBy).toHaveBeenCalledWith({ id: exampleBook.id });
      expect(result).toEqual(exampleBook);
    });

    it('should throw NotFoundException if book not found', async () => {
      bookRepo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne(nonexistentBookId)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookRepo.findOneBy).toHaveBeenCalledWith({
        id: nonexistentBookId,
      });
    });
  });

  describe('update', () => {
    it('should update an existing book', async () => {
      const updatedData = { title: 'Updated Title' };
      bookRepo.findOneBy.mockResolvedValue(exampleBook);
      bookRepo.save.mockResolvedValue({ ...exampleBook, ...updatedData });

      const result = await service.update(exampleBook.id, updatedData);

      expect(bookRepo.findOneBy).toHaveBeenCalledWith({ id: exampleBook.id });
      expect(bookRepo.save).toHaveBeenCalledWith({
        ...exampleBook,
        ...updatedData,
      });
      expect(result).toEqual({ ...exampleBook, ...updatedData });
    });

    it('should throw NotFoundException if book does not exist', async () => {
      bookRepo.findOneBy.mockResolvedValue(null);

      await expect(service.update(nonexistentBookId, {})).rejects.toThrow(
        NotFoundException,
      );
      expect(bookRepo.findOneBy).toHaveBeenCalledWith({
        id: nonexistentBookId,
      });
    });
  });

  describe('remove', () => {
    it('should remove an existing book', async () => {
      bookRepo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(exampleBook.id);

      expect(bookRepo.delete).toHaveBeenCalledWith(exampleBook.id);
    });

    it('should throw NotFoundException if book does not exist', async () => {
      bookRepo.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove(nonexistentBookId)).rejects.toThrow(
        NotFoundException,
      );
      expect(bookRepo.delete).toHaveBeenCalledWith(nonexistentBookId);
    });
  });
});
