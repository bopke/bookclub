//Causes trouble in expect(service.create)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { BooksService } from './books.service';
import { DeleteResult, Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { NotFoundException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('BooksService', () => {
  let service: BooksService;
  let repo: MockProxy<Repository<Book>>;

  const exampleBook: Book = {
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

  beforeEach(() => {
    repo = mock<Repository<Book>>();
    service = new BooksService(repo);
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
      repo.create.mockReturnValue(exampleBook);
      repo.save.mockResolvedValue(exampleBook);

      const result = await service.create(dto);

      expect(repo.create).toHaveBeenCalledWith(dto);
      expect(repo.save).toHaveBeenCalledWith(exampleBook);
      expect(result).toEqual(exampleBook);
    });
  });

  describe('findAll', () => {
    it('should return paginated books', async () => {
      repo.findAndCount.mockResolvedValue([[exampleBook], 1]);

      const result = await service.findAll(1, 10);

      expect(repo.findAndCount).toHaveBeenCalledWith({
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
      repo.findOneBy.mockResolvedValue(exampleBook);

      const result = await service.findOne(exampleBook.id);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: exampleBook.id });
      expect(result).toEqual(exampleBook);
    });

    it('should throw NotFoundException if book not found', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'nonexistent-id' });
    });
  });

  describe('update', () => {
    it('should update an existing book', async () => {
      const updatedData = { title: 'Updated Title' };
      repo.findOneBy.mockResolvedValue(exampleBook);
      repo.save.mockResolvedValue({ ...exampleBook, ...updatedData });

      const result = await service.update(exampleBook.id, updatedData);

      expect(repo.findOneBy).toHaveBeenCalledWith({ id: exampleBook.id });
      expect(repo.save).toHaveBeenCalledWith({
        ...exampleBook,
        ...updatedData,
      });
      expect(result).toEqual({ ...exampleBook, ...updatedData });
    });

    it('should throw NotFoundException if book does not exist', async () => {
      repo.findOneBy.mockResolvedValue(null);

      await expect(service.update('nonexistent-id', {})).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findOneBy).toHaveBeenCalledWith({ id: 'nonexistent-id' });
    });
  });

  describe('remove', () => {
    it('should remove an existing book', async () => {
      repo.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      await service.remove(exampleBook.id);

      expect(repo.delete).toHaveBeenCalledWith(exampleBook.id);
    });

    it('should throw NotFoundException if book does not exist', async () => {
      repo.delete.mockResolvedValue({ affected: 0 } as DeleteResult);

      await expect(service.remove('nonexistent-id')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.delete).toHaveBeenCalledWith('nonexistent-id');
    });
  });
});
