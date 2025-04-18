'use client'
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSpace } from '@/hooks/use-space';
import { useRealtimeSync } from '@/hooks/use-real-time-sync';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

const postFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100),
  content: z.string().min(1, 'Content is required'),
  tags: z.string().optional(),
});

type PostFormValues = z.infer<typeof postFormSchema>;

interface SpacePostFormProps {
  spaceId: string;
  onSuccess?: () => void;
}

export function SpacePostForm({ spaceId, onSuccess }: SpacePostFormProps) {
  const router = useRouter();
  const { canAccess } = useSpace({ spaceId });
  const { broadcastActivity } = useRealtimeSync({ spaceId });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: '',
      content: '',
      tags: '',
    },
  });

  const onSubmit = async (data: PostFormValues) => {
    if (!canAccess(spaceId, 'edit')) {
      toast.error('You do not have permission to create posts');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the post through your API
      const response = await fetch(`/api/spaces/${spaceId}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create post');
      }

      const post = await response.json();

      // Broadcast the activity
      await broadcastActivity({
        type: 'post_created',
        data: {
          postId: post.id,
          title: post.title,
        },
      });

      toast.success('Post created successfully');
      router.push(`/spaces/${spaceId}/posts/${post.id}`);
      onSuccess?.();
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter post title"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Give your post a clear and descriptive title
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Content</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Write your post content..."
                  className="min-h-[200px]"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Write the main content of your post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter tags (comma separated)"
                  {...field}
                  disabled={isSubmitting}
                />
              </FormControl>
              <FormDescription>
                Optional: Add tags to help categorize your post
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Post'}
          </Button>
        </div>
      </form>
    </Form>
  );
}