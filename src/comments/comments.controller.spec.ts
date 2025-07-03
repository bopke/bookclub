// Causing trouble with test
/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */

import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { exampleBook } from '../../test/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: MockProxy<CommentsService>;

  beforeEach(() => {
    service = mock<CommentsService>();
    controller = new CommentsController(service);
  });

  it('should call service.create with bookId and dto and return the created comment', async () => {
    const createDto: CreateCommentDto = { text: 'Great read!' };
    const mockComment: Comment = {
      id: '6c5b5296-0e9b-48ab-adfe-9ffc9926564e',
      text: createDto.text,
      book: {} as any,
      createdAt: new Date(),
    };

    service.create.mockResolvedValue(mockComment);

    const result = await controller.create(exampleBook.id, createDto);

    expect(service.create).toHaveBeenCalledWith(exampleBook.id, createDto);
    expect(result).toEqual(mockComment);
  });

  it('should return paginated comments', async () => {
    const mockResult = {
      data: [{ id: 'comment-1', text: 'Test' }] as Comment[],
      total: 1,
      page: 1,
      limit: 10,
    };

    service.findAllForBook.mockResolvedValue(mockResult);

    const result = await controller.findAll(exampleBook.id, '1', '10');

    expect(service.findAllForBook).toHaveBeenCalledWith(exampleBook.id, 1, 10);
    expect(result).toEqual(mockResult);
  });
});
