---
name: networkx-graph-analysis
title: NetworkX Graph & Network Analysis
description: Use NetworkX to build, analyze, generate, visualize, and read/write graphs (social/biological/citation/knowledge networks): centrality, shortest paths, communities, PageRank, GraphML I/O; not for billion-edge graphs (use igraph/graph-tool/GraphFrames), graph databases (Neo4j/Cyph
domain: 数据/analysis
triggers: [networkx, graph analysis, network analysis, centrality, shortest path, community detection, pagerank, knowledge graph, graph algorithms, adjacency matrix, graphml, betweenness]
tags: [networkx, graph-analysis, network-science, python, data-analysis, visualization, algorithms]
level: intermediate
status: stable
agents: [claude-code, codex, cursor, gemini-cli]
tools: []
requires: []
related: [matplotlib-visualization, plotly-interactive-viz, scikit-learn-ml]
combines_with: [matplotlib-visualization, polars-dataframe, plotly-interactive-viz]
license: MIT
source: sickn33/antigravity-awesome-skills
source_license: MIT
---
## When to use

NetworkX is a Python package for creating, manipulating, and analyzing complex networks and graphs. Use this skill when working with network or graph data structures, including social networks, biological networks, transportation systems, citation networks, knowledge graphs, or any system involving relationships between entities.

Invoke this skill when tasks involve:

- **Creating graphs**: Building network structures from data, adding nodes and edges with attributes.
- **Graph analysis**: Computing centrality measures, finding shortest paths, detecting communities, measuring clustering, analyzing connectivity.
- **Graph algorithms**: Running standard algorithms like Dijkstra's, PageRank, minimum spanning trees, maximum flow.
- **Network generation**: Creating synthetic networks (random, scale-free, small-world models) for testing or simulation.
- **Graph I/O**: Reading from or writing to various formats (edge lists, GraphML, GML, JSON, CSV, adjacency matrices).
- **Visualization**: Drawing and customizing network visualizations with matplotlib or interactive libraries.
- **Network comparison**: Checking isomorphism, computing graph metrics, analyzing structural properties.

**When NOT to use it:**

- **Very large graphs** (millions of nodes / billions of edges, high-performance compute) — NetworkX is pure Python and performance-limited; switch to igraph, graph-tool, or Spark GraphFrames.
- **Persistent storage + online graph queries** — use a graph database (Neo4j + Cypher) rather than in-memory NetworkX.
- **Pure graph neural network / graph representation learning training** — use PyG or DGL (NetworkX is best for preprocessing and feature engineering).
- Stop and ask for clarification if required inputs, permissions, safety boundaries, or success criteria are missing.

## Steps

Most NetworkX tasks follow a five-step pattern: Create/Load → Examine → Analyze → Visualize → Export.

**1. Create or Load Graph**

NetworkX supports four graph types: `Graph` (undirected, single edges), `DiGraph` (directed), `MultiGraph` (undirected, multiple edges), `MultiDiGraph` (directed, multiple edges).

```python
import networkx as nx

# From scratch — nodes can be any hashable type
G = nx.Graph()
G.add_node("protein_A", type='enzyme', weight=1.5)
G.add_nodes_from([2, 3, 4])
G.add_edge(1, 4, weight=0.8, relation='interacts')
G.add_edges_from([(1, 3), (2, 4)])

# Or load from file/data
G = nx.read_edgelist('data.txt')
```

**2. Examine Structure**

```python
print(f"Nodes: {G.number_of_nodes()}")
print(f"Edges: {G.number_of_edges()}")
print(f"Density: {nx.density(G)}")
print(f"Connected: {nx.is_connected(G)}")
```

**3. Analyze**

```python
# Shortest paths (use weight= for weighted graphs)
path = nx.shortest_path(G, source=1, target=5)
length = nx.shortest_path_length(G, source=1, target=5, weight='weight')

# Centrality
nx.degree_centrality(G)
nx.betweenness_centrality(G)
nx.closeness_centrality(G)
nx.pagerank(G)

# Clustering
nx.clustering(G)
nx.average_clustering(G)

# Community detection
from networkx.algorithms import community
communities = community.greedy_modularity_communities(G)

# Connectivity (use strongly_connected_components for directed graphs)
nx.is_connected(G)
list(nx.connected_components(G))
```

**4. Visualize**

Choose a layout, then draw. Layout options: `spring_layout` (force-directed, set seed), `circular_layout`, `kamada_kawai_layout`, `spectral_layout`.

```python
import matplotlib.pyplot as plt
pos = nx.spring_layout(G, seed=42)
nx.draw(G, pos=pos, with_labels=True, node_color='lightblue', node_size=500)
plt.show()
```

**5. Export Results**

```python
# Save graph (GraphML preserves attributes)
nx.write_graphml(G, 'analyzed_network.graphml')

# Save metrics
import pandas as pd
df = pd.DataFrame({'node': list(degree_cent.keys()),
                   'centrality': list(degree_cent.values())})
df.to_csv('centrality_results.csv', index=False)
```

**Graph generators** (always set `seed` for reproducibility):

```python
nx.erdos_renyi_graph(n=100, p=0.1, seed=42)         # Erdős-Rényi random graph
nx.barabasi_albert_graph(n=100, m=3, seed=42)       # Barabási-Albert scale-free
nx.watts_strogatz_graph(n=100, k=6, p=0.1, seed=42) # Watts-Strogatz small-world
nx.karate_club_graph()                              # Classic dataset
```

**Reading and writing** (GraphML preserves attributes — prefer it for attributed graphs):

```python
G = nx.read_graphml('graph.graphml'); nx.write_graphml(G, 'graph.graphml')
data = nx.node_link_data(G); G = nx.node_link_graph(data)   # JSON

# Pandas / NumPy / SciPy interop
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')
df = nx.to_pandas_edgelist(G)
A = nx.to_numpy_array(G); G = nx.from_numpy_array(A)
A = nx.to_scipy_sparse_array(G)   # sparse matrix for large sparse graphs
```

**Installation**: `uv pip install networkx` (or `networkx[default]` for optional dependencies). Check with `import networkx as nx; print(nx.__version__)`.

## Example

Build a graph from a DataFrame, analyze it, produce a publication-quality figure, and export metrics:

```python
import networkx as nx, pandas as pd, matplotlib.pyplot as plt

df = pd.DataFrame({'source': [1, 2, 3], 'target': [2, 3, 4], 'weight': [0.5, 1.0, 0.75]})
G = nx.from_pandas_edgelist(df, 'source', 'target', edge_attr='weight')

# Examine
print(G.number_of_nodes(), G.number_of_edges(), nx.density(G), nx.is_connected(G))

# Analyze: drive node size by betweenness centrality
centrality = nx.betweenness_centrality(G)
node_sizes = [3000 * centrality[n] for n in G.nodes()]

# Visualize: seeded force-directed layout + publication-quality output
plt.figure(figsize=(12, 8))
pos = nx.spring_layout(G, seed=42)
nx.draw(G, pos=pos, node_size=node_sizes, node_color='lightblue',
        edge_color='gray', with_labels=True, font_size=10)
plt.title('Network Visualization', fontsize=16)
plt.axis('off'); plt.tight_layout()
plt.savefig('network.png', dpi=300, bbox_inches='tight')
plt.savefig('network.pdf', bbox_inches='tight')  # Vector format

# Export: graph to GraphML, metrics to CSV
nx.write_graphml(G, 'analyzed.graphml')
pd.DataFrame({'node': list(centrality),
              'centrality': list(centrality.values())}).to_csv('cent.csv', index=False)
```

## Notes

- **Random seeds**: Random graph generation and force-directed layouts depend on random numbers. Always pass a fixed seed (e.g. `seed=42`) or results will not be reproducible.
- **Floating point precision**: When graphs contain floating-point weights, all results are inherently approximate. This particularly affects minimum/maximum computations and boundary decisions.
- **Memory and performance**: Each script run loads the whole graph into memory. For large networks: use sparse matrices, load only necessary subgraphs, use efficient formats (pickle / compressed), and leverage approximate algorithms (e.g. the `k` sampling parameter in centrality calculations).
- **Node and edge types**: Nodes can be any hashable Python object (numbers, strings, tuples, custom objects) — use meaningful identifiers. Removing a node automatically removes all its incident edges.
- Do not treat the output as a substitute for environment-specific validation, testing, or expert review.

## See also

- Source-skill `references/` sub-documents (deeper detail): `graph-basics.md` (graph types and attributes), `algorithms.md` (full algorithm catalog), `generators.md` (generators), `io.md` (all formats), `visualization.md` (incl. Plotly / PyVis / 3D).
- Official documentation: https://networkx.org/documentation/latest/ | Tutorial: https://networkx.org/documentation/latest/tutorial.html | Gallery: https://networkx.org/documentation/latest/auto_examples/index.html | GitHub: https://github.com/networkx/networkx
- Companion skills: matplotlib-visualization, plotly-interactive-viz, polars-dataframe, scikit-learn-ml.

---
Adapted from sickn33/antigravity-awesome-skills (repository MIT-licensed); NetworkX itself is under the 3-clause BSD license, original skill author K-Dense Inc.
