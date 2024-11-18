import { Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';
import { customAlphabet } from 'nanoid';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { ConfigService } from '@nestjs/config';
import { LinkStats } from './entities/link-stats.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(
    @InjectRepository(Link) private linkRepository: Repository<Link>,
    @InjectRepository(LinkStats)
    private linkStatsRepository: Repository<LinkStats>,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
    private configService: ConfigService,
  ) {}

  async findAll(): Promise<Link[]> {
    return this.linkRepository.find();
  }

  async createLink(originalUrl: string): Promise<ShortenedLinkDto> {
    try {
      const formattedUrl =
        originalUrl.startsWith('http://') || originalUrl.startsWith('https://')
          ? originalUrl
          : `https://${originalUrl}`;
      const nanoid = customAlphabet(
        '_-0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
        6,
      ); // ~2 days of work are needed in order to have a 1% probability of at least one collision (1000 IDs per hour)
      const code = nanoid();
      const link = new Link();
      link.code = code;
      link.originalUrl = formattedUrl;

      await this.linkRepository.save(link);
      const domain = this.configService.get<string>('DOMAIN');

      return { url: `${domain}/s/${code}`, originalUrl };
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while creating the link');
    }
  }

  async deleteLink(code: string): Promise<void> {
    try {
      await this.linkRepository.delete({ code });
      await this.cacheManager.del(code);
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while deleting the link');
    }
  }

  async getOriginalUrl(code: string): Promise<string> {
    try {
      const cachedLink = await this.cacheManager.get<string>(code);
      if (cachedLink) return cachedLink;

      const link = await this.linkRepository.findOneBy({ code });
      if (!link) throw new NotFoundException('Link not found');

      await this.cacheManager.set(code, link.originalUrl, 1000 * 60 * 60); // 1 hour

      return link.originalUrl;
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while getting the original URL');
    }
  }

  async saveStats(code: string, ip: string, userAgent: string): Promise<void> {
    try {
      const link = await this.linkRepository.findOneBy({ code });

      if (!link) throw new NotFoundException('Link not found');

      const stats = this.linkStatsRepository.create({
        link,
        accessedAt: new Date(),
        ipAddress: ip,
        userAgent,
      });

      await this.linkStatsRepository.save(stats);
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while saving stats');
    }
  }

  async getStats(code: string): Promise<LinkStats[]> {
    try {
      const link = await this.linkRepository.findOne({
        where: { code },
        relations: ['stats'],
      });
      if (!link) throw new NotFoundException('Link not found');

      return link.stats;
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while getting stats');
    }
  }
}
