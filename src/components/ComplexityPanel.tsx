export function ComplexityPanel() {
  const policies = [
    {
      name: "FIFO",
      strategy: "Insertion order",
      lookup: "O(1)",
      insert: "O(1)",
      evict: "O(1)",
    },
    {
      name: "LRU",
      strategy: "Recency",
      lookup: "O(1)",
      insert: "O(1)",
      evict: "O(1)",
    },
    {
      name: "LFU",
      strategy: "Frequency",
      lookup: "O(1)",
      insert: "O(1)",
      evict: "O(n)",
    },
    {
      name: "RANDOM",
      strategy: "No history",
      lookup: "O(1)",
      insert: "O(1)",
      evict: "O(1)",
    },
  ];

  return (
    <div className="panel">
      <div className="panel-header">
        <span className="panel-title">Algorithm Complexity</span>
      </div>
      <div className="complexity-grid">
        {policies.map((p) => (
          <div key={p.name} className="complexity-item">
            <span className="complexity-name">{p.name}</span>
            <span className="complexity-strategy">{p.strategy}</span>
            <span className="complexity-ops">
              Lookup {p.lookup} · Insert {p.insert} · Evict {p.evict}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
