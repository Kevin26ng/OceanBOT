import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart3, 
  Database, 
  Download,
  RefreshCw
} from "lucide-react";

const series = Array.from({ length: 12 }, (_, i) => ({
  month: new Date(2024, i, 1).toLocaleString("en", { month: "short" }),
  value: Math.round(50 + Math.sin(i / 2) * 25 + i * 2 + (i % 3) * 6),
}));

// Power BI Report Configuration
const powerBiReports = {
  oceanographic: {
    reportId: " 62e5a23c-ddac-49f1-a160-68cc40f6b07a/7e045f9f4fe9d6450a74 ",
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=oceanographic-id",
    title: "Oceanographic Data Analysis",
    description: "Temperature, salinity, and current patterns"
  },
  fisheries: {
    reportId: "your-fisheries-report-id", 
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=fisheries-id",
    title: "Fisheries Dashboard",
    description: "Catch records and stock assessments"
  },
  biodiversity: {
    reportId: "your-biodiversity-report-id",
    embedUrl: "https://app.powerbi.com/reportEmbed?reportId=biodiversity-id",
    title: "Biodiversity Metrics",
    description: "Species distribution and eDNA analysis"
  }
};

export default function Dashboard() {
  const [activeReport, setActiveReport] = useState("oceanographic");
  const [isLoading, setIsLoading] = useState(true);
  const reportContainer = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load Power BI script dynamically
    const loadPowerBI = async () => {
      try {
        // This would be where you initialize the Power BI embed
        // For now, we'll simulate loading
        setTimeout(() => setIsLoading(false), 1500);
        
        // In a real implementation, you would:
        // 1. Get an access token from your backend
        // 2. Initialize the Power BI embed
        // 3. Handle authentication and embedding
      } catch (error) {
        console.error("Failed to load Power BI:", error);
        setIsLoading(false);
      }
    };

    loadPowerBI();
  }, [activeReport]);

  const handleExport = () => {
    // This would trigger report export in a real implementation
    alert(`Exporting ${activeReport} report...`);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Insights Dashboard</h1>
      <p className="mt-2 text-muted-foreground">A glance at trends across datasets and domains.</p>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Kpi label="Datasets" value="58,214" />
        <Kpi label="Species" value="241,098" />
        <Kpi label="Vessels" value="121,553" />
      </div>

      <Card className="mt-8 p-4">
        <ChartContainer
          config={{ series: { label: "Records", color: "hsl(200 90% 45%)" } }}
          className="h-[300px]"
        >
          <LineChart data={series} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tickLine={false} axisLine={false} />
            <YAxis width={32} tickLine={false} axisLine={false} />
            <Line type="monotone" dataKey="value" stroke="var(--color-series)" strokeWidth={2} dot={false} />
            <ChartTooltip cursor={{ stroke: "hsl(0 0% 80%)" }} content={<ChartTooltipContent />} />
          </LineChart>
        </ChartContainer>
      </Card>

      {/* Power BI Reports Section */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Interactive Reports</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        <Tabs defaultValue="oceanographic" onValueChange={setActiveReport}>
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="oceanographic">
              <Database className="h-4 w-4 mr-2" />
              Oceanographic
            </TabsTrigger>
            <TabsTrigger value="fisheries">
              <BarChart3 className="h-4 w-4 mr-2" />
              Fisheries
            </TabsTrigger>
            <TabsTrigger value="biodiversity">
              <BarChart3 className="h-4 w-4 mr-2" />
              Biodiversity
            </TabsTrigger>
          </TabsList>

          {Object.entries(powerBiReports).map(([key, report]) => (
            <TabsContent key={key} value={key} className="mt-0">
              <Card>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">{report.title}</h3>
                  <p className="text-sm text-muted-foreground">{report.description}</p>
                </div>
                <div className="p-4 h-[500px] relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <RefreshCw className="h-8 w-8 animate-spin mx-auto text-sky-600" />
                        <p className="mt-2 text-muted-foreground">Loading report...</p>
                      </div>
                    </div>
                  ) : (
                    <div ref={reportContainer} className="h-full">
                      {/* Power BI Report will be embedded here */}
                      <div className="border-2 border-dashed border-slate-200 rounded-lg h-full flex items-center justify-center">
                        <div className="text-center p-6">
                          <BarChart3 className="h-12 w-12 mx-auto text-sky-400 mb-4" />
                          <h4 className="font-medium mb-2">Power BI Report</h4>
                          <p className="text-sm text-muted-foreground max-w-md">
                            This area would display the embedded Power BI report for {report.title}.
                            Configure with your actual Power BI embed URL and credentials.
                          </p>
                          <div className="mt-4 text-xs text-sky-600">
                            Report ID: {report.reportId}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <Card className="p-4 text-center">
      <div className="text-2xl font-bold text-sky-700">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}
