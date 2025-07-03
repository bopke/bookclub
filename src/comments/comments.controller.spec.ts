// Causing trouble with test
/* eslint-disable @typescript-eslint/unbound-method, @typescript-eslint/no-unsafe-assignment */

import { Test, TestingModule } from '@nestjs/testing';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';

describe('CommentsController', () => {
  let controller: CommentsController;
  let service: jest.Mocked<CommentsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [
        {
          provide: CommentsService,
          useValue: {
            create: jest.fn(),
            findAllForBook: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get(CommentsService);
  });

  it('should call service.create with bookId and dto and return the created comment', async () => {
    const bookId = '224e0b9d-1f55-4599-ab5b-2e997a8a4196';
    const createDto: CreateCommentDto = { text: 'Great read!' };
    const mockComment: Comment = {
      id: '6c5b5296-0e9b-48ab-adfe-9ffc9926564e',
      text: createDto.text,
      book: {} as any,
      createdAt: new Date(),
    };

    service.create.mockResolvedValue(mockComment);

    const result = await controller.create(bookId, createDto);

    expect(service.create).toHaveBeenCalledWith(bookId, createDto);
    expect(result).toEqual(mockComment);
  });

  it('should return paginated comments', async () => {
    const bookId = 'book-uuid-123';
    const mockResult = {
      data: [{ id: 'comment-1', text: 'Test' }] as Comment[],
      total: 1,
      page: 1,
      limit: 10,
    };

    service.findAllForBook.mockResolvedValue(mockResult);

    const result = await controller.findAll(bookId, '1', '10');

    expect(service.findAllForBook).toHaveBeenCalledWith(bookId, 1, 10);
    expect(result).toEqual(mockResult);
  });
});
