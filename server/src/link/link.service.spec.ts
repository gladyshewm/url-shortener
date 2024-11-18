import { Test, TestingModule } from '@nestjs/testing';
import { LinkService } from './link.service';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';
import { Link } from './entities/link.entity';
import { LinkDto } from './dto/link.dto';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { LinkStats } from './entities/link-stats.entity';
import { LinkStatsDto } from './dto/link-stats.dto';

describe('LinkService', () => {
  let linkService: LinkService;

  const mockLinkRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockLinkStatsRepository = {
    find: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn().mockReturnValue('some-value'),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinkService,
        {
          provide: 'LinkRepository',
          useValue: mockLinkRepository,
        },
        {
          provide: 'LinkStatsRepository',
          useValue: mockLinkStatsRepository,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    linkService = module.get<LinkService>(LinkService);
  });

  it('should be defined', () => {
    expect(linkService).toBeDefined();
  });

  describe('findAll', () => {
    let links: LinkDto[];
    const mockLinks = [
      {
        id: 1,
        code: 'abc123',
        originalUrl: 'https://example.com',
      },
      {
        id: 2,
        code: 'def456',
        originalUrl: 'https://example.com',
      },
    ] as Link[];

    beforeEach(async () => {
      mockLinkRepository.find.mockResolvedValue(mockLinks);
      links = await linkService.findAll();
    });

    it('should call linkRepository.find', () => {
      expect(mockLinkRepository.find).toHaveBeenCalled();
    });

    it('should return an array of links', () => {
      expect(links).toEqual([
        { id: 1, code: 'abc123', originalUrl: 'https://example.com' },
        { id: 2, code: 'def456', originalUrl: 'https://example.com' },
      ]);
    });

    it('should throw an error if linkRepository.find throws', async () => {
      mockLinkRepository.find.mockRejectedValue(new Error('Test error'));
      await expect(linkService.findAll()).rejects.toThrow(Error);
    });
  });

  describe('createLink', () => {
    const originalUrl = 'http://example.com';
    let shortenedLink: ShortenedLinkDto;

    beforeEach(async () => {
      mockConfigService.get.mockReturnValueOnce('https://domain.com');
      shortenedLink = await linkService.createLink(originalUrl);
    });

    it('should format the original URL correctly if it does not start with http or https', async () => {
      const invalidUrl = 'invalid-url.com';
      shortenedLink = await linkService.createLink(invalidUrl);
      expect(mockLinkRepository.save).toHaveBeenCalledWith({
        code: expect.any(String),
        originalUrl: 'https://invalid-url.com',
      });
    });

    it('should not modify the original URL if it starts with http:// or https://', () => {
      expect(mockLinkRepository.save).toHaveBeenCalledWith({
        code: expect.any(String),
        originalUrl,
      });
    });

    it('should generate a unique 6-character code', () => {
      const code = shortenedLink.url.split('/s/')[1];
      expect(code).toHaveLength(6);
      expect(code).toMatch(/^[a-zA-Z0-9_-]{6}$/);
    });

    it('should return a shortened link', () => {
      expect(shortenedLink).toEqual({
        url: `https://domain.com/s/${shortenedLink.url.split('/s/')[1]}`,
        originalUrl,
      });
    });

    it('should throw an error if linkRepository throws', async () => {
      mockLinkRepository.save.mockRejectedValue(new Error('Test error'));
      await expect(linkService.createLink(originalUrl)).rejects.toThrow(Error);
    });
  });

  describe('deleteLink', () => {
    const code = 'abc123';

    beforeEach(async () => {
      await linkService.deleteLink(code);
    });

    it('should call linkRepository.delete', () => {
      expect(mockLinkRepository.delete).toHaveBeenCalledWith({
        code,
      });
    });

    it('should call cacheManager.del', async () => {
      expect(mockCacheManager.del).toHaveBeenCalledWith(code);
    });

    it('should throw an error if linkRepository.delete throws', async () => {
      mockLinkRepository.delete.mockRejectedValue(new Error('Test error'));
      await expect(linkService.deleteLink(code)).rejects.toThrow(Error);
    });
  });

  describe('getOriginalUrl', () => {
    let originalUrl: string;
    const code = 'abc123';
    const mockLink = {
      id: 1,
      code,
      originalUrl: 'https://example.com',
    } as Link;

    beforeEach(async () => {
      jest.clearAllMocks();
      mockCacheManager.get.mockResolvedValue(null);
      mockLinkRepository.findOneBy.mockResolvedValue(mockLink);
    });

    it('should call cacheManager.get', async () => {
      originalUrl = await linkService.getOriginalUrl(code);
      expect(mockCacheManager.get).toHaveBeenCalledWith(code);
    });

    it('should return cached original URL if it exists', async () => {
      mockCacheManager.get.mockResolvedValueOnce('https://cached-url.com');
      originalUrl = await linkService.getOriginalUrl(code);
      expect(originalUrl).toBe('https://cached-url.com');
      expect(mockLinkRepository.findOneBy).not.toHaveBeenCalled();
    });

    it('should call linkRepository.findOneBy', async () => {
      originalUrl = await linkService.getOriginalUrl(code);
      expect(mockLinkRepository.findOneBy).toHaveBeenCalledWith({
        code,
      });
    });

    it('should throw an error if linkRepository.findOneBy throws', async () => {
      mockLinkRepository.findOneBy.mockRejectedValue(new Error('Test error'));
      await expect(linkService.getOriginalUrl(code)).rejects.toThrow(Error);
    });

    it('should throw a NotFoundException if link is not found', async () => {
      mockLinkRepository.findOneBy.mockResolvedValueOnce(null);
      await expect(linkService.getOriginalUrl(code)).rejects.toThrow(Error);
    });

    it('should call cacheManager.set', async () => {
      originalUrl = await linkService.getOriginalUrl(code);
      expect(mockCacheManager.set).toHaveBeenCalledWith(
        code,
        'https://example.com',
        expect.any(Number),
      );
    });

    it('should return original URL', async () => {
      originalUrl = await linkService.getOriginalUrl(code);
      expect(originalUrl).toBe('https://example.com');
    });
  });

  describe('saveStats', () => {
    const code = 'abc123';
    const ip = '1.2.3.4';
    const userAgent = 'Mozilla/5.0';
    const mockLink = {
      id: 1,
      code,
      originalUrl: 'https://example.com',
    } as Link;
    const mockLinkStats = {
      id: 1,
      accessedAt: new Date(),
      userAgent,
      ipAddress: ip,
    } as LinkStats;

    beforeEach(async () => {
      mockLinkRepository.findOneBy.mockResolvedValue(mockLink);
      mockLinkStatsRepository.create.mockReturnValue(mockLinkStats);
      await linkService.saveStats(code, ip, userAgent);
    });

    it('should call linkRepository.findOneBy', () => {
      expect(mockLinkRepository.findOneBy).toHaveBeenCalledWith({ code });
    });

    it('should throw an error if linkRepository.findOneBy throws', async () => {
      mockLinkRepository.findOneBy.mockRejectedValueOnce(
        new Error('Test error'),
      );
      await expect(linkService.saveStats(code, ip, userAgent)).rejects.toThrow(
        Error,
      );
    });

    it('should throw a NotFoundException if link is not found', async () => {
      mockLinkRepository.findOneBy.mockResolvedValueOnce(null);
      await expect(linkService.saveStats(code, ip, userAgent)).rejects.toThrow(
        Error,
      );
    });

    it('should call linkStatsRepository.create', () => {
      expect(mockLinkStatsRepository.create).toHaveBeenCalledWith({
        link: mockLink,
        accessedAt: expect.any(Date),
        ipAddress: ip,
        userAgent,
      });
    });

    it('should call linkStatsRepository.save', async () => {
      expect(mockLinkStatsRepository.save).toHaveBeenCalledWith(mockLinkStats);
    });
  });

  describe('getStats', () => {
    let linkStats: LinkStatsDto[];
    const code = 'abc123';
    const mockLinkStats = {
      id: 1,
      accessedAt: new Date(),
      userAgent: 'Mozilla/5.0',
      ipAddress: '1.2.3.4',
    } as LinkStats;
    const mockLink = {
      id: 1,
      code,
      originalUrl: 'https://example.com',
      stats: [mockLinkStats],
    } as Link;

    beforeEach(async () => {
      mockLinkRepository.findOne.mockResolvedValue(mockLink);
      linkStats = await linkService.getStats(code);
    });

    it('should call linkRepository.findOne', () => {
      expect(mockLinkRepository.findOne).toHaveBeenCalledWith({
        where: { code },
        relations: ['stats'],
      });
    });

    it('should throw an error if linkRepository.findOne throws', async () => {
      mockLinkRepository.findOne.mockRejectedValue(new Error('Test error'));
      await expect(linkService.getStats(code)).rejects.toThrow(Error);
    });

    it('should throw a NotFoundException if link is not found', async () => {
      mockLinkRepository.findOne.mockResolvedValueOnce(null);
      await expect(linkService.getStats(code)).rejects.toThrow(Error);
    });

    it('should return an array of link stats', () => {
      expect(linkStats).toEqual([mockLinkStats]);
    });
  });
});
