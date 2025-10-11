import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Database,
  Search,
  Fish,
  Waves,
  Microscope,
  Share2,
  Bot,
  ShieldCheck,
  Globe2,
  Camera,
  AlertCircle,
  ImageIcon,
  X,
  Text
} from "lucide-react";

const domains = [
  {
    icon: Waves,
    title: "Oceanographic",
    desc: "Currents, temperature, salinity, bathymetry, remote sensing.",
  },
  {
    icon: Fish,
    title: "Fisheries",
    desc: "Catch records, effort, VMS/AIS, stock assessments, traceability.",
  },
  {
    icon: Microscope,
    title: "Molecular Biodiversity",
    desc: "eDNA, metagenomics, barcode repositories, taxonomic knowledge.",
  },
];

const features = [
  {
    icon: Database,
    title: "Ingest & Harmonize",
    desc: "Auto-ingest from files, APIs, and sensors. Harmonize to a unified schema with quality checks.",
  },
  {
    icon: Bot,
    title: "AI Reasoning",
    desc: "LLM-powered entity resolution, unit conversion, and metadata enrichment across domains.",
  },
  {
    icon: ShieldCheck,
    title: "Governance",
    desc: "Versioning, lineage, PII safeguards, and role-based access built-in for teams and partners.",
  },
  {
    icon: Share2,
    title: "Publish & APIs",
    desc: "Share datasets and dashboards securely. One-click APIs and SDKs for developers.",
  },
];

export default function Index() {
  const [q, setQ] = React.useState("");
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<File | null>(null);
  const [imageDescription, setImageDescription] = React.useState("");
  const fileRef = React.useRef<HTMLInputElement | null>(null);
  const [aiResult, setAiResult] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [activeTab, setActiveTab] = React.useState<"text" | "image">("text");
  const [useDescription, setUseDescription] = React.useState(false);

  const onChooseImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      setError("Please select an image file (JPEG, PNG, etc.)");
      return;
    }
    
    setSelectedImage(file);
    setError(null);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setImageDescription("");
    setUseDescription(false);
    if (fileRef.current) {
      fileRef.current.value = "";
    }
  };

  const handleSearch = async () => {
    if (activeTab === "text" && !q.trim()) {
      setError("Please enter a search query");
      return;
    }

    if (activeTab === "image" && !selectedImage && !imageDescription) {
      setError("Please select an image or describe it for analysis");
      return;
    }

    setLoading(true);
    setAiResult(null);
    setError(null);

    try {
      if (activeTab === "text") {
        // Text-based search
        const response = await fetch("http://localhost:8000/ai-search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query: q }),
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        setAiResult(data.result);
      } else {
        // Image analysis - try direct upload first
        if (selectedImage && !useDescription) {
          const formData = new FormData();
          formData.append("file", selectedImage as File);

          const response = await fetch("http://localhost:8000/classify-image", {
            method: "POST",
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(`Classification failed: ${response.status} - ${errorData.detail || response.statusText}`);
          }

          const data = await response.json();
          
          if (data.status === "success" || data.status === "partial_success") {
            setAiResult(data.classification);
            if (data.note) {
              setError(data.note); // Show informational note
            }
          } else {
            throw new Error(data.error || "Unknown error occurred");
          }
        } else {
          // Use text description for image analysis
          const descriptionToUse = imageDescription || "the uploaded marine image";
          
          const response = await fetch("http://localhost:8000/ai-search", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ 
              query: `Analyze this marine image description: ${descriptionToUse}. Please identify any marine species, habitat characteristics, behaviors, and provide scientific insights.` 
            }),
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          setAiResult(data.result);
        }
      }
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message || "Failed to process your request. Please try again.");
    } finally {
      setLoading(false);
    }  
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen text-foreground">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="scroll-overlay pointer-events-none absolute inset-0 transition-opacity duration-300"
          aria-hidden
        />
        <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_50%_-10%,theme(colors.sky.500/30),transparent_70%)]" />
        <div
          className="absolute inset-0 pointer-events-none select-none opacity-40"
          aria-hidden
        >
          <svg
            className="absolute -left-20 top-24 h-96 w-[48rem] text-sky-700/20"
            viewBox="0 0 800 400"
            fill="none"
          >
            <path
              d="M0,200 C150,300 250,100 400,200 C550,300 650,100 800,200"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M0,240 C150,340 250,140 400,240 C550,340 650,140 800,240"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M0,280 C150,380 250,180 400,280 C550,380 650,180 800,280"
              stroke="currentColor"
              strokeWidth="1.5"
            />
          </svg>
        </div>

        <div className="container relative py-20 md:py-28 text-center">
          {/* Centered badge */}
          <div className="mx-auto mb-6 inline-flex items-center justify-center">
            <Badge className="text-lg md:text-xl px-6 py-3 rounded-full bg-sky-400/20 text-sky-50 border-sky-300/30">
              Unified Ocean Intelligence
            </Badge>
          </div>

          {/* Search type selector */}
          <div className="flex justify-center mb-6">
            <div className="inline-flex rounded-md bg-white/10 p-1" role="group">
              <button
                onClick={() => setActiveTab("text")}
                className={`px-4 py-2 text-sm font-medium rounded-l-md ${
                  activeTab === "text" 
                    ? "bg-sky-600 text-white" 
                    : "bg-transparent text-white/70 hover:bg-white/5"
                }`}
              >
                <Search className="h-4 w-4 inline mr-2" />
                Text Search
              </button>
              <button
                onClick={() => setActiveTab("image")}
                className={`px-4 py-2 text-sm font-medium rounded-r-md ${
                  activeTab === "image" 
                    ? "bg-sky-600 text-white" 
                    : "bg-transparent text-white/70 hover:bg-white/5"
                }`}
              >
                <ImageIcon className="h-4 w-4 inline mr-2" />
                Image Analysis
              </button>
            </div>
          </div>

          {/* Search with image upload */}
          <div className="mx-auto mt-4 flex max-w-2xl items-center gap-2 rounded-full bg-white/90 p-2 shadow-lg ring-1 ring-white/40 backdrop-blur">
            {activeTab === "text" ? (
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search marine data, species, locations, datasets..."
                className="h-12 rounded-full border-0 bg-transparent text-base focus-visible:ring-sky-500"
              />
            ) : (
              <div className="flex-1 flex items-center justify-between px-4">
                {selectedImage ? (
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-5 w-5 text-sky-600" />
                    <span className="text-sm truncate max-w-xs">{selectedImage.name}</span>
                    <button
                      onClick={removeImage}
                      className="p-1 hover:bg-slate-100 rounded-full"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <span className="text-slate-500 text-sm">Select an image to analyze...</span>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  onChange={onChooseImage}
                  className="hidden"
                />
                <button
                  onClick={() => fileRef.current?.click()}
                  className="text-sm text-sky-600 hover:text-sky-700 font-medium"
                >
                  Browse
                </button>
              </div>
            )}

            <Button
              className="h-12 rounded-full px-6 bg-sky-600 hover:bg-sky-500 text-white"
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Analyzing...
                </div>
              ) : (
                <>
                  <Search className="mr-2 h-4 w-4" /> 
                  {activeTab === "text" ? "Search" : "Analyze"}
                </>
              )}
            </Button>
          </div>

          {/* Image description input */}
          {activeTab === "image" && (
            <div className="mx-auto mt-4 max-w-2xl">
              <div className="flex items-center mb-2">
                <Text className="h-4 w-4 mr-2 text-sky-600" />
                <span className="text-sm text-slate-600">Or describe your image:</span>
              </div>
              <Input
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Describe what you see in the image (e.g., 'a colorful coral reef with tropical fish')"
                className="rounded-full bg-white/90"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id="useDescription"
                  checked={useDescription}
                  onChange={(e) => setUseDescription(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="useDescription" className="text-sm text-slate-600">
                  Use description instead of image upload
                </label>
              </div>
            </div>
          )}

          {imagePreview && !useDescription && (
            <div className="mx-auto mt-4 w-48 relative">
              <img
                src={imagePreview}
                alt="preview"
                className="rounded-md border shadow-sm"
              />
              <button
                onClick={removeImage}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="mx-auto mt-4 max-w-2xl">
            {loading && (
              <div className="flex items-center justify-center text-sky-500">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500 mr-2"></div>
                {activeTab === "text" ? "Fetching AI insights..." : "Analyzing image..."}
              </div>
            )}
            
            {error && (
              <Card className="p-4 bg-red-50 text-red-800 mt-2 border-red-200">
                <div className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2" />
                  <h3 className="font-semibold">Error</h3>
                </div>
                <p className="mt-2">{error}</p>
              </Card>
            )}
            
            {aiResult && (
              <Card className="p-4 bg-white/90 text-foreground mt-2">
                <div className="flex items-center mb-3">
                  <Badge className="mr-2 bg-sky-100 text-sky-700 hover:bg-sky-200">
                    <Bot className="h-3 w-3 mr-1" /> 
                    {activeTab === "text" ? "AI Insights" : "Image Analysis"}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Marine Biology
                  </Badge>
                </div>
                <div className="whitespace-pre-line">{aiResult}</div>
              </Card>
            )}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
            {[
              "Sea surface temp",
              "Chondrichthyes",
              "eDNA",
              "AIS/VMS",
              "MPAs",
              "Coral reefs",
            ].map((t) => (
              <span
                key={t}
                className="rounded-full bg-white/10 px-3 py-1 text-white/80 ring-1 ring-white/20 cursor-pointer hover:bg-white/20"
                onClick={() => {
                  setActiveTab("text");
                  setQ(t);
                  setTimeout(() => handleSearch(), 100);
                }}
              >
                {t}
              </span>
            ))}
          </div>

          {/* Features marquee */}
          <div className="mt-10 overflow-hidden">
            <div className="marquee">
              <div className="marquee-inner">
                {features.concat(features).map((f, idx) => (
                  <Card
                    key={f.title + String(idx)}
                    className="m-2 w-72 border-white/20 bg-white/5 p-4 text-white/90 transform transition-transform duration-200 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                  >
                    <div className="flex items-start gap-3">
                      <f.icon className="h-5 w-5 text-sky-300" />
                      <div>
                        <h3 className="font-semibold">{f.title}</h3>
                        <p className="mt-1 text-sm text-white/80">{f.desc}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <a
              href="/data"
              className={cn(
                "inline-flex h-11 items-center rounded-md bg-sky-600 px-5 text-white shadow hover:bg-sky-500",
              )}
            >
              Explore Data
            </a>
            <a
              href="#contact"
              className="inline-flex h-11 items-center rounded-md bg-white/10 px-5 text-white ring-1 ring-white/30 hover:bg-white/15"
            >
              Request a Demo
            </a>
          </div>
        </div>
      </section>

      {/* Domains */}
      <section className="bg-slate-950">
        <div className="container py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Marine Data Domains</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Explore our comprehensive marine data coverage across these key domains
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-3">
            {domains.map((d) => (
              <div
                key={d.title}
                className="rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-lg transition-all duration-300 hover:shadow-xl hover:border-sky-400/30 hover:translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 rounded-lg bg-sky-900/30">
                    <d.icon className="h-6 w-6 text-sky-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{d.title}</h3>
                </div>
                <p className="mt-3 text-sm text-slate-300">{d.desc}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {["Datasets", "APIs", "Pipelines"].map((k) => (
                    <Badge 
                      key={k}
                      variant="outline" 
                      className="text-xs bg-sky-900/20 text-sky-300 border-sky-700/50"
                    >
                      {k}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why */}
      <section className="relative bg-white">
        <div className="container py-16">
          <div className="grid items-center gap-10 md:grid-cols-2">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">
                From raw data to decisions
              </h2>
              <p className="mt-4 text-muted-foreground">
                OceanIQ unifies disparate marine datasets into a knowledge graph
                and exposes them via powerful search, analytics, and
                interoperable APIs. Build models, monitor ecosystems, and inform
                policy—fast.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <Globe2 className="h-4 w-4 text-sky-600 mt-0.5" /> Global
                  coverage with harmonized vocabularies
                </li>
                <li className="flex items-start gap-2">
                  <Bot className="h-4 w-4 text-sky-600 mt-0.5" /> AI assistance
                  for discovery and metadata curation
                </li>
                <li className="flex items-start gap-2">
                  <Share2 className="h-4 w-4 text-sky-600 mt-0.5" /> Share as
                  FAIR datasets, tiles, and APIs
                </li>
              </ul>
              <div className="mt-6 flex gap-3">
                <a
                  href="/publish"
                  className="inline-flex h-10 items-center rounded-md bg-sky-600 px-4 text-white hover:bg-sky-500"
                >
                  Publish Data
                </a>
                <a
                  href="/dashboard"
                  className="inline-flex h-10 items-center rounded-md border px-4 hover:bg-accent"
                >
                  View Dashboard
                </a>
              </div>
            </div>
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              {/* KPIs marquee */}
              <div className="overflow-hidden">
                <div className="marquee marquee-kpis">
                  <div className="marquee-inner flex gap-4 py-2">
                    {[
                      { label: "Datasets", value: "58k+" },
                      { label: "Species", value: "240k+" },
                      { label: "Vessels", value: "120k+" },
                      { label: "Genomes", value: "95k+" },
                    ]
                      .concat([
                        { label: "Datasets", value: "58k+" },
                        { label: "Species", value: "240k+" },
                        { label: "Vessels", value: "120k+" },
                        { label: "Genomes", value: "95k+" },
                      ])
                      .map((s, i) => (
                        <div
                          key={s.label + i}
                          className="kpi-card rounded-lg border bg-white p-4 text-center min-w-[140px] transition-transform duration-200 hover:-translate-y-2 hover:scale-105 hover:shadow-2xl"
                        >
                          <div className="text-2xl font-bold text-sky-700">
                            {s.value}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {s.label}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-lg bg-gradient-to-tr from-sky-100 to-cyan-100 p-4 text-sm text-sky-900">
                <p className="font-semibold">Knowledge Graph</p>
                <p className="mt-1">
                  Entities: Stations, Cruises, Species, Habitats, Vessels, Taxa,
                  Genes
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="relative bg-gradient-to-tr from-sky-600 to-cyan-600"
      >
        <div className="container py-14 text-center text-white">
          <h3 className="text-2xl md:text-3xl font-bold tracking-tight">
            Ready to accelerate marine insights?
          </h3>
          <p className="mt-2 text-white/90">
            Schedule a demo to see OceanIQ in action.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <a
              href="/data"
              className="inline-flex h-11 items-center rounded-md bg-white px-5 text-sky-700 hover:bg-white/90"
            >
              Explore Data
            </a>
            <a
              href="mailto:hello@oceaniq.ai"
              className="inline-flex h-11 items-center rounded-md border border-white/40 px-5 text-white hover:bg-white/10"
            >
              Email Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}  