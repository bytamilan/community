import { Suspense } from 'react';
import { SpaceLayout } from '@/components/spaces/space-layout';
import { SpaceSearch } from '@/components/spaces/space-search';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface SpaceSearchPageProps {
  params: {
    id: string;
  };
}

export default function SpaceSearchPage({ params }: SpaceSearchPageProps) {
  return (
    <SpaceLayout spaceId={params.id}>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Search Space</CardTitle>
            <CardDescription>
              Search through posts, comments, and files in this space
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading search...</div>}>
              <SpaceSearch spaceId={params.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </SpaceLayout>
  );
}