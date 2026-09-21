import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * 路由切换时把视口带回页首。
 * 只盯 pathname：展厅页里改搜索词、排序、翻页都会改 query，
 * 那种情况下用户还在看列表，不该被弹回顶部。
 */
export function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [pathname]);

  return null;
}
