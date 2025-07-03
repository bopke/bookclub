//Causes trouble in expect(service.create)[...]
/* eslint-disable @typescript-eslint/unbound-method */
import { NotFoundException } from '@nestjs/common';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBook.dto';
import { exampleBook, nonexistentBookId } from '../../test/common';
import { mock, MockProxy } from 'jest-mock-extended';

describe('BookController', () => {
  let controller: BooksController;
  let service: MockProxy<BooksService>;

  beforeEach(() => {
    service = mock<BooksService>();
    controller = new BooksController(service);
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
    service.create.mockResolvedValue(exampleBook);

    const result = await controller.create(dto);
    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(exampleBook);
  });

  it('should return paginated books', async () => {
    const mockResult = {
      data: [exampleBook],
      total: 1,
      page: 1,
      limit: 10,
    };

    service.findAll.mockResolvedValue(mockResult);

    const result = await controller.findAll('1', '10');

    expect(service.findAll).toHaveBeenCalledWith(1, 10);
    expect(result).toEqual(mockResult);
  });

  it('should return one book', async () => {
    service.findOne.mockResolvedValue(exampleBook);

    const result = await controller.findOne(exampleBook.id);
    expect(service.findOne).toHaveBeenCalledWith(exampleBook.id);
    expect(result).toEqual(exampleBook);
  });

  it('should update a book partially', async () => {
    const dto: UpdateBookDto = { title: 'Updated Title' };
    const updatedBook = { ...exampleBook, ...dto };
    service.update.mockResolvedValue(updatedBook);

    const result = await controller.update(exampleBook.id, dto);
    expect(service.update).toHaveBeenCalledWith(exampleBook.id, dto);
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
    service.update.mockResolvedValue({ ...exampleBook, ...dto });

    const result = await controller.replace(exampleBook.id, dto);
    expect(service.update).toHaveBeenCalledWith(exampleBook.id, dto);
    expect(result.title).toBe('Replaced Book');
  });

  it('should remove a book', async () => {
    service.remove.mockResolvedValue(undefined);

    await expect(controller.remove(exampleBook.id)).resolves.toBeUndefined();
    expect(service.remove).toHaveBeenCalledWith(exampleBook.id);
  });

  it('should throw NotFoundException if book not found', async () => {
    service.findOne.mockRejectedValue(new NotFoundException());

    await expect(controller.findOne(nonexistentBookId)).rejects.toThrow(
      NotFoundException,
    );
  });
});
