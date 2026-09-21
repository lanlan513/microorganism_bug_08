import type { Microbe, MicrobeSortKey } from '../../../shared/types.js';

const SEARCHABLE_FIELDS: (keyof Microbe)[] = ['name', 'scientificName', 'habitat', 'description'];

/** 关键词命中判断，大小写不敏感 */
export function matches(microbe: Microbe, keyword: string): boolean {
  const query = keyword.trim().toLowerCase();
  if (!query) return true;

  return SEARCHABLE_FIELDS.some((field) => {
    const raw = microbe[field];
    if (typeof raw !== 'string') return false;
    return raw.toLowerCase().includes(query);
  });
}

/**
 * 就地剔除不匹配的条目并返回同一个数组，避免额外分配。
 * 删除元素会改变后续下标，所以从后往前扫。
 */
export function filterInPlace(list: Microbe[], keyword: string): Microbe[] {
  if (!keyword.trim()) return list;

  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (!matches(list[i], keyword)) list.splice(i, 1);
  }
  return list;
}

/**
 * 按排序键排序。
 * 注意：本函数在传入的数组上就地排序，调用方要么传自己的副本，要么确认这个数组
 * 之后不会再被别人使用。
 */
export function sortMicrobes(list: Microbe[], sort: MicrobeSortKey): Microbe[] {
  if (sort === 'default') return list;

  if (sort === 'name') {
    return list.sort((a, b) => a.name.localeCompare(b.name, 'zh-Hans-CN'));
  }

  if (sort === 'year') {
    return list.sort((a, b) => a.discoveredYear - b.discoveredYear);
  }

  return list;
}
