import { Suspense } from 'react';
import { SpaceLayout } from '@/components/spaces/space-layout';
import { SpacePostForm } from '@/components/spaces/space-post-form';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

interface NewPostPageProps {
  params: {
    id: string;
  };
}

export default function NewPostPage({ params }: NewPostPageProps) {
  return (
    <SpaceLayout spaceId={params.id}>
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Create New Post</CardTitle>
            <CardDescription>
              Share your thoughts, ideas, or questions with the space members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<div>Loading form...</div>}>
              <SpacePostForm spaceId={params.id} />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </SpaceLayout>
  );
}