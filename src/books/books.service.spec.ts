import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Book } from './entities/book.entity';
import { BooksService } from './books.service';

const testBook = {
  id: '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
  title: 'Best book ever, look it up!',
  author: 'Nick Morgan',
  isbn: '9788301183165',
  numberOfPages: 320,
  rating: 5,
};

describe('BookService', () => {
  let service: BooksService;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BooksService,
        {
          provide: getRepositoryToken(Book),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<BooksService>(BooksService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a book', async () => {
    mockRepository.create.mockReturnValue(testBook);
    mockRepository.save.mockResolvedValue(testBook);

    const result = await service.create(testBook);
    expect(mockRepository.create).toHaveBeenCalledWith(testBook);
    expect(mockRepository.save).toHaveBeenCalledWith(testBook);
    expect(result).toEqual(testBook);
  });

  it('should find all books', async () => {
    mockRepository.find.mockResolvedValue([testBook]);

    const result = await service.findAll();
    expect(mockRepository.find).toHaveBeenCalled();
    expect(result).toEqual([testBook]);
  });

  it('should find one book by id', async () => {
    mockRepository.findOneBy.mockResolvedValue(testBook);

    const result = await service.findOne(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    );
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      id: '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    });
    expect(result).toEqual(testBook);
  });

  it('should throw NotFoundException if book not found', async () => {
    mockRepository.findOneBy.mockResolvedValue(null);

    await expect(service.findOne('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('should update a book', async () => {
    const updateDto = { title: 'Updated title' };
    mockRepository.findOneBy.mockResolvedValue({ ...testBook });
    mockRepository.save.mockResolvedValue({ ...testBook, ...updateDto });

    const result = await service.update(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
      updateDto,
    );
    expect(mockRepository.findOneBy).toHaveBeenCalledWith({
      id: '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    });
    expect(mockRepository.save).toHaveBeenCalledWith(
      expect.objectContaining(updateDto),
    );
    expect(result.title).toBe('Updated title');
  });

  it('should remove a book', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 1 });

    await expect(
      service.remove('224e0b9d-1f55-4599-ab5b-2e997a8a4196'),
    ).resolves.toBeUndefined();
    expect(mockRepository.delete).toHaveBeenCalledWith(
      '224e0b9d-1f55-4599-ab5b-2e997a8a4196',
    );
  });

  it('should throw NotFoundException if book to remove does not exist', async () => {
    mockRepository.delete.mockResolvedValue({ affected: 0 });

    await expect(service.remove('invalid-id')).rejects.toThrow(
      NotFoundException,
    );
  });
});
