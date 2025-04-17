"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PostCard } from "@/components/post-card"
import { UserCard } from "@/components/user-card"
import { Loader2, SearchIcon } from "lucide-react"
import type { Post, Profile } from "@/lib/types"

export default function SearchPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const tab = searchParams.get("tab") || "posts"

  const [searchQuery, setSearchQuery] = useState(query)
  const [isLoading, setIsLoading] = useState(false)
  const [posts, setPosts] = useState<Post[]>([])
  const [users, setUsers] = useState<Profile[]>([])

  const supabase =  createClient()

  useEffect(() => {
    if (query) {
      performSearch(query, tab)
    }
  }, [query, tab])

  async function performSearch(searchTerm: string, activeTab: string) {
    if (!searchTerm.trim()) return

    setIsLoading(true)

    try {
      if (activeTab === "posts" || activeTab === "all") {
        const { data: postsData, error: postsError } = await supabase
          .from("posts")
          .select(
            "*, profiles!posts_author_id_fkey(username, avatar_url), categories!posts_category_id_fkey(name, slug)",
          )
          .or(`title.ilike.%${searchTerm}%,content.ilike.%${searchTerm}%`)
          .eq("is_published", true)
          .order("created_at", { ascending: false })
          .limit(20)

        if (!postsError) {
          setPosts(postsData as unknown as Post[])
        }
      }

      if (activeTab === "users" || activeTab === "all") {
        const { data: usersData, error: usersError } = await supabase
          .from("profiles")
          .select("*")
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .limit(20)

        if (!usersError) {
          setUsers(usersData as Profile[])
        }
      }
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    if (!searchQuery.trim()) return

    const params = new URLSearchParams()
    params.set("q", searchQuery)
    params.set("tab", tab)
    router.push(`/search?${params.toString()}`)
  }

  function handleTabChange(value: string) {
    const params = new URLSearchParams(searchParams)
    params.set("tab", value)
    router.push(`/search?${params.toString()}`)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Search</h1>

      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <Input
          type="search"
          placeholder="Search for posts, users, or topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit">
          <SearchIcon className="h-4 w-4 mr-2" />
          Search
        </Button>
      </form>

      {query && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Results for "{query}"</h2>
          <Tabs defaultValue={tab} onValueChange={handleTabChange}>
            <TabsList>
              <TabsTrigger value="posts">Posts</TabsTrigger>
              <TabsTrigger value="users">Users</TabsTrigger>
            </TabsList>
            <TabsContent value="posts" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : posts.length > 0 ? (
                <div className="space-y-4">
                  {posts.map((post) => (
                    <PostCard key={post.id} post={post} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No posts found matching your search.</div>
              )}
            </TabsContent>
            <TabsContent value="users" className="mt-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : users.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">No users found matching your search.</div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  )
}
