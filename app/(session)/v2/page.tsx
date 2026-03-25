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

interface schemaResponse {
    "objs": {
        "name": string,
        "coords": {
            "x1": number,
            "y1": number,
            "x2": number,
            "y2": number
        }
    }[],
    "materials": string[],
    "res": string
}

export default function Gsic() {
    const [imgSrc, setImgSrc] = useState<string>()
    const [showDrawer, setDrawerVisable] = useState<boolean>(false)
    const [qn, setQn] = useState<string>("")

    const [response, setResponse] = useState<{ state: ResponseState, response?: schemaResponse | string }>({ state: ResponseState.READY })
    const [error, setError] = useState<string>()
    const canvasRef = React.useRef<HTMLCanvasElement>(null)
    const [auth, setAuth] = useState<boolean>(false)
    useEffect(() => console.log(response), [response])


    const session = useSession()
    useEffect(() => {
        switch (session.status) {
            case "unauthenticated": redirect("/login");
            case "authenticated": { setAuth(true); break };
            default: break;
        }
    }, [session])

    useEffect(() => {
        if (!imgSrc || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return

        const img = new Image()
        img.onload = () => {
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
        }
        img.src = imgSrc
    }, [imgSrc])
    useEffect(() => {
        if (!response.response || typeof response.response == "string" || !response.response.objs || !canvasRef.current) return
        const canvas = canvasRef.current
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        response.response.objs
            .map((obj) => {
                const [x1, y1, x2, y2] = [
                    obj.coords.x1 * canvas.width,
                    obj.coords.y1 * canvas.height,
                    (obj.coords.x2 * canvas.width) - (obj.coords.x1 * canvas.width),
                    (obj.coords.y2 * canvas.height) - (obj.coords.y1 * canvas.height)
                ].map(Math.floor)


                // Draw bounding box
                ctx.beginPath();
                ctx.lineWidth = 3  // Thinner line
                ctx.strokeStyle = "red";
                ctx.rect(x1, y1, x2, y2);
                ctx.stroke();
                ctx.closePath()

                // Draw text with background for readability
                ctx.font = "70px Arial";  // Smaller font
                ctx.fillStyle = "red";
                ctx.fillRect(x1, y1 - 70, ctx.measureText(obj.name).width + 8, 70);

                ctx.fillStyle = "white";
                ctx.fillText(obj.name, x1 + 4, y1 - 8);
            })


    }, [response])

    const buttonStates: { [key: number]: React.JSX.Element | string } = {}
    buttonStates[ResponseState.READY] = "Ask"
    buttonStates[ResponseState.ASKING] = <Loader />
    buttonStates[ResponseState.RESPONDED] = "Retry now"
    buttonStates[ResponseState.RESPONDED_ERROR] = "Try Again"

    const showOutput = [ResponseState.RESPONDED, ResponseState.RESPONDED_ERROR].includes(response.state)
    const getCompressedImage = (quality: number = 0.7) => {
        if (!canvasRef.current) return null
        return canvasRef.current.toDataURL("image/jpeg", quality)
    }
    return (
        <div className="flex flex-col w-svw h-svh items-center gap-2" >
            <header className="absolute"><img src="/logo_full.png" alt="" className='h-12 p-2' /></header>

            {/* Chosen One/Image */}
            {/* {imgSrc && <img width={256} className="object-contain w-full h-full" src={imgSrc} alt="" />} */}
            {imgSrc && <canvas ref={canvasRef} className="object-contain w-full h-full" />}

            {/* Upload Button */}
            <div className="bg-white size-16 rounded-full flex justify-center items-center absolute bottom-6 aspect-square"
                onClick={() => {
                    if (response.state != ResponseState.RESPONDED && response.state != ResponseState.RESPONDED_ERROR) return
                    setDrawerVisable(true)

                }}>
                {response.state == ResponseState.RESPONDED || response.state == ResponseState.RESPONDED_ERROR
                    ? <button></button>
                    : <input id="myImage" type="file" accept="image/*, image/jpeg"
                        disabled={!auth}
                        className="absolute size-16 text-center opacity-0" onChange={(e) => {
                            if (!e.target.files || !e.target.files[0]) return
                            var reader = new FileReader();
                            reader.onload = (e) => {
                                setImgSrc((e.target?.result || "") as string);
                                setDrawerVisable(true)
                            }
                            reader.readAsDataURL(e.target.files[0]);
                        }}
                    />
                }
                <AddAPhoto />
            </div>

            {/* Drawer */}
            <div className={`fixed h-3/4 w-full max-w-160 rounded-t-3xl bg-background-2 p-4 opacity-0 transition-all duration-200 overflow-y-scroll ${!showDrawer ? "-bottom-3/4 opacity-0" : "bottom-0 opacity-100"}`} >
                <button className="w-full text-left text-2xl" onClick={() => setDrawerVisable(false)}>X</button>

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

                                    const imageUrl = getCompressedImage(0.5)
                                    const response = await axios.post("/api/question", JSON.stringify({ qn, image: imageUrl }), { validateStatus: () => true })
                                    if (response.data.res) setResponse({ state: ResponseState.RESPONDED, response: response.data as schemaResponse })
                                    else if (response.data.error) setResponse({ state: ResponseState.RESPONDED_ERROR, response: "An error has occured: <br/>" + response.data.error })
                                    break
                                }

                                case ResponseState.RESPONDED:
                                case ResponseState.RESPONDED_ERROR: {
                                    setDrawerVisable(false)
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
                        { icon: "🗑️", text: "How do i properly dispose this", },
                        { icon: "♻️", text: "How do i recycle this this", },
                        { icon: "🪛", text: "How can i fix this", },
                        { icon: "❔", text: "What can i do with this", },
                    ]}
                    setQn={setQn} />
                {
                    response?.response && typeof response?.response !== 'string' &&
                    <div className="mt-4">
                        <span>Precious materials</span>
                        <ul className={`flex gap-2 overflow-x-scroll text-nowrap p-2`}>
                            {response.response.materials.map((mat, i) => <li key={i} className="bg-primary text-background rounded-4xl p-2 ">{mat}</li>)}
                        </ul>
                    </div>
                }

                <div className="mt-4">
                    <span>Suggestion</span>
                    <div className={`bg-[#755085] rounded-2xl p-2 transition max-w-160 duration-500`
                        + `${response.state == ResponseState.RESPONDED_ERROR ? "text-red-500 text-center" : ""}`
                        + ` ${response.state !== ResponseState.READY ? "opacity-100" : "opacity-0"}`}>

                        {
                            typeof response?.response == "string"
                                ? response.response
                                : compiler(response.response?.res)
                        }
                        {response.state == ResponseState.ASKING && <div className="flex justify-center gap-2 *:h-4 *:size-4 *:my-1 *:bg-primary *:rounded-full *:pulse"><p /><p /><p /></div>}
                    </div>
                </div>
            </div>
        </div >
    )
}

function SuggestionList({ hidden, suggestions, setQn }: { hidden: boolean, suggestions: { icon: string, text: string }[], setQn: Dispatch<SetStateAction<string>> }) {
    return <div className={`flex gap-2 overflow-x-scroll text-nowrap transition duration-500 ${hidden ? "opacity-0 hidden" : "opacity-100"} p-2`}>
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

function AddAPhoto() {
    return <svg xmlns="http://www.w3.org/2000/svg" height="32px" viewBox="0 -960 960 960" width="32px" fill="#000000"><path d="M440-438ZM106.67-120q-27 0-46.84-19.83Q40-159.67 40-186.67v-502q0-26.33 19.83-46.5 19.84-20.16 46.84-20.16h140L320-840h262.67v66.67H350.33l-73 84.66H106.67v502h666.66v-396H840v396q0 27-20.17 46.84Q799.67-120 773.33-120H106.67Zm666.66-569.33v-84h-84V-840h84v-84.67H840V-840h84.67v66.67H840v84h-66.67ZM439.67-264.67q73.33 0 123.5-50.16 50.16-50.17 50.16-123.5 0-73.34-50.16-123.17-50.17-49.83-123.5-49.83-73.34 0-123.17 49.83t-49.83 123.17q0 73.33 49.83 123.5 49.83 50.16 123.17 50.16Zm0-66.66q-45.67 0-76-30.67-30.34-30.67-30.34-76.33 0-45.67 30.34-76 30.33-30.34 76-30.34 45.66 0 76.33 30.34 30.67 30.33 30.67 76 0 45.66-30.67 76.33t-76.33 30.67Z" /></svg>
}