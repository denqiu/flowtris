/**
 * Matrix Caching System for Performance Optimization
 * Caches computed matrices and paths to avoid redundant calculations
 */

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
}

export interface MatrixCacheKey {
  rows: number;
  columns: number;
  obstacles: string; // Stringified obstacles for comparison
  paths: string;     // Stringified paths for comparison
  selectedPath?: string;
}

export class MatrixCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxAge: number; // in milliseconds

  constructor(maxSize = 100, maxAge = 300000) { // 5 minutes default
    this.maxSize = maxSize;
    this.maxAge = maxAge;
  }

  /**
   * Generate cache key from matrix configuration
   */
  private generateKey(config: MatrixCacheKey): string {
    return `${config.rows}-${config.columns}-${config.obstacles}-${config.paths}-${config.selectedPath || 'none'}`;
  }

  /**
   * Get cached entry
   */
  get(config: MatrixCacheKey): T | null {
    const key = this.generateKey(config);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    return entry.data;
  }

  /**
   * Set cache entry
   */
  set(config: MatrixCacheKey, data: T): void {
    const key = this.generateKey(config);
    
    // Clean up if we're at max size
    if (this.cache.size >= this.maxSize) {
      this.evictOldestEntries();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }

  /**
   * Check if entry exists and is valid
   */
  has(config: MatrixCacheKey): boolean {
    const key = this.generateKey(config);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() - entry.timestamp > this.maxAge) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Evict oldest entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort((a, b) => a[1].lastAccessed - b[1].lastAccessed);
    
    // Remove oldest 25% of entries
    const toRemove = Math.ceil(entries.length * 0.25);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Clear expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.maxAge) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    entries: Array<{
      key: string;
      accessCount: number;
      age: number;
      lastAccessed: number;
    }>;
  } {
    const now = Date.now();
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      accessCount: entry.accessCount,
      age: now - entry.timestamp,
      lastAccessed: entry.lastAccessed
    }));

    const totalAccess = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const hitRate = totalAccess > 0 ? (totalAccess - entries.length) / totalAccess : 0;

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      entries
    };
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Preload commonly used matrix configurations
   */
  preload(configs: MatrixCacheKey[], calculator: (config: MatrixCacheKey) => Promise<T>): Promise<void> {
    const promises = configs.map(async (config) => {
      if (!this.has(config)) {
        try {
          const result = await calculator(config);
          this.set(config, result);
        } catch (error) {
          console.warn('Failed to preload cache entry:', error);
        }
      }
    });

    return Promise.all(promises).then(() => {});
  }
}

/**
 * Specialized cache instances for different data types
 */

// Cache for matrix calculations
export const matrixCache = new MatrixCache<{
  matrix: number[][];
  selectedPath: [number, number][];
  potholes: [number, number][];
  status: string;
  message: string;
}>(50, 300000); // 50 entries, 5 minutes

// Cache for path calculations
export const pathCache = new MatrixCache<Record<string, [number, number][]>>(100, 600000); // 100 entries, 10 minutes

// Cache for icon matrices
export const iconCache = new MatrixCache<string[][]>(200, 1800000); // 200 entries, 30 minutes

/**
 * Cache management utilities
 */
export class CacheManager {
  private static cleanupInterval: ReturnType<typeof setInterval> | null = null;

  /**
   * Start automatic cache cleanup
   */
  static startCleanup(intervalMs = 60000): void { // 1 minute default
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }

    this.cleanupInterval = setInterval(() => {
      matrixCache.cleanExpired();
      pathCache.cleanExpired();
      iconCache.cleanExpired();
    }, intervalMs);
  }

  /**
   * Stop automatic cache cleanup
   */
  static stopCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }

  /**
   * Get comprehensive cache statistics
   */
  static getGlobalStats() {
    return {
      matrix: matrixCache.getStats(),
      path: pathCache.getStats(),
      icon: iconCache.getStats(),
      timestamp: Date.now()
    };
  }

  /**
   * Clear all caches
   */
  static clearAll(): void {
    matrixCache.clear();
    pathCache.clear();
    iconCache.clear();
  }

  /**
   * Optimize caches by removing least accessed entries
   */
  static optimize(): void {
    // Implementation would analyze access patterns and optimize accordingly
    matrixCache.cleanExpired();
    pathCache.cleanExpired();
    iconCache.cleanExpired();
  }
}

/**
 * Cache helper functions for easy integration
 */
export class CacheHelpers {
  /**
   * Create cache key from grid configuration
   */
  static createMatrixKey(config: {
    rows: number;
    columns: number;
    obstacles?: any[];
    paths?: any;
    selectedPath?: string;
  }): MatrixCacheKey {
    return {
      rows: config.rows,
      columns: config.columns,
      obstacles: JSON.stringify(config.obstacles || []),
      paths: JSON.stringify(config.paths || {}),
      selectedPath: config.selectedPath
    };
  }

  /**
   * Cached matrix calculation with fallback
   */
  static async getCachedMatrix(
    config: MatrixCacheKey,
    calculator: () => Promise<any>
  ): Promise<any> {
    // Try cache first
    let result = matrixCache.get(config);
    
    if (result) {
      return result;
    }

    // Calculate and cache
    try {
      result = await calculator();
      matrixCache.set(config, result);
      return result;
    } catch (error) {
      console.error('Matrix calculation failed:', error);
      throw error;
    }
  }

  /**
   * Cached path calculation with fallback
   */
  static async getCachedPaths(
    config: MatrixCacheKey,
    calculator: () => Promise<Record<string, [number, number][]>>
  ): Promise<Record<string, [number, number][]>> {
    // Try cache first
    let result = pathCache.get(config);
    
    if (result) {
      return result;
    }

    // Calculate and cache
    try {
      result = await calculator();
      pathCache.set(config, result);
      return result;
    } catch (error) {
      console.error('Path calculation failed:', error);
      throw error;
    }
  }
}
