import type { Request, Response } from 'express';
import { MicrobeService } from '../services/MicrobeService.js';
import type { GetAllParams } from '../services/MicrobeService.js';
import type { MicrobeCategory, MicrobeSortKey } from '../../../shared/types.js';

const validCategories: MicrobeCategory[] = ['bacteria', 'fungi', 'virus', 'archaea'];
const validSorts: MicrobeSortKey[] = ['default', 'name', 'year'];

/** 查询串里的数字一律以字符串到达，这里统一收敛成非负整数 */
function toNonNegativeInt(value: unknown): number | undefined {
  if (typeof value !== 'string' || value.trim() === '') return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) return undefined;
  return Math.floor(parsed);
}

export class MicrobeController {
  static getAll(req: Request, res: Response) {
    try {
      const { category, search, sort, limit, offset } = req.query;
      const params: GetAllParams = {};

      if (typeof category === 'string' && validCategories.includes(category as MicrobeCategory)) {
        params.category = category as MicrobeCategory;
      }
      if (typeof search === 'string' && search.trim() !== '') {
        params.search = search;
      }
      if (typeof sort === 'string' && validSorts.includes(sort as MicrobeSortKey)) {
        params.sort = sort as MicrobeSortKey;
      }

      const limitValue = toNonNegativeInt(limit);
      if (limitValue !== undefined) params.limit = limitValue;

      const offsetValue = toNonNegativeInt(offset);
      if (offsetValue !== undefined) params.offset = offsetValue;

      res.json({ success: true, data: MicrobeService.getAll(params) });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static getById(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: '无效的ID' });
      }

      const data = MicrobeService.getById(id);
      if (!data) {
        return res.status(404).json({ success: false, error: '微生物不存在' });
      }

      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static getByCategory(req: Request, res: Response) {
    try {
      const category = req.params.category as MicrobeCategory;
      if (!validCategories.includes(category)) {
        return res.status(400).json({ success: false, error: '无效的分类' });
      }

      const data = MicrobeService.getByCategory(category);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static getStats(_req: Request, res: Response) {
    try {
      const data = MicrobeService.getStats();
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }

  static getRelated(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, error: '无效的ID' });
      }

      const microbe = MicrobeService.getById(id);
      if (!microbe) {
        return res.status(404).json({ success: false, error: '微生物不存在' });
      }

      const limit = req.query.limit ? Number(req.query.limit) : 4;
      const data = MicrobeService.getRelated(microbe, limit);
      res.json({ success: true, data });
    } catch (error) {
      res.status(500).json({ success: false, error: (error as Error).message });
    }
  }
}
