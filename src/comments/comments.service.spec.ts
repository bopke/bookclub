//Causes trouble in expect(bookRepo.findOne)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { Book } from '../books/entities/book.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { mock, MockProxy } from 'jest-mock-extended';
import { exampleBook, nonexistentBookId } from '../../test/common';

describe('CommentsService', () => {
  let service: CommentsService;
  let commentRepo: MockProxy<Repository<Comment>>;
  let bookRepo: MockProxy<Repository<Book>>;

  beforeEach(() => {
    bookRepo = mock<Repository<Book>>();
    commentRepo = mock<Repository<Comment>>();
    service = new CommentsService(commentRepo, bookRepo);
  });

  it('should create a comment for an existing book', async () => {
    const commentText = 'Greatest book!';
    const mockComment = { text: commentText, book: exampleBook } as Comment;

    bookRepo.findOne.mockResolvedValue(exampleBook);
    commentRepo.create.mockReturnValue(mockComment);
    commentRepo.save.mockResolvedValue(mockComment);

    const result = await service.create(exampleBook.id, { text: commentText });

    expect(bookRepo.findOne).toHaveBeenCalledWith({
      where: { id: exampleBook.id },
    });
    expect(commentRepo.create).toHaveBeenCalledWith({
      text: commentText,
      book: exampleBook,
    });
    expect(commentRepo.save).toHaveBeenCalledWith(mockComment);
    expect(result).toEqual(mockComment);
  });

  it('should throw NotFoundException if book does not exist', async () => {
    bookRepo.findOne.mockResolvedValue(null);

    await expect(
      service.create(exampleBook.id, { text: 'OK Book' }),
    ).rejects.toThrow(NotFoundException);
  });

  it('should return paginated comments for an existing book', async () => {
    const mockComments = [
      { id: 'comment-1', text: 'First comment' },
      { id: 'comment-2', text: 'Second comment' },
    ] as Comment[];
    bookRepo.findOne.mockResolvedValue(exampleBook);
    commentRepo.findAndCount.mockResolvedValue([mockComments, 2]);

    const result = await service.findAllForBook(exampleBook.id, 1, 10);

    expect(bookRepo.findOne).toHaveBeenCalledWith({
      where: { id: exampleBook.id },
    });
    expect(commentRepo.findAndCount).toHaveBeenCalledWith({
      where: { book: { id: exampleBook.id } },
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
    bookRepo.findOne.mockResolvedValue(null);

    await expect(
      service.findAllForBook(nonexistentBookId, 1, 10),
    ).rejects.toThrow(NotFoundException);
  });
});
