//Causes trouble in expect(service.create)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBook.dto';

const mockBook = {
  id: '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
  title: 'Best book ever, look it up!',
  author: 'Nick Morgan',
  isbn: '9788301183165',
  numberOfPages: 320,
  rating: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('BookController', () => {
  let controller: BooksController;
  let service: BooksService;

  const mockBookService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BooksController],
      providers: [
        {
          provide: BooksService,
          useValue: mockBookService,
        },
      ],
    }).compile();

    controller = module.get<BooksController>(BooksController);
    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a book', async () => {
    const dto: CreateBookDto = {
      title: 'Best book ever, look it up!',
      author: 'Nick Morgan',
      isbn: '9788301183165',
      numberOfPages: 320,
      rating: 5,
    };
    mockBookService.create.mockResolvedValue(mockBook);

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(mockBook);
  });

  it('should return all books', async () => {
    mockBookService.findAll.mockResolvedValue([mockBook]);

    const result = await controller.findAll();
    expect(service.findAll).toHaveBeenCalled();
    expect(result).toEqual([mockBook]);
  });

  it('should return one book', async () => {
    mockBookService.findOne.mockResolvedValue(mockBook);

    const result = await controller.findOne(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    );
    expect(service.findOne).toHaveBeenCalledWith(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    );
    expect(result).toEqual(mockBook);
  });

  it('should update a book partially', async () => {
    const dto: UpdateBookDto = { title: 'Updated Title' };
    const updatedBook = { ...mockBook, ...dto };
    mockBookService.update.mockResolvedValue(updatedBook);

    const result = await controller.update(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
      dto,
    );
    expect(service.update).toHaveBeenCalledWith(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
      dto,
    );
    expect(result.title).toBe('Updated Title');
  });

  it('should replace a book', async () => {
    const dto: CreateBookDto = {
      title: 'Replaced Book',
      author: 'Nick Morgan',
      isbn: '9788301183165',
      numberOfPages: 320,
      rating: 5,
    };
    mockBookService.update.mockResolvedValue({ ...mockBook, ...dto });

    const result = await controller.replace(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
      dto,
    );
    expect(service.update).toHaveBeenCalledWith(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
      dto,
    );
    expect(result.title).toBe('Replaced Book');
  });

  it('should remove a book', async () => {
    mockBookService.remove.mockResolvedValue(undefined);

    await expect(
      controller.remove('224e0b9d-1f55-4599-ab5b-2e997a8a4196'),
    ).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    );
  });

  it('should throw NotFoundException if book not found', async () => {
    mockBookService.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
