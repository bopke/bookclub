//Causes trouble in expect(bookRepo.findOne)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { CommentsService } from './comments.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Comment } from './entities/comment.entity';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: jest.Mocked<Repository<Comment>>;
  let bookRepo: jest.Mocked<Repository<Book>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentsService,
        {
          provide: getRepositoryToken(Comment),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Book),
          useValue: { findOne: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<CommentsService>(CommentsService);
    commentRepo = module.get(getRepositoryToken(Comment));
    bookRepo = module.get(getRepositoryToken(Book));
  });

  it('should create a comment for an existing book', async () => {
    const bookId = '224e0b9d-1f55-4599-ab5b-2e997a8a4196';
    const book = { id: bookId } as Book;
    const commentText = 'Greatest book!';
    const mockComment = { text: commentText, book } as Comment;

    bookRepo.findOne.mockResolvedValue(book);
    commentRepo.create.mockReturnValue(mockComment);
    commentRepo.save.mockResolvedValue(mockComment);

    const result = await service.create(bookId, { text: commentText });

    expect(bookRepo.findOne).toHaveBeenCalledWith({ where: { id: bookId } });
    expect(commentRepo.create).toHaveBeenCalledWith({
      text: commentText,
      book,
    });
    expect(commentRepo.save).toHaveBeenCalledWith(mockComment);
    expect(result).toEqual(mockComment);
  });

  it('should throw NotFoundException if book does not exist', async () => {
    const bookId = '224e0b9d-1f55-4599-ab5b-2e997a8a4196';
    bookRepo.findOne.mockResolvedValue(null);

    await expect(service.create(bookId, { text: 'OK Book' })).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should return paginated comments for an existing book', async () => {
    const bookId = 'book-123';
    const mockBook = { id: bookId } as Book;
    const mockComments = [
      { id: 'comment-1', text: 'First comment' },
      { id: 'comment-2', text: 'Second comment' },
    ] as Comment[];
    bookRepo.findOne.mockResolvedValue(mockBook);
    commentRepo.findAndCount.mockResolvedValue([mockComments, 2]);

    const result = await service.findAllForBook(bookId, 1, 10);

    expect(bookRepo.findOne).toHaveBeenCalledWith({ where: { id: bookId } });
    expect(commentRepo.findAndCount).toHaveBeenCalledWith({
      where: { book: { id: bookId } },
      order: { createdAt: 'ASC' },
      skip: 0,
      take: 10,
    });
    expect(result).toEqual({
      data: mockComments,
      total: 2,
      page: 1,
      limit: 10,
    });
  });

  it('should throw NotFoundException if the book does not exist', async () => {
    const bookId = '224e0b9d-1f55-4599-ab5b-2e997a8a4196';
    bookRepo.findOne.mockResolvedValue(null);

    await expect(service.findAllForBook(bookId, 1, 10)).rejects.toThrow(
      NotFoundException,
    );
  });
});
