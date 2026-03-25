import "@/app/globals.css";

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
            <footer className='text-center pb-2'>
                Made with <span className='line-through'>all the</span> 💜 <span className='line-through'>i'm legally allowed to give</span> by humans
            </footer>
        </>
    )
}