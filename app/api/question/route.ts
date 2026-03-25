import { GenerateContentResponse, GoogleGenAI, MediaResolution } from "@google/genai";

import { getServerSession } from "next-auth/next"
import { NextRequest } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { readFileSync } from "fs";

export async function POST(request: NextRequest) {
    const sesion = await getServerSession(authOptions)
    if (sesion === null) return new Response("No session token", { status: 401 })


    const { qn, image } = await request.json()
    if (!qn || !image) return new Response("No image or question. Get out of here no free api for you >:(", { status: 400 })

    const regex = /data:(.+);base64,(.+)/gm;
    const [_, mime, data] = regex.exec(image) || []

    if (!mime || !data) return new Response("The image is not imageing. Get out of here no free api for you >:(", { status: 400 })

    var response: GenerateContentResponse | undefined
    try {
        const responseJsonSchema = {
            "$schema": "http://json-schema.org/draft-07/schema#",
            "title": "DetectionResponse",
            "type": "object",
            "required": ["objs", "res"],
            "properties": {
                "objs": {
                    "type": "array",
                    "description": "Array of detected objects in the image",
                    "items": {
                        "type": "object",
                        "required": ["name", "coords"],
                        "properties": {
                            "name": {
                                "type": "string",
                                "description": "Label of the detected object (e.g. ssd, food wrapper, clothing)"
                            },
                            "coords": {
                                "type": "object",
                                "description": "Bounding box coordinates of the detected object",
                                "required": ["x1", "y1", "x2", "y2"],
                                "properties": {
                                    "x1": { "type": "number", "description": "Left edge x-coordinate" },
                                    "y1": { "type": "number", "description": "Top edge y-coordinate" },
                                    "x2": { "type": "number", "description": "Right edge x-coordinate" },
                                    "y2": { "type": "number", "description": "Bottom edge y-coordinate" }
                                },
                                "additionalProperties": false
                            }
                        },
                        "additionalProperties": false
                    }
                },
                "materials": {
                    "type": "array",
                    "description": "Array of precious materials in objects in the image",
                    "items": { "type": "string", }
                },
                "res": {
                    "type": "string",
                    "description": "The response to the user's question"
                }
            },
            "additionalProperties": false
        }

        const systemInstruction =
            `You are an SUSSIE, a web app used to help with sustainability.\n` +
            `The user of the app will input an image and ask a question about sustainability of the image.\n` +
            `Return the name of the object in the image an add bounding box coordinates in percentages, reletive to the size of the image. if the size given is 300,300 and the object is at 100,100 to 200,200, respond with x1: 0.333 y1:0.333 x2:0.666 y2:0.666\n` +
            `Also return precious materials of those items.\n` +
            `write a paragraph answering the question. Never return masks. Limit to 25 objects.\n`

        const ai = new GoogleGenAI({});
        const contents = [
            { inlineData: { mimeType: mime, data } },
            { text: qn },
        ];
        response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: contents,
            config: {
                systemInstruction,
                mediaResolution: MediaResolution.MEDIA_RESOLUTION_MEDIUM,
                responseMimeType: "application/json",
                responseJsonSchema
            },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: (err as Error).message }), { status: 500 })
    }

    return response ? new Response(response.text) : new Response(JSON.stringify({ error: "No response was recieved" }), { status: 500 })
    // const f = readFileSync("/home/lulu/Documents/sussie-app/app/api/question/example2.json", "utf-8")
    // await setTimeout(3000)
    // return new Response(f)
}