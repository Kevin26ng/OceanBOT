import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Waves, Fish, Microscope } from "lucide-react";

type Dataset = {
  name: string;
  provider: string;
  coverage: string;
  preview_url: string;
  api_url: string;
  columns_url: string;
};

type Catalog = Record<string, Dataset>;

const icons: Record<string, JSX.Element> = {
  oceanographic: <Waves className="h-4 w-4" />,
  fisheries: <Fish className="h-4 w-4" />,
  molecular: <Microscope className="h-4 w-4" />,
};

export default function Data() {
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<string>("oceanographic");
  const [catalog, setCatalog] = useState<Catalog>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCatalog() {
      try {
        const res = await fetch("http://localhost:8000/datasets");
        const data = await res.json();
        setCatalog(data);
      } catch (err) {
        console.error("Failed to fetch datasets", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCatalog();
  }, []);

  const list = useMemo(() => {
    const items = catalog[tab] ? [catalog[tab]] : [];
    if (!q.trim()) return items;
    const needle = q.toLowerCase();
    return items.filter((i) =>
      [i.name, i.provider, i.coverage].some((v) =>
        v.toLowerCase().includes(needle),
      ),
    );
  }, [q, tab, catalog]);

  if (loading) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold">Data Hub</h1>
        <p className="mt-2 text-muted-foreground">Loading datasets…</p>
      </div>
    );
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Data Hub</h1>
      <p className="mt-2 text-muted-foreground max-w-2xl">
        Explore harmonized datasets across oceanographic, fisheries, and
        molecular biodiversity domains.
      </p>

      <div className="mt-6 flex items-center gap-2">
        <div className="relative w-full max-w-xl">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search datasets, providers, coverage..."
            className="pl-9"
          />
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <Button onClick={() => setQ("")}>Clear</Button>
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v)}
        className="mt-6"
      >
        <TabsList>
          {Object.keys(catalog).map((key) => (
            <TabsTrigger key={key} value={key} className="gap-2">
              {icons[key]} {key.charAt(0).toUpperCase() + key.slice(1)}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(catalog).map((key) => (
          <TabsContent
            key={key}
            value={key}
            className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {list.length > 0 ? (
              list.map((d) => (
                <Card key={d.name} className="p-4">
                  <div className="text-sm text-muted-foreground">
                    {d.provider} • {d.coverage}
                  </div>
                  <h3 className="mt-1 font-semibold">{d.name}</h3>
                  <div className="mt-3 flex gap-2">
                    <a
                      href={d.preview_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline"
                    >
                      Preview
                    </a>
                    <span className="text-muted-foreground">•</span>
                    <a
                      href={d.api_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sky-700 hover:underline"
                    >
                      API
                    </a>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full rounded-md border p-6 text-center text-sm text-muted-foreground">
                No results. Try a different search.
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
