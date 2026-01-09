import { AbstractIndex, IndexType } from './abstract-index';

/**
 * Distance metric used for vector similarity calculations.
 * Determines how the distance between vectors is computed.
 */
export enum DistanceMetric {
  /**
   * Euclidean distance (L2 distance).
   * The straight-line distance between two points in Euclidean space.
   */
  Euclidean = 'euclidean',

  /**
   * Squared Euclidean distance (L2 squared).
   * More efficient than Euclidean as it avoids the square root calculation.
   * This is the default metric.
   */
  EuclideanSquared = 'euclideanSquared',

  /**
   * Cosine distance (1 - cosine similarity).
   * Measures the cosine of the angle between two vectors.
   * Useful for comparing document similarity regardless of magnitude.
   */
  Cosine = 'cosine',

  /**
   * Dot product distance (negated).
   * The negated dot product of two vectors.
   */
  Dot = 'dot',
}

/**
 * Scalar Quantizer encoding type.
 * Reduces the number of bits used for each number in a vector.
 */
export enum ScalarQuantizerType {
  /** 4 bits per component */
  SQ4 = 4,
  /** 6 bits per component */
  SQ6 = 6,
  /** 8 bits per component (default) */
  SQ8 = 8,
}

/**
 * Base interface for vector encoding configuration.
 */
export interface VectorEncodingBase {
  type: 'none' | 'scalarQuantizer' | 'productQuantizer';
}

/**
 * No encoding - highest quality but highest storage cost.
 */
export interface VectorEncodingNone extends VectorEncodingBase {
  type: 'none';
}

/**
 * Scalar Quantizer encoding.
 * Reduces the number of bits per dimension.
 */
export interface VectorEncodingScalarQuantizer extends VectorEncodingBase {
  type: 'scalarQuantizer';
  /** The number of bits per component (4, 6, or 8). Default is 8. */
  bits: ScalarQuantizerType;
}

/**
 * Product Quantizer encoding.
 * Reduces both the number of dimensions and bits per dimension.
 */
export interface VectorEncodingProductQuantizer extends VectorEncodingBase {
  type: 'productQuantizer';
  /** The number of subquantizers. Must divide dimensions evenly. */
  subquantizers: number;
  /** The number of bits per subquantizer (typically 8). */
  bits: number;
}

/**
 * Union type for all vector encoding options.
 */
export type VectorEncoding =
  | VectorEncodingNone
  | VectorEncodingScalarQuantizer
  | VectorEncodingProductQuantizer;

/**
 * Configuration for creating a vector index.
 */
export interface VectorIndexConfiguration {
  /**
   * The SQL++ expression that returns the vector data.
   * Typically a property name like "embedding" or a prediction() function call.
   */
  expression: string;

  /**
   * The number of dimensions in the vectors.
   * Must match the dimensions of your embedding model (e.g., 512, 768, 1536).
   * Valid range: 2-4096.
   */
  dimensions: number;

  /**
   * The number of centroids for k-means clustering.
   * More centroids = better accuracy but longer indexing time.
   * Recommended: approximately sqrt(number of documents).
   * Valid range: 1-64000.
   */
  centroids: number;

  /**
   * The distance metric used for vector similarity calculations.
   * Default: EuclideanSquared
   */
  metric?: DistanceMetric;

  /**
   * The encoding algorithm for vector compression.
   * Default: ScalarQuantizer with 8 bits (SQ8)
   */
  encoding?: VectorEncoding;

  /**
   * Minimum number of vectors required before training the index.
   * Default: 0 (calculated as 25x centroids)
   */
  minTrainingSize?: number;

  /**
   * Maximum number of vectors to use for training.
   * Default: 0 (calculated as 256x centroids)
   */
  maxTrainingSize?: number;

  /**
   * The number of centroid buckets to search during queries.
   * Higher values = better accuracy but slower queries.
   * Default: 0 (calculated based on centroids, recommended: at least 8 or 0.5% of centroids)
   */
  numProbes?: number;

  /**
   * Whether to use lazy indexing.
   * When true, vectors are indexed asynchronously via the VectorIndexUpdater.
   * Default: false
   */
  isLazy?: boolean;
}

/**
 * Index type for Vector Search using APPROX_VECTOR_DISTANCE queries.
 *
 * Vector indexes enable efficient similarity search on vector embeddings,
 * commonly used with machine learning models for semantic search,
 * recommendation engines, and RAG (Retrieval Augmented Generation) applications.
 *
 * @example
 * ```typescript
 * const vectorIndex = new VectorIndex({
 *   expression: 'embedding',
 *   dimensions: 512,
 *   centroids: 100,
 *   metric: DistanceMetric.Cosine,
 *   encoding: { type: 'scalarQuantizer', bits: ScalarQuantizerType.SQ8 }
 * });
 *
 * await collection.createIndex('embedding_index', vectorIndex);
 * ```
 */
export class VectorIndex extends AbstractIndex {
  private _config: VectorIndexConfiguration;

  constructor(config: VectorIndexConfiguration) {
    super();
    this._config = {
      metric: DistanceMetric.EuclideanSquared,
      encoding: { type: 'scalarQuantizer', bits: ScalarQuantizerType.SQ8 },
      minTrainingSize: 0,
      maxTrainingSize: 0,
      numProbes: 0,
      isLazy: false,
      ...config,
    };
  }

  /**
   * Returns the vector index configuration.
   */
  get config(): VectorIndexConfiguration {
    return this._config;
  }

  /**
   * The SQL++ expression for the vector data.
   */
  get expression(): string {
    return this._config.expression;
  }

  /**
   * The number of dimensions in the vectors.
   */
  get dimensions(): number {
    return this._config.dimensions;
  }

  /**
   * The number of centroids for clustering.
   */
  get centroids(): number {
    return this._config.centroids;
  }

  /**
   * The distance metric used for similarity calculations.
   */
  get metric(): DistanceMetric {
    return this._config.metric ?? DistanceMetric.EuclideanSquared;
  }

  /**
   * The encoding configuration for vector compression.
   */
  get encoding(): VectorEncoding {
    return (
      this._config.encoding ?? {
        type: 'scalarQuantizer',
        bits: ScalarQuantizerType.SQ8,
      }
    );
  }

  /**
   * The minimum training size.
   */
  get minTrainingSize(): number {
    return this._config.minTrainingSize ?? 0;
  }

  /**
   * The maximum training size.
   */
  get maxTrainingSize(): number {
    return this._config.maxTrainingSize ?? 0;
  }

  /**
   * The number of probes for queries.
   */
  get numProbes(): number {
    return this._config.numProbes ?? 0;
  }

  /**
   * Whether lazy indexing is enabled.
   */
  get isLazy(): boolean {
    return this._config.isLazy ?? false;
  }

  type(): IndexType {
    return IndexType.Vector;
  }

  language(): string {
    return '';
  }

  ignoreAccents(): boolean {
    return false;
  }

  items(): any[] {
    return [];
  }

  toJson(): any {
    return {
      type: 'vector',
      expression: this._config.expression,
      dimensions: this._config.dimensions,
      centroids: this._config.centroids,
      metric: this._config.metric ?? DistanceMetric.EuclideanSquared,
      encoding: this.encodeEncodingToJson(),
      minTrainingSize: this._config.minTrainingSize ?? 0,
      maxTrainingSize: this._config.maxTrainingSize ?? 0,
      numProbes: this._config.numProbes ?? 0,
      isLazy: this._config.isLazy ?? false,
    };
  }

  private encodeEncodingToJson(): any {
    const encoding = this._config.encoding;
    if (!encoding) {
      return { type: 'SQ', bits: 8 };
    }

    switch (encoding.type) {
      case 'none':
        return { type: 'none' };
      case 'scalarQuantizer':
        return {
          type: 'SQ',
          bits: (encoding as VectorEncodingScalarQuantizer).bits,
        };
      case 'productQuantizer':
        const pq = encoding as VectorEncodingProductQuantizer;
        return {
          type: 'PQ',
          subquantizers: pq.subquantizers,
          bits: pq.bits,
        };
      default:
        return { type: 'SQ', bits: 8 };
    }
  }
}
