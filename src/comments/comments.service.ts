import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Book } from '../books/entities/book.entity';
import { CreateCommentDto } from './dto/createComment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
  ) {}

  async create(
    bookId: string,
    createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book ${bookId} not found`);
    }
    const comment = this.commentRepository.create({
      text: createCommentDto.text,
      book,
    });
    return this.commentRepository.save(comment);
  }

  async findAllForBook(
    bookId: string,
    page = 1,
    limit = 10,
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number }> {
    const book = await this.bookRepository.findOne({ where: { id: bookId } });
    if (!book) {
      throw new NotFoundException(`Book ${bookId} not found`);
    }

    const [comments, total] = await this.commentRepository.findAndCount({
      where: { book: { id: bookId } },
      order: { createdAt: 'ASC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return { data: comments, total, page, limit };
  }
}
