
export default function Info() {
    return <div>
        <h1>What is SUSSIE?</h1>
        <p>
            SUSSIE (<b>SUS</b>tainability <b>S</b>earch and a<b>I E</b>ngine) is A project for the 2nd Global Sustainability Innovation Competition(GSIC) to help consumers idenitify ways to sustainably use the item.This project solves the problem of consumers not knowing how to dispose of recycle named / unnamed items but want to make an impact. This product is ment to reduce waste by properly recycling and encourage reusing products by giving tips.
        </p>

        <h1>How does it help with sustainability?</h1>
        <p>
            Many items like broken SSDs contain precius material. This app will reduce trash to the landfills and reuse limited recourced which will lower carbon footprint from manufacturing and burning.
        </p>

        <h1>How to use</h1>
        <p>
            Input an image as well as a question to the image SUSSIE will respond with ways to enourage sustainability.
        </p>

        <h1>What makes it different from other products?</h1>
        <p>
            It uses an AI that tells you what you should do. Rather then doing your own research
        </p>


        <h1>Technical Info</h1>
        <ol>
            <li>Powered by Google's Gemini Flash 3 Preview for idea generation and image recognition.</li>
            <li>Nextjs is used for the front and and backend of the website deployed on Vercel</li>
        </ol>
        <p className="opacity-50 my-4">
            {"View the source code "}<a
                className="underline font-bold"
                target="_blank"
                href="https://github.com/LuluHuman/website-next/tree/master/app">
                here (Github LuluHuman/website-next/app)
            </a>
        </p>
    </div>
}