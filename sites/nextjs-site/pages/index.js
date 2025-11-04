export default function Home({ entries }) {
  return (
    <main style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.title}>Public Entries in Next.js</h1>
          <p style={styles.subtitle}>Synced from Strapi (powered by Supabase)</p>
        </div>
        <span style={styles.badge}>
          {entries.length} {entries.length === 1 ? "Entry" : "Entries"}
        </span>
      </header>

      {entries.length === 0 ? (
        <div style={styles.emptyBox}>
          <h2>No entries yet</h2>
          <p>Try adding one in Strapi or Supabase.</p>
        </div>
      ) : (
        <section style={styles.grid}>
          {entries.map((e) => (
            <article key={e.id} style={styles.card}>
              <h2 style={styles.cardTitle}>{e.title || "Untitled"}</h2>
              <p style={styles.cardDesc}>{e.description || "No description"}</p>
              <small style={styles.timestamp}>
                {e.timestamp
                  ? new Date(e.timestamp).toLocaleString()
                  : "No timestamp"}
              </small>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export async function getStaticProps() {
  const res = await fetch(`${process.env.STRAPI_PUBLIC_URL}/api/entries`);
  const json = await res.json();

  const entries =
    json.data?.map((item) => ({
      id: item.id,
      title: item.attributes?.title ?? item.title,
      description: item.attributes?.description ?? item.description,
      timestamp: item.attributes?.timestamp ?? item.timestamp,
    })) ?? [];

  return {
    props: { entries },
    revalidate: 10, 
  };
}

const styles = {
  container: {
    maxWidth: "1000px",
    margin: "2rem auto",
    padding: "0 1.5rem 3rem",
    fontFamily:
      "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    backgroundColor: "#f8f9fb",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    flexWrap: "wrap",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    margin: 0,
  },
  subtitle: {
    marginTop: "0.3rem",
    fontSize: "0.9rem",
    color: "#667085",
  },
  badge: {
    backgroundColor: "#e8f0fe",
    color: "#1a73e8",
    borderRadius: "9999px",
    padding: "0.4rem 1rem",
    fontWeight: "600",
    fontSize: "0.85rem",
  },
  emptyBox: {
    background: "white",
    border: "1px dashed #d0d7de",
    borderRadius: "12px",
    padding: "3rem 2rem",
    textAlign: "center",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "1.2rem",
  },
  card: {
    background: "white",
    padding: "1.2rem 1.4rem",
    borderRadius: "12px",
    border: "1px solid rgba(0,0,0,0.05)",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    cursor: "pointer",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "600",
    color: "#111827",
    margin: 0,
  },
  cardDesc: {
    color: "#4b5563",
    fontSize: "0.9rem",
    lineHeight: 1.5,
    flex: 1,
  },
  timestamp: {
    marginTop: "auto",
    fontSize: "0.75rem",
    color: "#9ca3af",
  },
};
