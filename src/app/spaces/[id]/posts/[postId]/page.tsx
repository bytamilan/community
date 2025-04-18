import { Suspense } from 'react';
import { SpaceLayout } from '@/components/spaces/space-layout';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Tag } from 'lucide-react';
import { CommentList } from '@/components/comment-list';
import { CommentForm } from '@/components/comment-form';
import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';

interface PostPageProps {
  params: {
    id: string;
    postId: string;
  };
}

async function getPost(spaceId: string, postId: string) {
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/spaces/${spaceId}/posts/${postId}`,
    { next: { revalidate: 60 } }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return notFound();
    }
    throw new Error('Failed to fetch post');
  }

  return response.json();
}

export default async function PostPage({ params }: PostPageProps) {
  const post = await getPost(params.id, params.postId);

  return (
    <SpaceLayout spaceId={params.id}>
      <div className="container py-6">
        <div className="mb-6">
          <Button variant="ghost" asChild className="mb-4">
            <Link href={`/spaces/${params.id}/posts`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Posts
            </Link>
          </Button>

          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          
          <div className="flex items-center gap-4 text-muted-foreground mb-6">
            <span>by {post.author.name}</span>
            <span>•</span>
            <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
            {post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  <div className="flex gap-2">
                    {post.tags.map((tag: string) => (
                      <span
                        key={tag}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="prose dark:prose-invert max-w-none mb-8">
            {post.content}
          </div>

          <hr className="my-8" />

          <div className="space-y-6">
            <h2 className="text-2xl font-semibold">Comments</h2>
            <Suspense fallback={<div>Loading comments...</div>}>
              <CommentList postId={post.id} />
            </Suspense>
            <CommentForm postId={post.id} />
          </div>
        </div>
      </div>
    </SpaceLayout>
  );
}