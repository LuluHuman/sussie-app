"use client"
"use client"
//client squared LMAO im keeping this in for fun
import { useSession, signIn, signOut } from "next-auth/react"

export default function Login() {
    const session = useSession()


    return <div className="flex flex-col w-full h-full justify-center items-center gap-2">
        <div className="flex gap-2 flex-col items-center">
            {
                session.status == "authenticated"
                    ? <>
                        <h1>Wassup {session.data.user?.name}</h1>
                        <p>You're not trying to log out or leave me are you?</p>
                        <button onClick={() => signOut()} className="bg-primary text-background p-2 rounded-4xl">Sign out</button>
                    </>
                    : <>
                        <h1>You're not logged it</h1>
                        <p>Welcome the the AMAZING digital SUSSIE</p>
                        <button onClick={() => signIn()} className="bg-primary text-background p-2 rounded-4xl">Sign in</button>
                    </>
            }
        </div>
    </div>
}
