import { Test, TestingModule } from '@nestjs/testing';
import { Request, Response } from 'express';
import { LinkController } from './link.controller';
import { LinkService } from './link.service';
import { LinkDto } from './dto/link.dto';
import { CreateLinkDto } from './dto/create-link.dto';
import { ShortenedLinkDto } from './dto/shortened-link.dto';
import { LinkStatsDto } from './dto/link-stats.dto';

jest.mock('./link.service');

describe('LinkController', () => {
  let linkController: LinkController;
  let linkService: jest.Mocked<LinkService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LinkService],
      controllers: [LinkController],
    }).compile();

    linkController = module.get<LinkController>(LinkController);
    linkService = module.get<jest.Mocked<LinkService>>(LinkService);
  });

  it('should be defined', () => {
    expect(linkController).toBeDefined();
  });

  describe('getAll', () => {
    let link: LinkDto[];
    const mockLink: LinkDto = {
      id: 1,
      code: 'abc123',
      originalUrl: 'https://example.com',
    };

    beforeEach(async () => {
      linkService.findAll.mockResolvedValue([mockLink, mockLink]);
      link = await linkController.getAll();
    });

    it('should call linkService.findAll', () => {
      expect(linkService.findAll).toHaveBeenCalled();
    });

    it('should return an array of links', () => {
      expect(link).toEqual([mockLink, mockLink]);
    });

    it('should throw an error if linkService.findAll throws', async () => {
      linkService.findAll.mockRejectedValue(new Error('Test error'));
      await expect(linkController.getAll()).rejects.toThrow(Error);
    });
  });

  describe('createLink', () => {
    let shortenedLink: ShortenedLinkDto;
    const createLinkDto: CreateLinkDto = { originalUrl: 'https://example.com' };

    beforeEach(async () => {
      linkService.createLink.mockResolvedValue({
        url: 'https://domain.com/s/abc123',
        originalUrl: createLinkDto.originalUrl,
      });
      shortenedLink = await linkController.createLink(createLinkDto);
    });

    it('should call linkService.createLink', () => {
      expect(linkService.createLink).toHaveBeenCalledWith(
        createLinkDto.originalUrl,
      );
    });

    it('should return a shortened link', () => {
      expect(shortenedLink).toEqual({
        url: 'https://domain.com/s/abc123',
        originalUrl: createLinkDto.originalUrl,
      });
    });

    it('should throw an error if linkService.createLink throws', async () => {
      linkService.createLink.mockRejectedValue(new Error('Test error'));
      await expect(linkController.createLink(createLinkDto)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('deleteLink', () => {
    const code = 'abc123';

    beforeEach(async () => {
      await linkController.deleteLink(code);
    });

    it('should call linkService.deleteLink', () => {
      expect(linkService.deleteLink).toHaveBeenCalledWith(code);
    });

    it('should throw an error if linkService.deleteLink throws', async () => {
      linkService.deleteLink.mockRejectedValue(new Error('Test error'));
      await expect(linkController.deleteLink(code)).rejects.toThrow(Error);
    });
  });

  describe('redirect', () => {
    const code = 'abc123';
    const res = {
      redirect: jest.fn(),
    } as unknown as Response;
    const req = {
      ip: '1.2.3.4',
      headers: { 'user-agent': 'Mozilla/5.0' },
    } as unknown as Request;

    beforeEach(async () => {
      linkService.getOriginalUrl.mockResolvedValue('https://example.com');
      await linkController.redirect(code, res, req);
    });

    it('should call linkService.getOriginalUrl', () => {
      expect(linkService.getOriginalUrl).toHaveBeenCalledWith(code);
    });

    it('should call linkService.saveStats', () => {
      expect(linkService.saveStats).toHaveBeenCalledWith(
        code,
        req.ip,
        req.headers['user-agent'],
      );
    });

    it('should redirect to the original URL', () => {
      expect(res.redirect).toHaveBeenCalledWith('https://example.com');
    });

    it('should throw an error if linkService.getOriginalUrl throws', async () => {
      linkService.getOriginalUrl.mockRejectedValue(new Error('Test error'));
      await expect(linkController.redirect(code, res, req)).rejects.toThrow(
        Error,
      );
    });

    it('should throw an error if linkService.saveStats throws', async () => {
      linkService.saveStats.mockRejectedValue(new Error('Test error'));
      await expect(linkController.redirect(code, res, req)).rejects.toThrow(
        Error,
      );
    });
  });

  describe('getStats', () => {
    let linkStats: LinkStatsDto[];
    const code = 'abc123';
    const mockLinkStats: LinkStatsDto = {
      id: 1,
      accessedAt: new Date(),
      userAgent: 'Mozilla/5.0',
      ipAddress: '1.2.3.4',
    };

    beforeEach(async () => {
      linkService.getStats.mockResolvedValue([mockLinkStats, mockLinkStats]);
      linkStats = await linkController.getStats(code);
    });

    it('should call linkService.getStats', () => {
      expect(linkService.getStats).toHaveBeenCalledWith(code);
    });

    it('should return an array of link stats', () => {
      expect(linkStats).toEqual([mockLinkStats, mockLinkStats]);
    });

    it('should throw an error if linkService.getStats throws', async () => {
      linkService.getStats.mockRejectedValue(new Error('Test error'));
      await expect(linkController.getStats(code)).rejects.toThrow(Error);
    });
  });
});
