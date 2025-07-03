import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Book } from './entities/book.entity';
import { CreateBookDto } from './dto/CreateBook.dto';
import { UpdateBookDto } from './dto/UpdateBook.dto';
import { Comment } from '../comments/entities/comment.entity';

@Injectable()
export class BooksService {
  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    const book = this.bookRepository.create(createBookDto);
    return this.bookRepository.save(book);
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{
    data: Book[];
    total: number;
    page: number;
    limit: number;
  }> {
    const [books, total] = await this.bookRepository.findAndCount({
      order: { createdAt: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Fetch latest 5 comments for each book
    const booksWithComments = await Promise.all(
      books.map(async (book) => {
        const comments = await this.get5LastCommentsForBook(book.id);
        return { ...book, comments };
      }),
    );

    return { data: booksWithComments, total, page, limit };
  }

  async findOne(id: string): Promise<Book> {
    const book = await this.bookRepository.findOneBy({ id });
    if (!book) {
      throw new NotFoundException(`Book ${id} not found`);
    }
    book.comments = await this.get5LastCommentsForBook(book.id);
    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    const book = await this.findOne(id);
    Object.assign(book, updateBookDto);
    return this.bookRepository.save(book);
  }

  async remove(id: string): Promise<void> {
    const result = await this.bookRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Book ${id} not found`);
    }
  }

  private async get5LastCommentsForBook(id: string): Promise<Comment[]> {
    return (
      (await this.commentRepository.find({
        where: { book: { id } },
        order: { createdAt: 'DESC' },
        take: 5,
      })) || []
    );
  }
}
