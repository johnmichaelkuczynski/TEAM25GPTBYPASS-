import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { FileText, RefreshCcw } from "lucide-react";
import { format } from "date-fns";
import type { Document, RewriteJob } from "@shared/schema";

interface UserMaterials {
  documents: Document[];
  rewriteJobs: RewriteJob[];
}

export default function UserDashboard() {
  const { data: materials, isLoading } = useQuery<UserMaterials>({
    queryKey: ["/api/user/materials"],
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <p className="text-gray-500">Loading your saved materials...</p>
      </div>
    );
  }

  if (!materials) {
    return (
      <div className="p-6">
        <p className="text-gray-500">No materials found</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">My Saved Materials</h2>
      
      <Tabs defaultValue="rewriteJobs" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="rewriteJobs" data-testid="tab-rewrite-jobs">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Rewrite Jobs ({materials.rewriteJobs.length})
          </TabsTrigger>
          <TabsTrigger value="documents" data-testid="tab-documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents ({materials.documents.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rewriteJobs" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {materials.rewriteJobs.length === 0 ? (
                <p className="text-gray-500">No rewrite jobs saved yet</p>
              ) : (
                materials.rewriteJobs.map((job) => (
                  <Card key={job.id} data-testid={`card-rewrite-job-${job.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">
                            {job.createdAt && format(new Date(job.createdAt), "PPP")}
                          </CardTitle>
                          <CardDescription>
                            Provider: {job.provider} • Status: {job.status}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          {job.inputAiScore !== null && (
                            <Badge variant="outline">
                              Input AI: {job.inputAiScore}%
                            </Badge>
                          )}
                          {job.outputAiScore !== null && (
                            <Badge variant="outline">
                              Output AI: {job.outputAiScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <h4 className="text-sm font-semibold mb-1">Input:</h4>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {job.inputText}
                          </p>
                        </div>
                        {job.outputText && (
                          <div>
                            <h4 className="text-sm font-semibold mb-1">Output:</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {job.outputText}
                            </p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {materials.documents.length === 0 ? (
                <p className="text-gray-500">No documents saved yet</p>
              ) : (
                materials.documents.map((doc) => (
                  <Card key={doc.id} data-testid={`card-document-${doc.id}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{doc.filename}</CardTitle>
                          <CardDescription>
                            {doc.createdAt && format(new Date(doc.createdAt), "PPP")}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {doc.wordCount} words
                          </Badge>
                          {doc.aiScore !== null && (
                            <Badge variant="outline">
                              AI Score: {doc.aiScore}%
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 line-clamp-3">
                        {doc.content}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}
