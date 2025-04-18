import { SpaceLayout } from '@/components/spaces/space-layout';
import { SpacePostsList } from '@/components/spaces/space-posts-list';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusIcon } from 'lucide-react';

interface PostsPageProps {
  params: {
    id: string;
  };
}

export default function PostsPage({ params }: PostsPageProps) {
  return (
    <SpaceLayout spaceId={params.id}>
      <div className="container py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Posts</h1>
          <Button asChild>
            <Link href={`/spaces/${params.id}/new`}>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Post
            </Link>
          </Button>
        </div>
        
        <SpacePostsList spaceId={params.id} />
      </div>
    </SpaceLayout>
  );
}