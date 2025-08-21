import { LoginForm } from '@/components/forms/login-form'
import React from 'react'

type Props = {}

const SignInPage = (props: Props) => {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  )
}

export default SignInPage