import type { NextFunction, Request, Response } from 'express';

/**
 * 本地弱网模拟。
 *
 * 单条标本与它的相关标本接口在这台机器上一律只需一两毫秒，加载态和并发问题
 * 根本复现不出来，所以在开发环境给这两个接口注入了确定性的延迟（按标本 id 取模，
 * 不随机，同一个 id 每次一样）。线上（NODE_ENV=production）自动关闭，也可以
 * 用 SIMULATE_LATENCY=off 关掉。
 *
 * id % 4 对应关系：1 -> 1500ms，2 -> 400ms，3 -> 150ms，0 -> 60ms
 */
const DELAY_BY_MOD = [60, 1500, 400, 150];

export function simulateLatency(req: Request, _res: Response, next: NextFunction) {
  if (process.env.NODE_ENV === 'production' || process.env.SIMULATE_LATENCY === 'off') {
    return next();
  }

  const matched = /^\/microbes\/(\d+)(\/related)?$/.exec(req.path);
  if (!matched) return next();

  const id = Number(matched[1]);
  if (Number.isNaN(id)) return next();

  setTimeout(next, DELAY_BY_MOD[id % 4]);
}
