import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSpace } from '@/hooks/use-space';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  MoreVertical,
  PencilIcon,
  TrashIcon,
  Clock,
  Tag,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface Post {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    name: string;
    avatarUrl?: string;
  };
  createdAt: string;
  commentsCount: number;
}

interface SpacePostsListProps {
  spaceId: string;
}

export function SpacePostsList({ spaceId }: SpacePostsListProps) {
  const router = useRouter();
  const { canAccess } = useSpace({ spaceId });
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchPosts = React.useCallback(async () => {
    try {
      const response = await fetch(`/api/spaces/${spaceId}/posts`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  }, [spaceId]);

  React.useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleDelete = async (postId: string) => {
    if (!canAccess(spaceId, 'edit')) {
      toast.error('You do not have permission to delete posts');
      return;
    }

    try {
      const response = await fetch(`/api/spaces/${spaceId}/posts/${postId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete post');

      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      console.error('Error deleting post:', error);
      toast.error('Failed to delete post');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <Card className="text-center p-6">
        <CardHeader>
          <CardTitle>No posts yet</CardTitle>
          <CardDescription>
            Be the first to create a post in this space
          </CardDescription>
        </CardHeader>
        <CardContent>
          {canAccess(spaceId, 'edit') && (
            <Button onClick={() => router.push(`/spaces/${spaceId}/new`)}>
              Create Post
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <Card key={post.id} className="group">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <Link href={`/spaces/${spaceId}/posts/${post.id}`} className="hover:underline">
                  <CardTitle>{post.title}</CardTitle>
                </Link>
                <CardDescription>
                  <span className="flex items-center gap-2">
                    by {post.author.name} •{' '}
                    <Clock className="h-3 w-3" />{' '}
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                  </span>
                </CardDescription>
              </div>
              {canAccess(spaceId, 'edit') && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => router.push(`/spaces/${spaceId}/posts/${post.id}/edit`)}
                    >
                      <PencilIcon className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => handleDelete(post.id)}
                    >
                      <TrashIcon className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="line-clamp-3 text-muted-foreground">
              {post.content}
            </p>
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="text-sm text-muted-foreground">
                {post.commentsCount} comments
              </span>
            </div>
            {post.tags.length > 0 && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4" />
                <div className="flex gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-muted px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}