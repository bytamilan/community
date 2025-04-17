import { notFound } from "next/navigation"
import { getProfileByUsername, getPostsByUser } from "@/lib/data"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { formatDistanceToNow } from "date-fns"

export default async function UserProfilePage({ params }: { params: { username: string } }) {
  const profile = await getProfileByUsername(params.username)

  if (!profile) {
    notFound()
  }

  const posts = await getPostsByUser(profile.id)

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-6 items-center md:items-start">
            <Avatar className="h-24 w-24">
              <AvatarImage src={profile.avatar_url || undefined} alt={profile.username} />
              <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-2xl font-bold">{profile.username}</h1>
              {profile.full_name && <p className="text-lg text-muted-foreground">{profile.full_name}</p>}
              <div className="flex flex-wrap gap-4 mt-2 justify-center md:justify-start">
                <div className="text-sm text-muted-foreground">
                  Joined {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                </div>
                <div className="text-sm text-muted-foreground">{profile.credits} credits</div>
              </div>
              {profile.bio && <p className="mt-4">{profile.bio}</p>}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="posts">
        <TabsList>
          <TabsTrigger value="posts">Posts</TabsTrigger>
          <TabsTrigger value="about">About</TabsTrigger>
        </TabsList>
        <TabsContent value="posts" className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Posts by {profile.username}</h2>
          {posts.length > 0 ? (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard key={post.id} post={{ ...post, author: profile }} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">This user hasn't created any posts yet.</p>
            </div>
          )}
        </TabsContent>
        <TabsContent value="about" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>About {profile.username}</CardTitle>
              <CardDescription>User information and statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-medium">Bio</h3>
                <p>{profile.bio || "No bio provided."}</p>
              </div>
              <div>
                <h3 className="font-medium">Member Since</h3>
                <p>{new Date(profile.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="font-medium">Posts</h3>
                <p>{posts.length}</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
