import { Metadata } from 'next';
import { Sour_Gummy } from 'next/font/google'
import "@/app/globals.css";


export const metadata: Metadata = {
    title: "SUSSIE - A GSIC project",
    description: "SUSSIE, A project for the 2nd Global Sustainability Innovation Competition (GSIC) to help consumers idenitify ways to sustainably use the item. This project solves the problem of consumers not knowing how to dispose of recycle named/unnamed items but want to make an impact. This product is ment to reduce waste by properly recycling and encourage reusing products by giving tips. This will reduce trash to the landfills and reuse limited recourced which will lower carbon footprint from manufacturing and burning. Input an image as well as a question to the image SUSSIE will respond with ways to enourage sustainability. Powered by Google's Gemini Flash 3 Preview fro idea generation and image recognition",
};

const sourGummy = Sour_Gummy({ subsets: ['latin'] })

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
            </head>
            <body className={sourGummy.className}>
                {children}
            </body>
        </html >
    )
}