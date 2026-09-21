import { create } from 'zustand';
import type { Microbe, Stats } from '../../shared/types';
import { api } from '../utils/api';
import type { MicrobeQuery } from '../utils/api';

/**
 * 详情与相关标本是两个独立的请求，用户快速切换标本时它们会交叉返回，
 * 所以每个方向各有一个自增的请求号，只有最新一次请求的结果才允许写进状态。
 */
let listToken = 0;
let detailToken = 0;
let relatedToken = 0;

interface AppState {
  microbes: Microbe[];
  total: number;
  hasMore: boolean;
  microbe: Microbe | null;
  related: Microbe[];
  stats: Stats | null;
  loading: boolean;
  error: string | null;
  query: MicrobeQuery;
  fetchMicrobes: (params?: MicrobeQuery) => Promise<void>;
  fetchMicrobeById: (id: number) => Promise<void>;
  fetchRelated: (id: number) => Promise<void>;
  fetchStats: () => Promise<void>;
}

export const useAppStore = create<AppState>((set) => ({
  microbes: [],
  total: 0,
  hasMore: false,
  microbe: null,
  related: [],
  stats: null,
  loading: false,
  error: null,
  query: {},

  fetchMicrobes: async (params) => {
    const token = ++listToken;
    set({ loading: true, error: null, query: params ?? {} });
    try {
      const data = await api.getMicrobes(params);
      if (token !== listToken) return;
      set({
        microbes: data.items,
        total: data.total,
        hasMore: data.hasMore,
        loading: false,
      });
    } catch (err) {
      if (token !== listToken) return;
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchMicrobeById: async (id) => {
    const token = ++detailToken;
    set({ loading: true, error: null, microbe: null, related: [] });
    try {
      const data = await api.getMicrobeById(id);
      if (token !== detailToken) return;
      set({ microbe: data, loading: false });
    } catch (err) {
      if (token !== detailToken) return;
      set({ error: (err as Error).message, loading: false });
    }
  },

  fetchRelated: async (id) => {
    const token = ++relatedToken;
    try {
      const data = await api.getRelated(id);
      if (token !== relatedToken) return;
      set({ related: data });
    } catch (err) {
      console.error(err);
    }
  },

  fetchStats: async () => {
    try {
      const data = await api.getStats();
      set({ stats: data });
    } catch (err) {
      console.error(err);
    }
  },
}));
