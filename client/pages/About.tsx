import { useEffect } from "react";
import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Users,
  Cpu,
  Database,
  Globe2,
  GitBranch,
} from "lucide-react";

const team = [
  {
    name: "Kevin Ngangom",
    role: "Backend Developer",
    bio: "Marine ecologist with 15+ years in ecosystem modeling.",
  },
  {
    name: "Hitanshu Choraria",
    role: "Lead Engineer",
    bio: "Distributed systems and data pipelines specialist.",
  },
  {
    name: "Mahi",
    role: "AI Researcher",
    bio: "Computational biologist focused on eDNA analyses.",
  },
  {
    name: "Aman Anubhav",
    role: "Product",
    bio: "Designing developer-first APIs and UX for scientists.",
  },
  {
    name: "Megha",
    role: "Data Engineer",
    bio: "Time-series and geospatial ETL wizard.",
  },
  {
    name: "Ammar",
    role: "Community & Outreach",
    bio: "Partnerships with research institutions and NGOs.",
  },
];

export default function About() {
  React.useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 },
    );
    document.querySelectorAll(".reveal").forEach((el) => obs.observe(el));

    return () => obs.disconnect();
  }, []);

  return (
    <div className="container py-12">
      {/* Hero */}
      <header className="grid gap-6 md:grid-cols-2 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            About OceanIQ
          </h1>
          <p className="mt-4 text-muted-foreground max-w-2xl">
            OceanIQ unifies oceanographic, fisheries, and molecular biodiversity
            data with AI-augmented discovery, harmonization, and governance —
            designed for researchers, managers, and developers who demand
            trustworthy, interoperable data.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button className="inline-flex items-center gap-2 bg-sky-600 text-white">
              Request a demo
            </Button>
            <a
              href="/data"
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2"
            >
              Explore Data Hub
            </a>
          </div>
        </div>
      </header>

      {/* Mission (moved below header) */}
      <section className="mt-8 reveal slide-in-left">
        <Card className="p-6 bg-gradient-to-tr from-sky-50 to-cyan-50 hover:shadow-xl hover:-translate-y-2 transition-transform">
          <h2 className="text-2xl font-bold">Mission</h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Our mission is to make ocean data discoverable, interoperable and
            actionable — to support better science, policy, and sustainable blue
            economies. We combine robust pipelines, transparent provenance, and
            AI that helps rather than obscures.
          </p>
        </Card>
      </section>

      {/* Why we exist - moved below mission */}
      <section className="mt-8 reveal slide-in-right">
        <Card className="p-6 bg-gradient-to-tr from-sky-50 to-cyan-50 hover:shadow-xl hover:-translate-y-2 transition-transform">
          <h2 className="text-2xl font-bold">Why we exist</h2>
          <p className="mt-3 text-muted-foreground max-w-3xl">
            Ocean data is fragmented across formats, vocabularies, and
            organizations. We bring these together with transparent processing
            and curated semantics so teams can focus on science and policy.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 text-sky-600 floaty" />
              <div>
                <div className="font-semibold">Reduce friction</div>
                <div className="text-xs text-muted-foreground">
                  One platform for discovery to delivery
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Globe2 className="h-5 w-5 text-sky-600 floaty" />
              <div>
                <div className="font-semibold">Scale globally</div>
                <div className="text-xs text-muted-foreground">
                  From local surveys to ocean basins
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-sky-600 floaty" />
              <div>
                <div className="font-semibold">Trust & provenance</div>
                <div className="text-xs text-muted-foreground">
                  Auditable lineage and versioning
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Cpu className="h-5 w-5 text-sky-600 floaty" />
              <div>
                <div className="font-semibold">Actionable insights</div>
                <div className="text-xs text-muted-foreground">
                  AI-assisted summaries with explainability
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>

      {/* Who is it built for */}
      <section className="mt-12 reveal">
        <h2 className="text-2xl font-bold">Who is OceanIQ built for?</h2>
        <p className="mt-2 text-muted-foreground max-w-3xl">
          We serve a diverse audience — from research labs to fishery managers
          and platform developers.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5 hover:translate-y-1 hover:shadow-lg transition-transform">
            <h3 className="font-semibold">Scientists & Researchers</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              High fidelity data, provenance, and tools for reproducible
              science.
            </p>
            <ul className="mt-3 text-sm space-y-1 text-muted-foreground">
              <li>
                Ready-to-use datasets, descriptors, and Jupyter-ready exports
              </li>
              <li>Integrated taxonomic resolution and eDNA pipelines</li>
            </ul>
          </Card>

          <Card className="p-5 hover:translate-y-1 hover:shadow-lg transition-transform">
            <h3 className="font-semibold">Managers & NGOs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Operational dashboards for compliance, MPA monitoring, and
              reporting.
            </p>
            <ul className="mt-3 text-sm space-y-1 text-muted-foreground">
              <li>Custom alerts and change detection</li>
              <li>Policy-ready summary exports</li>
            </ul>
          </Card>

          <Card className="p-5 hover:translate-y-1 hover:shadow-lg transition-transform">
            <h3 className="font-semibold">Developers & Integrators</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              APIs, SDKs, and sample pipelines to integrate into products.
            </p>
            <ul className="mt-3 text-sm space-y-1 text-muted-foreground">
              <li>REST, GraphQL, and tile endpoints</li>
              <li>Role-based access and signed URL workflows</li>
            </ul>
          </Card>
        </div>
      </section>

      {/* Values and commitments (moved above team) */}
      <section className="mt-12 reveal slide-in-right">
        <h2 className="text-2xl font-bold">Values & commitments</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-5 hover:-translate-y-2 hover:shadow-2xl transition-transform bg-gradient-to-tr from-sky-50 to-cyan-50">
            <h4 className="font-semibold">Open science</h4>
            <p className="text-sm mt-2 text-muted-foreground">
              We publish schemas and connectors under open licenses where
              possible.
            </p>
          </Card>

          <Card className="p-5 hover:-translate-y-2 hover:shadow-2xl transition-transform bg-gradient-to-tr from-sky-50 to-cyan-50">
            <h4 className="font-semibold">Responsible AI</h4>
            <p className="text-sm mt-2 text-muted-foreground">
              Model cards, audits, and human-in-the-loop curation for sensitive
              tasks.
            </p>
          </Card>

          <Card className="p-5 hover:-translate-y-2 hover:shadow-2xl transition-transform bg-gradient-to-tr from-sky-50 to-cyan-50">
            <h4 className="font-semibold">Community-first</h4>
            <p className="text-sm mt-2 text-muted-foreground">
              We partner with researchers, NGOs, and local communities to
              co-design features.
            </p>
          </Card>
        </div>
      </section>

      {/* The Team */}
      <section className="mt-12">
        <h2 className="text-2xl font-bold reveal">The team</h2>
        <p className="mt-2 text-muted-foreground max-w-3xl reveal">
          A multidisciplinary group spanning oceanography, data engineering, and
          AI research.
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-3">
          {team.map((p, i) => (
            <article
              key={p.name}
              className="team-card reveal rounded-xl border p-5 bg-card transition-transform hover:translate-y-1 hover:shadow-lg"
            >
              <div className="flex items-center gap-4">
                <div className="team-avatar">
                  {p.name
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")}
                </div>
                <div>
                  <div className="font-semibold">{p.name}</div>
                  <div className="text-sm text-muted-foreground">{p.role}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.bio}</p>

              <div className="mt-4 flex gap-2">
                <a className="text-sky-700 hover:underline" href="#">
                  Profile
                </a>
                <a className="text-muted-foreground">•</a>
                <a className="text-muted-foreground" href="#">
                  LinkedIn
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-12 reveal slide-in-left">
        <h2 className="text-2xl font-bold">Architecture (brief)</h2>
        <div className="slide-left-inner">
          <p className="mt-2 text-muted-foreground max-w-3xl">
            Adapters ingest from sensors, files, and APIs; a semantic layer maps
            into a knowledge graph; compute and storage are separated to enable
            scalable analytics and reproducible pipelines.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <Card className="p-5 hover:scale-105 transition-transform">
              <div className="flex items-start gap-3">
                <Database className="h-5 w-5 text-sky-600" />
                <div>
                  <div className="font-semibold">Storage</div>
                  <div className="text-sm text-muted-foreground">
                    Time series, object storage, and graph indexes
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:scale-105 transition-transform">
              <div className="flex items-start gap-3">
                <GitBranch className="h-5 w-5 text-sky-600" />
                <div>
                  <div className="font-semibold">Lineage</div>
                  <div className="text-sm text-muted-foreground">
                    Versioning and provenance for every dataset
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-5 hover:scale-105 transition-transform">
              <div className="flex items-start gap-3">
                <Cpu className="h-5 w-5 text-sky-600" />
                <div>
                  <div className="font-semibold">Compute</div>
                  <div className="text-sm text-muted-foreground">
                    Batch and streaming pipelines with reproducible transforms
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <footer className="mt-12 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} OceanIQ — building responsible,
        interoperable ocean data products.
      </footer>
    </div>
  );
}
