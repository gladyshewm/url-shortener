import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { LinkStats } from './link-stats.entity';

@Entity()
export class Link {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  code: string;

  @Column()
  originalUrl: string;

  @OneToMany(() => LinkStats, (stats) => stats.link, { cascade: true })
  stats: LinkStats[];
}
