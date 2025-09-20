import crypto from "crypto";
import { getRedisInstance } from "./redis";

export interface CacheOptions {
  ttl?: number; // Time to live in seconds (default: 1 hour)
  keyPrefix?: string;
}

export class CacheService {
  private redis = getRedisInstance();
  private defaultTTL = 3600; // 1 hour

  /**
   * Generate a consistent cache key for Claude API requests
   */
  private generateCacheKey(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[],
    model: string,
    systemPrompt: string,
    maxTokens: number,
    keyPrefix?: string,
  ): string {
    const normalizedMessages = JSON.stringify(
      messages,
      Object.keys(messages).sort(),
    );
    const cacheData = {
      messages: normalizedMessages,
      model,
      system: systemPrompt,
      maxTokens,
    };

    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(cacheData, Object.keys(cacheData).sort()))
      .digest("hex");

    return keyPrefix ? `${keyPrefix}:${hash}` : `claude:${hash}`;
  }

  /**
   * Get cached response for similar queries
   */
  async getCachedResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[],
    model: string,
    systemPrompt: string,
    maxTokens: number,
    options?: CacheOptions,
  ): Promise<string | null> {
    try {
      const cacheKey = this.generateCacheKey(
        messages,
        model,
        systemPrompt,
        maxTokens,
        options?.keyPrefix,
      );

      const cachedResponse = await this.redis.get(cacheKey);

      if (cachedResponse) {
        console.log(`Cache hit for key: ${cacheKey}`);
        return cachedResponse;
      }

      console.log(`Cache miss for key: ${cacheKey}`);
      return null;
    } catch (error) {
      console.error("Error getting cached response:", error);
      return null; // Fall back to API call if cache fails
    }
  }

  /**
   * Cache the Claude API response
   */
  async setCachedResponse(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    messages: any[],
    model: string,
    systemPrompt: string,
    maxTokens: number,
    response: string,
    options?: CacheOptions,
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(
        messages,
        model,
        systemPrompt,
        maxTokens,
        options?.keyPrefix,
      );

      const ttl = options?.ttl || this.defaultTTL;

      await this.redis.setex(cacheKey, ttl, response);
    } catch (error) {
      console.error("Error caching response:", error);
    }
  }

  /**
   * Get cache statistics
   */
  async getCacheStats(): Promise<{
    totalKeys: number;
    memoryUsage: string;
    hitRate?: number;
  }> {
    try {
      const info = await this.redis.info("memory");
      const keyCount = await this.redis.dbsize();

      const memoryMatch = info.match(/used_memory_human:(.+)/);
      const memoryUsage =
        memoryMatch && memoryMatch[1] ? memoryMatch[1].trim() : "Unknown";

      return {
        totalKeys: keyCount,
        memoryUsage,
      };
    } catch (error) {
      console.error("Error getting cache stats:", error);
      return {
        totalKeys: 0,
        memoryUsage: "Unknown",
      };
    }
  }

  /**
   * Clear cache (use with caution in production)
   */
  async clearCache(pattern?: string): Promise<number> {
    try {
      const keys = pattern
        ? await this.redis.keys(pattern)
        : await this.redis.keys("claude:*");

      if (keys.length === 0) return 0;

      const result = await this.redis.del(...keys);
      console.log(`Cleared ${result} cache entries`);
      return result;
    } catch (error) {
      console.error("Error clearing cache:", error);
      return 0;
    }
  }
}

// Export singleton instance
export const cacheService = new CacheService();
