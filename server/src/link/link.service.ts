import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Link } from './entities/link.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LinkService {
  private readonly logger = new Logger(LinkService.name);

  constructor(
    @InjectRepository(Link) private linkRepository: Repository<Link>,
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
      const code = uuidv4().slice(0, 6);
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
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while deleting the link');
    }
  }

  async getOriginalUrl(code: string): Promise<string> {
    try {
      const link = await this.linkRepository.findOneBy({ code });
      if (!link) {
        throw new Error('Link not found');
      }
      return link.originalUrl;
    } catch (error) {
      this.logger.error(error);
      throw new Error('An error occurred while getting the original URL');
    }
  }
}
