import microbesData from '../data/microbesData.json' with { type: 'json' };
import type {
  Microbe,
  MicrobeCategory,
  MicrobeSortKey,
  PagedMicrobes,
  Stats,
} from '../../../shared/types.js';
import { MicrobeCache } from './MicrobeCache.js';
import { filterInPlace, sortMicrobes } from './search.js';

const microbes = microbesData as Microbe[];

export interface GetAllParams {
  category?: MicrobeCategory;
  search?: string;
  sort?: MicrobeSortKey;
  limit?: number;
  offset?: number;
}

export class MicrobeService {
  static getAll(params: GetAllParams = {}): PagedMicrobes {
    const key = MicrobeCache.keyOf({
      category: params.category,
      search: params.search,
    });

    // 过滤结果整体进缓存，翻页与排序都在这份缓存之外做
    let pool = MicrobeCache.get<Microbe[]>(key);
    if (!pool) {
      pool = filterInPlace([...microbes], params.search ?? '');
      if (params.category) {
        pool = pool.filter((m) => m.category === params.category);
      }
      MicrobeCache.set(key, pool);
    }

    const ordered = sortMicrobes([...pool], params.sort ?? 'default');

    const total = ordered.length;
    const offset = params.offset ?? 0;
    const limit = params.limit ?? total;
    const items = ordered.slice(offset, offset + limit);

    return {
      items,
      total,
      hasMore: offset + items.length < total,
    };
  }

  static getById(id: number): Microbe | undefined {
    return microbes.find((m) => m.id === id);
  }

  static getByCategory(category: MicrobeCategory): Microbe[] {
    return microbes.filter((m) => m.category === category);
  }

  static getStats(): Stats {
    return {
      total: microbes.length,
      bacteria: microbes.filter((m) => m.category === 'bacteria').length,
      fungi: microbes.filter((m) => m.category === 'fungi').length,
      virus: microbes.filter((m) => m.category === 'virus').length,
      archaea: microbes.filter((m) => m.category === 'archaea').length,
    };
  }

  static getRelated(microbe: Microbe, limit: number = 4): Microbe[] {
    return microbes
      .filter((m) => m.category === microbe.category && m.id !== microbe.id)
      .slice(0, limit);
  }
}
