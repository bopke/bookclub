import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
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

  @ManyToOne(() => Book, (book) => book.comments, { onDelete: 'CASCADE' })
  book: Book;

  @CreateDateColumn()
  createdAt: Date;
}
