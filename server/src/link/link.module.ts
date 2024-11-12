import { Module } from '@nestjs/common';
import { LinkService } from './link.service';
import { LinkController } from './link.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { LinkStats } from './entities/link-stats.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Link, LinkStats])],
  providers: [LinkService],
  controllers: [LinkController],
})
export class LinkModule {}
