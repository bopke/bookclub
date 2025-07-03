import { Controller, Post, Param, Body, Get, Query } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';

@Controller('books/:bookId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  create(
    @Param('bookId') bookId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentsService.create(bookId, createCommentDto);
  }

  @Get()
  findAll(
    @Param('bookId') bookId: string,
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<{ data: Comment[]; total: number; page: number; limit: number }> {
    return this.commentsService.findAllForBook(
      bookId,
      Number(page),
      Number(limit),
    );
  }
}
