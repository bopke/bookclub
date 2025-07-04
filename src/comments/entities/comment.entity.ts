import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Book } from '../../books/entities/book.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  text: string;

  @Index()
  @ManyToOne(() => Book, (book) => book.comments, { onDelete: 'CASCADE' })
  book: Book;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
