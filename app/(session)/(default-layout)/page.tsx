"use client"
import axios from "axios"
import { compiler } from "markdown-to-jsx"
import { redirect } from "next/navigation"
import React, { Dispatch, SetStateAction, useEffect, useState } from "react"
import { useSession } from "next-auth/react"

enum ResponseState {
    READY = 0,
    ASKING = 1,
    RESPONDED = 2,
    RESPONDED_ERROR = 12,
}

export default function Gsic() {
    const [imgSrc, setImgSrc] = useState<string>()
    const [qn, setQn] = useState<string>("")

    const [response, setResponse] = useState<{ state: ResponseState, text?: string }>({ state: ResponseState.READY })
    const [error, setError] = useState<string>()


    const session = useSession()

    const [auth, setAuth] = useState<boolean>(false)
    useEffect(() => {
        switch (session.status) {
            case "unauthenticated":
                redirect("/login")
            case "authenticated":
                setAuth(true)
                break
            default:
                break;
        }
    }, [session])

    const buttonStates: { [key: number]: React.JSX.Element | string } = {}
    buttonStates[ResponseState.READY] = "Ask"
    buttonStates[ResponseState.ASKING] = <Loader />
    buttonStates[ResponseState.RESPONDED] = "Retry now"
    buttonStates[ResponseState.RESPONDED_ERROR] = "Try Again"

    const showOutput = [ResponseState.RESPONDED, ResponseState.RESPONDED_ERROR].includes(response.state)

    return <div className="flex flex-col w-full h-full justify-center items-center gap-2">
        {!auth && <p>Checking access...</p>}
        <p>{(response.state == ResponseState.RESPONDED && qn) || "Add an image to ask about"}</p>
        <div className="bg-background px-2 p-4 rounded-4xl size-64">
            <input id="myImage" type="file" accept="image/*, image/jpeg"
                disabled={!auth || typeof response.text == "string"}
                className="absolute size-64 text-center opacity-0" onChange={(e) => {
                    if (!e.target.files || !e.target.files[0]) return
                    var reader = new FileReader();
                    reader.onload = (e) => setImgSrc((e.target?.result || "") as string)
                    reader.readAsDataURL(e.target.files[0]);
                }}
            />
            {imgSrc ? <img width={256} className="object-contain w-full h-full" src={imgSrc} alt="" /> : <Img />}
        </div>


        <div className="flex gap-2 w-full max-w-160">
            <input type="text" className={`bg-background px-2 p-4 rounded-4xl flex-1 ${showOutput ? "inputHide" : ""}`}
                placeholder="Use the suggested questions or ask your own"
                disabled={!auth}
                onChange={(e) => setQn(e.target.value)}
                value={qn}
            />
            <button
                className={`bg-primary text-background px-2 p-4 rounded-4xl h-14 line-clamp-1 ${!showOutput ? "w-14" : "buttonChangeLarge w-full"}`}
                onClick={async () => {
                    switch (response.state) {
                        case ResponseState.READY: {
                            if (!imgSrc && !qn) return setError("You asked for nothing your gonna get nothing")
                            if (!imgSrc) return setError("Upload an image")
                            if (!qn) return setError("Ask a question")
                            setResponse({ state: ResponseState.ASKING })
                            const response = await axios.post("/api/question", JSON.stringify({ qn, image: imgSrc }), { validateStatus: () => true })
                            if (response.data.text)
                                if (typeof response.data.text == "string") setResponse({ state: ResponseState.RESPONDED, text: response.data.text })
                                else setResponse({ state: ResponseState.RESPONDED, text: response.data.text.res })
                            else if (response.data.error) setResponse({ state: ResponseState.RESPONDED_ERROR, text: "An error has occured: <br/>" + response.data.error })
                            break
                        }

                        case ResponseState.RESPONDED:
                        case ResponseState.RESPONDED_ERROR: {
                            setImgSrc(undefined)
                            setQn("")
                            setError(undefined)
                            setResponse({ state: ResponseState.READY })
                            break
                        }
                    }
                }}>
                {buttonStates[response.state]}
            </button>
        </div>

        <span className="text-red-500">{error}</span>
        <SuggestionList
            hidden={response.state !== ResponseState.READY}
            suggestions={[
                { icon: "🗑️", text: "Where do i properly dispose this", },
                { icon: "♻️", text: "How do i recycle this this", },
                { icon: "🪛", text: "How can i fix this", },
                { icon: "❔", text: "What can i do with this", },
            ]}
            setQn={setQn} />

        <div className={`bg-[#755085] rounded-2xl p-2 transition max-w-160 duration-500 `
            + `${response.state == ResponseState.RESPONDED_ERROR ? "text-red-500 text-center" : ""}`
            + ` ${response.state !== ResponseState.READY ? "opacity-100" : "opacity-0"}`}>
            {typeof response?.text == "string" && compiler(response.text)}
            {response.state == ResponseState.ASKING && <div className="flex justify-center gap-2 *:h-4 *:size-4 *:my-1 *:bg-primary *:rounded-full *:pulse"><p /><p /><p /></div>}
        </div>
    </div >
}

function SuggestionList({ hidden, suggestions, setQn }: { hidden: boolean, suggestions: { icon: string, text: string }[], setQn: Dispatch<SetStateAction<string>> }) {
    return <div className={`flex gap-2 flex-wrap justify-center transition duration-500 ${hidden ? "opacity-0 hidden" : "opacity-100"}`}>
        {suggestions.map(sug => <Suggestion key={sug.text} icon={sug.icon} text={sug.text} setQn={setQn} />)}
    </div>
}

function Suggestion({ text, icon, setQn }: { text: string, icon: string, setQn: Dispatch<SetStateAction<string>> }) {
    return <button
        className="bg-background p-2 rounded-4xl"
        onClick={() => setQn(text)}
    >{icon + " " + text}</button>
}

function Loader() {
    return <svg fill="white" className="w-full h-full" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.72,19.9a8,8,0,0,1-6.5-9.79A7.77,7.77,0,0,1,10.4,4.16a8,8,0,0,1,9.49,6.52A1.54,1.54,0,0,0,21.38,12h.13a1.37,1.37,0,0,0,1.38-1.54,11,11,0,1,0-12.7,12.39A1.54,1.54,0,0,0,12,21.34h0A1.47,1.47,0,0,0,10.72,19.9Z"><animateTransform attributeName="transform" type="rotate" dur="3s" values="0 12 12;360 12 12" repeatCount="indefinite" /></path></svg>
}
function Img() {
    return <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" height="256px" viewBox="0 -960 960 960" width="256px" fill="#e3e3e3"><path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Zm0-80h560v-560H200v560Zm40-80h480L570-480 450-320l-90-120-120 160Zm-40 80v-560 560Z" /></svg>
}
