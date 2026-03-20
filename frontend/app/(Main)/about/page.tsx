import React from "react";
import Image from "next/image";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-slate-200 pt-[80px]">
            <main className="max-w-[1000px] mx-auto px-6 md:px-12 py-16 md:py-24">
                {/* Header Section */}
                <div className="mb-20">
                    <p className="text-[#8e8e8e] font-medium text-lg md:text-xl mb-4">
                        About MedCoreAI
                    </p>
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] text-black">
                        A story of tools and the future of healthcare
                    </h1>
                </div>

                <div className="flex flex-col gap-24 md:gap-32">
                    {/* First Block */}
                    <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start">
                            <div className="relative w-full max-w-[400px] aspect-video">
                                <Image
                                    src="/about-2.png"
                                    alt="Medical team"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        {/* Copy */}
                        <div className="w-full md:w-1/2">
                            <p className="text-[17px] md:text-[19px] leading-relaxed text-[#37352f]">
                                Hi there! If you&apos;re reading this, you&apos;re probably
                                like us—spending most of your days trying to make sense of
                                complex symptoms, medical reports, and health advice.
                            </p>
                        </div>
                    </section>

                    {/* Second Block */}
                    <section className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
                        {/* Illustration */}
                        <div className="w-full md:w-1/2 flex justify-center md:justify-start order-1 md:order-1">
                            <div className="relative w-full max-w-[400px] aspect-square">
                                <Image
                                    src="/about-1.png"
                                    alt="Doctor at desk"
                                    fill
                                    className="object-contain"
                                />
                            </div>
                        </div>
                        {/* Copy */}
                        <div className="w-full md:w-1/2 order-2 md:order-2">
                            <div className="space-y-6">
                                <p className="text-[17px] md:text-[19px] leading-relaxed text-[#37352f]">
                                    You probably have fifteen tabs open: one for WebMD,
                                    one for your doctor&apos;s portal, one for Google search, and on, and on...
                                </p>
                                <p className="text-[17px] md:text-[19px] leading-relaxed text-[#37352f]">
                                    But have you ever thought about where these &quot;health tools&quot; came from?
                                    Or why it&apos;s so confusing to get a straight answer?
                                </p>
                                <p className="text-[17px] md:text-[19px] leading-relaxed text-[#37352f]">
                                    To answer these questions, and to explain why
                                    we created MedCoreAI, we have to rethink diagnostics.
                                </p>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
