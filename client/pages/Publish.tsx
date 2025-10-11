import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, GitBranch, Share2, ShieldCheck, Database, FileUp, Link } from "lucide-react";
import { useState } from "react";

export default function Publish() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [datasetInfo, setDatasetInfo] = useState({
    name: "",
    description: "",
    license: "CC-BY-4.0",
    visibility: "private"
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Auto-populate dataset name from filename
      setDatasetInfo(prev => ({
        ...prev,
        name: file.name.replace(/\.[^/.]+$/, "") // Remove extension
      }));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadStatus("idle");
    
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("name", datasetInfo.name);
      formData.append("description", datasetInfo.description);
      formData.append("license", datasetInfo.license);
      formData.append("visibility", datasetInfo.visibility);
      
      const response = await fetch("http://localhost:8000/publish/dataset", {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        setUploadStatus("success");
        setSelectedFile(null);
        setDatasetInfo({ name: "", description: "", license: "CC-BY-4.0", visibility: "private" });
      } else {
        setUploadStatus("error");
      }
    } catch (error) {
      setUploadStatus("error");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCreatePublicLink = async () => {
    try {
      const response = await fetch("http://localhost:8000/publish/generate-link", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ datasetId: "example-dataset-id" }),
      });
      
      if (response.ok) {
        const data = await response.json();
        navigator.clipboard.writeText(data.shareableLink);
        alert("Public link copied to clipboard!");
      }
    } catch (error) {
      console.error("Error creating public link:", error);
    }
  };

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold tracking-tight">Publish datasets</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Turn raw files and APIs into versioned, FAIR datasets with provenance, licenses, and access control.
      </p>

      {/* Upload Section */}
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Upload new dataset</h2>
        
        <div className="grid gap-4 md:grid-cols-2">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium mb-2">Select file</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={handleFileSelect}
                accept=".csv,.json,.txt,.nc,.fastq"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600">
                  {selectedFile ? selectedFile.name : "Drag and drop or click to browse"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Supports CSV, JSON, NetCDF, FASTQ
                </p>
              </label>
            </div>
          </div>

          {/* Dataset Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Dataset name</label>
              <input
                type="text"
                value={datasetInfo.name}
                onChange={(e) => setDatasetInfo({...datasetInfo, name: e.target.value})}
                className="w-full p-2 border rounded-md"
                placeholder="Enter dataset name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={datasetInfo.description}
                onChange={(e) => setDatasetInfo({...datasetInfo, description: e.target.value})}
                className="w-full p-2 border rounded-md"
                rows={3}
                placeholder="Describe your dataset"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">License</label>
                <select
                  value={datasetInfo.license}
                  onChange={(e) => setDatasetInfo({...datasetInfo, license: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="CC-BY-4.0">CC BY 4.0</option>
                  <option value="CC-BY-SA-4.0">CC BY-SA 4.0</option>
                  <option value="MIT">MIT</option>
                  <option value="Apache-2.0">Apache 2.0</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Visibility</label>
                <select
                  value={datasetInfo.visibility}
                  onChange={(e) => setDatasetInfo({...datasetInfo, visibility: e.target.value})}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="private">Private</option>
                  <option value="public">Public</option>
                  <option value="shared">Shared</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button 
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
            className="bg-sky-600 hover:bg-sky-500 text-white"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Uploading...
              </>
            ) : (
              <>
                <FileUp className="mr-2 h-4 w-4"/>
                Publish Dataset
              </>
            )}
          </Button>
          
          {uploadStatus === "success" && (
            <div className="text-green-600 flex items-center">
              ✓ Dataset published successfully!
            </div>
          )}
          
          {uploadStatus === "error" && (
            <div className="text-red-600 flex items-center">
              ✗ Upload failed. Please try again.
            </div>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="mt-8 grid gap-6 md:grid-cols-3">
        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <Upload className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="font-semibold">Ingest</h3>
              <p className="mt-1 text-sm text-muted-foreground">Upload CSV/NetCDF/FASTQ or connect live APIs and sensors.</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <GitBranch className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="font-semibold">Version & lineage</h3>
              <p className="mt-1 text-sm text-muted-foreground">Every change tracked with reproducible pipelines and metadata.</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-5 hover:shadow-md transition-shadow cursor-pointer">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-sky-600" />
            <div>
              <h3 className="font-semibold">Govern access</h3>
              <p className="mt-1 text-sm text-muted-foreground">Private, shared, or public with roles and signed URLs.</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Share Section */}
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold">One-click share</h2>
        <p className="mt-1 text-muted-foreground">Expose as REST, GraphQL, or tiles. Embed interactive dashboards anywhere.</p>
        <div className="mt-4 flex gap-3">
          <Button 
            onClick={handleCreatePublicLink}
            className="bg-sky-600 hover:bg-sky-500 text-white"
          >
            <Share2 className="mr-2 h-4 w-4"/> 
            Create public link
          </Button>
          <a href="mailto:hello@oceaniq.ai" className="inline-flex h-10 items-center rounded-md border px-4">
            Talk to us
          </a>
        </div>
      </div>

      {/* Recent Datasets */}
      <div className="mt-8 rounded-xl border bg-card p-6">
        <h2 className="text-xl font-semibold mb-4">Your datasets</h2>
        <div className="text-center py-8 text-muted-foreground">
          <Database className="mx-auto h-12 w-12 mb-3 opacity-50" />
          <p>No datasets published yet. Upload your first dataset to get started.</p>
        </div>
      </div>
    </div>
  );
}