export type MicrobeCategory = 'bacteria' | 'fungi' | 'virus' | 'archaea';

/** 展厅列表支持的排序方式 */
export type MicrobeSortKey = 'default' | 'name' | 'year';

export const CATEGORY_LABELS: Record<MicrobeCategory, string> = {
  bacteria: '细菌',
  fungi: '真菌',
  virus: '病毒',
  archaea: '古菌',
};

export const CATEGORY_COLORS: Record<MicrobeCategory, string> = {
  bacteria: '#00ffc8',
  fungi: '#9b59b6',
  virus: '#e74c3c',
  archaea: '#f1c40f',
};

export interface Microbe {
  id: number;
  name: string;
  scientificName: string;
  category: MicrobeCategory;
  habitat: string;
  description: string;
  imageUrl: string;
  discoveredYear: number;
  size: string;
  characteristics: string[];
}

/** 分页返回：items 是当前窗口里的标本，total 是满足条件的总数 */
export interface PagedMicrobes {
  items: Microbe[];
  total: number;
  hasMore: boolean;
}

export interface Stats {
  total: number;
  bacteria: number;
  fungi: number;
  virus: number;
  archaea: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
