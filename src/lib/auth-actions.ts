"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

/**
 * Plain union: either an error payload, or success + optional data
 */
export type ActionResult<T=any> =
    | { error: string }
    | ({ success: true } & T)

export async function signIn(
    formData: FormData
): Promise<ActionResult> {
    if (!(formData instanceof FormData)) {
        return { error: "Invalid form data" }
    }

    const email = formData.get("email")?.toString().trim()
    const password = formData.get("password")?.toString()

    if (!email || !password) {
        return { error: "Email and password are required" }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
        return { error: error.message }
    }
    return { success: true }
}

export async function signUp(
    formData: FormData
): Promise<ActionResult<{ message: string }>> {
    if (!(formData instanceof FormData)) {
        return { error: "Invalid form data" }
    }

    const email    = formData.get("email")?.toString().trim()
    const password = formData.get("password")?.toString()
    const username = formData.get("username")?.toString().trim()

    if (!email || !password || !username) {
        return { error: "Email, username, and password are required" }
    }

    const supabase = await createClient()
    const { data: existingUser, error: fetchError } = await supabase
        .from("profiles")
        .select("username")
        .eq("username", username)
        .single()

    if (fetchError && fetchError.code !== "PGRST116") {
        return { error: fetchError.message }
    }
    if (existingUser) {
        return { error: "Username is already taken" }
    }

    const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username } },
    })

    if (signUpError) {
        return { error: signUpError.message }
    }

    return {
        success: true,
        message: "AUTH.SUCCESS.EMAIL_CONFIRMATION_SENT",
    }
}

export async function signOut(): Promise<never> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect("/auth/login")
}
