import { FileText, Download, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DocsDownload() {
  const handleDownload = (type: 'marketing' | 'team', format: 'md' | 'pdf') => {
    const endpoint = format === 'pdf' 
      ? `/api/docs/${type}/pdf`
      : `/api/docs/${type}`;
    window.open(endpoint, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Brandentifier Documentation
          </h1>
          <p className="text-lg text-gray-300">
            Download comprehensive guides for marketing and team reference
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                <BookOpen className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Marketing Guide</CardTitle>
              <CardDescription className="text-gray-300">
                Comprehensive marketing documentation for ChatGPT feed and campaigns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>Brand positioning & taglines</li>
                <li>Target audience personas</li>
                <li>Feature messaging</li>
                <li>Campaign ideas</li>
                <li>Competitive positioning</li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDownload('marketing', 'pdf')}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                  data-testid="button-download-marketing-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleDownload('marketing', 'md')}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  data-testid="button-download-marketing-md"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-all">
            <CardHeader>
              <div className="w-14 h-14 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-white" />
              </div>
              <CardTitle className="text-2xl text-white">Team Reference</CardTitle>
              <CardDescription className="text-gray-300">
                Technical documentation for the development team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="text-sm text-gray-400 space-y-2 mb-6">
                <li>System architecture</li>
                <li>Feature modules</li>
                <li>Data models & schemas</li>
                <li>AI infrastructure</li>
                <li>Operational guide</li>
              </ul>
              <div className="flex gap-3">
                <Button
                  onClick={() => handleDownload('team', 'pdf')}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
                  data-testid="button-download-team-pdf"
                >
                  <Download className="w-4 h-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={() => handleDownload('team', 'md')}
                  variant="outline"
                  className="flex-1 border-white/30 text-white hover:bg-white/10"
                  data-testid="button-download-team-md"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Markdown
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 text-sm">
            PDF generation may take a few seconds. The file will download automatically.
          </p>
        </div>
      </div>
    </div>
  );
}
