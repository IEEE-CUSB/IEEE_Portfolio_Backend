import { Inject, Injectable } from '@nestjs/common';
import { REDIS_CLIENT } from './redis.constants';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject(REDIS_CLIENT) private readonly client: Redis) {}

  async setex(
    key: string,
    seconds: number,
    value: string,
  ): Promise<'OK' | null> {
    return this.client.setex(key, seconds, value);
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async set(key: string, value: string): Promise<'OK' | null> {
    return this.client.set(key, value);
  }

  async exists(key: string): Promise<number> {
    return this.client.exists(key);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    return this.client.sadd(key, ...members);
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    return this.client.srem(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    return this.client.smembers(key);
  }

  async deleteKeys(keys: string[]): Promise<number> {
    if (keys.length === 0) {
      return 0;
    }

    if (typeof this.client.unlink === 'function') {
      return this.client.unlink(...keys);
    }

    return this.client.del(...keys);
  }

  async delByPattern(pattern: string): Promise<number> {
    let cursor = '0';
    let deleted = 0;

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        1000,
      );

      cursor = nextCursor;

      if (keys.length > 0) {
        deleted += await this.client.del(...keys);
      }
    } while (cursor !== '0');

    return deleted;
  }
  //
  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return this.client.expire(key, seconds);
  }

  /**
   * Atomically increments a counter and makes sure it has an expiration.
   * The TTL is set only when the key is new (or somehow has no TTL), so
   * later increments never extend or reset the existing window.
   */
  async incrWithExpire(key: string, seconds: number): Promise<number> {
    const script = `
      local count = redis.call('INCR', KEYS[1])
      if count == 1 or redis.call('TTL', KEYS[1]) == -1 then
        redis.call('EXPIRE', KEYS[1], ARGV[1])
      end
      return count
    `;
    const result = await this.client.eval(script, 1, key, seconds);
    return Number(result);
  }

  /**
   * Atomically deletes a key only if its current value equals `expected`.
   * Returns true if this call deleted the key.
   */
  async delIfEquals(key: string, expected: string): Promise<boolean> {
    const script = `
      if redis.call('GET', KEYS[1]) == ARGV[1] then
        return redis.call('DEL', KEYS[1])
      end
      return 0
    `;
    const result = await this.client.eval(script, 1, key, expected);
    return Number(result) === 1;
  }
}
