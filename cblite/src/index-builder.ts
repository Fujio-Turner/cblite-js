import { ValueIndexItem, ValueIndex } from './value-index';
import { FullTextIndex, FullTextIndexItem } from './full-text-index';
import { VectorIndex, VectorIndexConfiguration } from './vector-index';

export class IndexBuilder {
  /**
   * Create a value index with the given index items. The index items are a list of
   * the properties or expressions to be indexed.
   *
   * @param items The index items
   * @return The value index
   */
  public static valueIndex(...items: ValueIndexItem[]): ValueIndex {
    return new ValueIndex(...items);
  }

  /**
   * Create a full-text search index with the given index item and options. Typically the index item is
   * the property that is used to perform the match operation against with.
   *
   * @param items The index items.
   * @return The full-text search index.
   */
  public static fullTextIndex(...items: FullTextIndexItem[]): FullTextIndex {
    return new FullTextIndex(...items);
  }

  /**
   * Create a vector index for similarity search using APPROX_VECTOR_DISTANCE queries.
   *
   * Vector indexes enable efficient similarity search on vector embeddings,
   * commonly used with machine learning models for semantic search,
   * recommendation engines, and RAG applications.
   *
   * @param config The vector index configuration including expression, dimensions, centroids, etc.
   * @return The vector index.
   *
   * @example
   * ```typescript
   * const vectorIndex = IndexBuilder.vectorIndex({
   *   expression: 'embedding',
   *   dimensions: 512,
   *   centroids: 100,
   *   metric: DistanceMetric.Cosine
   * });
   * await collection.createIndex('embedding_index', vectorIndex);
   * ```
   */
  public static vectorIndex(config: VectorIndexConfiguration): VectorIndex {
    return new VectorIndex(config);
  }
}
