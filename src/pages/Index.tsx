import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ExternalLink, Video, Copy, Check, Search, FilterX, Download, FileJson } from "lucide-react";
import { toast } from "sonner";

interface Lesson {
  category: string;
  title: string;
  page_url: string;
  video_url: string | null;
}

const Index = () => {
  const [jsonInput, setJsonInput] = useState('');
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const handleParse = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      if (Array.isArray(parsed)) {
        setLessons(parsed);
        toast.success(`Loaded ${parsed.length} lessons`);
      } else {
        toast.error("Invalid format: Expected an array of lessons");
      }
    } catch (e) {
      toast.error("Invalid JSON. Make sure you copied the entire output.");
    }
  };

  const categories = useMemo(() => {
    const cats = new Set(lessons.map(l => l.category));
    return ['all', ...Array.from(cats)];
  }, [lessons]);

  const filteredLessons = useMemo(() => {
    return lessons.filter(lesson => {
      const matchesSearch = lesson.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           lesson.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || lesson.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [lessons, searchQuery, categoryFilter]);

  const downloadCSV = () => {
    const headers = ['Category', 'Title', 'Page URL', 'Video URL'];
    const rows = lessons.map(l => [
      `"${l.category.replace(/"/g, '""')}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      l.page_url,
      l.video_url || ''
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'course_lessons.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Downloaded");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">Course Data Viewer</h1>
          <p className="text-muted-foreground">Visualize and export your crawled Kajabi course content.</p>
        </div>

        {!lessons.length ? (
          <Card className="border-dashed border-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-primary" />
                Import Scraper Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <textarea
                className="w-full h-48 p-3 rounded-md border bg-muted/50 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder='Paste the JSON from your clipboard here...'
                value={jsonInput}
                onChange={(e) => setJsonInput(e.target.value)}
              />
              <Button onClick={handleParse} className="w-full h-12 text-lg">
                Parse & View Lessons
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Search Lessons</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search by title or category..." 
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className="w-full md:w-64 space-y-2">
                <label className="text-sm font-medium">Filter Category</label>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSearchQuery('');
                    setCategoryFilter('all');
                  }}
                  title="Clear Filters"
                >
                  <FilterX className="h-4 w-4" />
                </Button>
                <Button 
                  variant="secondary"
                  onClick={() => setLessons([])}
                >
                  Reset
                </Button>
              </div>
            </div>

            <Card>
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b pb-4 gap-4">
                <div>
                  <CardTitle>{filteredLessons.length} Lessons Found</CardTitle>
                  <p className="text-sm text-muted-foreground">Total lessons in course: {lessons.length}</p>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                    onClick={downloadCSV}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex-1 sm:flex-none"
                    onClick={() => {
                      copyToClipboard(JSON.stringify(lessons, null, 2));
                      setCopied(true);
                      setTimeout(() => setCopied(false), 2000);
                    }}
                  >
                    {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                    Copy JSON
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50">
                        <TableHead className="w-[200px] pl-6">Category</TableHead>
                        <TableHead>Lesson Title</TableHead>
                        <TableHead className="text-center">Video</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLessons.map((lesson, index) => (
                        <TableRow key={index} className="hover:bg-muted/30 transition-colors">
                          <TableCell className="pl-6">
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary max-w-[180px] truncate" title={lesson.category}>
                              {lesson.category}
                            </span>
                          </TableCell>
                          <TableCell className="font-medium">
                            {lesson.title}
                          </TableCell>
                          <TableCell className="text-center">
                            {lesson.video_url ? (
                              <div className="flex justify-center">
                                <a 
                                  href={lesson.video_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-medium text-sm"
                                >
                                  <Video className="h-4 w-4" />
                                  MP4
                                </a>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">No video</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                asChild
                                className="h-8 px-2"
                              >
                                <a href={lesson.page_url} target="_blank" rel="noopener noreferrer">
                                  <ExternalLink className="h-4 w-4 mr-1" />
                                  Page
                                </a>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredLessons.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                            No lessons found matching your search.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
