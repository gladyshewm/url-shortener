import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Link } from './link.entity';

@Entity()
export class LinkStats {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  accessedAt: Date;

  @Column()
  userAgent: string;

  @Column()
  ipAddress: string;

  @ManyToOne(() => Link, (link) => link.stats)
  link: Link;
}
