"use client"
"use client"
//client squared LMAO im keeping this in for fun
import { useSession, signIn, signOut } from "next-auth/react"
import Image from "next/image"

export default function Login() {
    const session = useSession()

    return <div className="flex flex-col lg:flex-row w-full h-full justify-evenly items-center overflow-y-hidden gap-4">
        <div className=" p-2 max-w-127 w-full">
            <div className="w-full outline-primary outline-4 rounded-4xl text-center flex flex-col items-center gap-2 p-2">
                <h1 className="text-5xl">Start sustainability from an image</h1>
                <p>
                    Upload an image of an item and solve sustainable solutions with
                    SUSSIE (<b>SUS</b>tainability <b>S</b>earch and a<b>I E</b>ngine).
                    A project for <a href="https://citainovasi.com/gsic" target="_blank" className="underline">The 2nd Global Sustainability Innovation Competition (GSIC)</a>
                </p>{
                    session.status == 'unauthenticated'
                        ? <>
                            <span>By signing in, you acknowledge our <a href="/legal/pp" className="font-bold underline">Privacy Policy</a>.</span>
                            <button onClick={() => signIn()} className="bg-primary text-background p-2 rounded-2xl w-fit">Sign in to start</button>
                        </>
                        : session.status == "authenticated"
                            ? <>
                                <span>Hi {session.data.user?.name}, would you like to <button className="font-bold underline" onClick={() => signOut()}>Sign Out?</button>.</span>
                                <a href="/app" className="bg-primary text-background p-2 rounded-2xl"><button>Try SUSSIE --&gt;</button></a>
                            </>
                            : <>
                                <span>Hold on, my clogs are moving</span>
                                <button className="bg-primary text-background p-2 rounded-2xl">Try uhh...</button>
                            </>
                }
                <a href="/info" className="bg-primary text-background p-2 rounded-2xl mb-4"><button>About this project</button></a>
            </div>
        </div>
        <div className="max-w-125 flex *:flex *:flex-col *:items-center *:justify-end *:w-1/2 text-center">
            <div>
                <span className="w-fit">Broken Monitor?<br />SUSSIE detects it</span>
                <Image src="/ex1.png" width={500} height={946} alt="app example 1" />
            </div>
            <div>
                <span className="w-fit">Learn about the effects about disposing it incorrectly</span>
                <Image src="/ex2.png" width={500} height={946} alt="app example 2" />
            </div>
        </div>
    </div >
}