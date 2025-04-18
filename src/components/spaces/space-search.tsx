'use client'
import React, { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSpace } from '@/hooks/use-space';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import {
  FileText,
  Search,
  Users,
  Calendar,
  BookOpen,
  Search as SearchIcon,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import {fetchData} from "@/lib/api-utils";

interface SearchResult {
  id: string;
  type: 'post' | 'comment' | 'member' | 'file';
  title: string;
  description?: string;
  url: string;
  createdAt: string;
  author?: {
    name: string;
    avatarUrl?: string;
  };
}

interface SpaceSearchProps {
  spaceId: string;
  onClose?: () => void;
}

export function SpaceSearch({ spaceId, onClose }: SpaceSearchProps) {
  const router = useRouter();
  const { canAccess } = useSpace({ spaceId });
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || !canAccess(spaceId, 'view')) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // This would be replaced with your actual API call
      const data = await fetchData(`/api/spaces/${spaceId}/search?q=${encodeURIComponent(searchQuery)}`);
      setResults(data);
    } catch (error) {
      console.error('Error searching space:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [spaceId, canAccess]);

  // Debounce the search to avoid too many API calls
  const debouncedSearch = debounce(performSearch, 300);

  const handleSearch = (searchQuery: string) => {
    setQuery(searchQuery);
    debouncedSearch(searchQuery);
  };

  const getIcon = (type: SearchResult['type']) => {
    switch (type) {
      case 'post':
        return <FileText className="h-4 w-4" />;
      case 'comment':
        return <BookOpen className="h-4 w-4" />;
      case 'member':
        return <Users className="h-4 w-4" />;
      case 'file':
        return <FileText className="h-4 w-4" />;
      default:
        return <SearchIcon className="h-4 w-4" />;
    }
  };

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    onClose?.();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts, comments, and more..."
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="h-[500px]">
        <div className="space-y-2">
          {isSearching ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : results.length > 0 ? (
            results.map((result) => (
              <Card
                key={result.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleResultClick(result)}
              >
                <CardHeader className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        {getIcon(result.type)}
                        <CardTitle className="text-sm font-medium">
                          {result.title}
                        </CardTitle>
                      </div>
                      {result.description && (
                        <CardDescription className="line-clamp-2">
                          {result.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {result.author && <span>{result.author.name}</span>}
                      <span className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(result.createdAt)}</span>
                      </span>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            ))
          ) : query && !isSearching ? (
            <div className="text-center py-8 text-muted-foreground">
              No results found for "{query}"
            </div>
          ) : null}
        </div>
      </ScrollArea>
    </div>
  );
}