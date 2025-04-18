"use client"

import { useActionState } from "react"
import { useFormStatus } from "react-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { signIn } from "@/lib/auth-actions"
import { useTranslation } from "react-i18next"

function SubmitButton() {
  const { pending } = useFormStatus()
  const { t } = useTranslation()

  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-[#2b725e] hover:bg-[#235e4c] text-white py-6 text-lg font-medium rounded-lg h-[60px]"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          {t("auth.signingIn")}
        </>
      ) : (
        t("auth.signIn")
      )}
    </Button>
  )
}

export default function LoginForm() {
  const router = useRouter()
  const [state, formAction] = useActionState(signIn, null)
  const { t } = useTranslation()

  // Handle successful login by redirecting
  useEffect(() => {
    if (state?.success) {
      router.push("/")
    }
  }, [state, router])

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-semibold tracking-tight text-white">{t("auth.welcomeBack")}</h1>
        <p className="text-lg text-gray-400">{t("auth.signInToAccount")}</p>
      </div>

      <form action={formAction} className="space-y-6">
        {state?.error && (
          <div className="bg-red-500/10 border border-red-500/50 text-red-700 px-4 py-3 rounded">{state.error}</div>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              {t("auth.email")}
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              className="bg-[#1c1c1c] border-gray-800 text-white placeholder:text-gray-500"
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
              {t("auth.password")}
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              required
              className="bg-[#1c1c1c] border-gray-800 text-white"
            />
          </div>
        </div>

        <SubmitButton />

        <div className="text-center text-gray-400">
          {t("auth.dontHaveAccount")}{" "}
          <Link href="/auth/sign-up" className="text-white hover:underline">
            {t("auth.signUp")}
          </Link>
        </div>
      </form>
    </div>
  )
}
