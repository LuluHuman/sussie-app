import "@/app/globals.css";
import Image from "next/image";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode; }>) {
    return (
        <>
            <div className={`flex flex-col min-h-screen w-screen`}>
                <nav className="px-4 pt-4 text-lg flex justify-between">
                    <a href="/"><img src="/logo_full.png" alt="" className='h-8' /></a>
                    <div className='flex gap-2'>
                        <a href="/info">{"\"About-SUSSIE\""}</a>
                    </div>
                </nav >
                <div className="sm:px-4 px-2 py-4 m-0 flex-1 flex">
                    <div className="p-2 bg-background-2 w-full rounded-2xl flex-1">
                        {children}
                    </div>
                </div>
            </div >
            <footer className='text-center pb-2 flex flex-col items-center'>
                <p>Made with <span className='line-through'>all the</span> 💜 <span className='line-through'>i'm legally allowed to give</span>. Coded by humans</p>
                <p>..well specifically only <a className="underline font-bold" target="_blank" href="https://luluhoy.tech">Lulu</a></p>
                <p></p>
                <div className="flex">
                    {[1, 2, 3, 4].map((i) => <Image key={i} src="/recycultist.webp" width={64} height={64} alt="recycultist" />)}
                </div>
                <p className="flex gap-2 items-center justify-center">
                    <a href="/legal/pp">Privacy Policy</a>
                    <a href="/legal/tos">Terms of Service</a>
                </p>
            </footer>
        </>
    )
}