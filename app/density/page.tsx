"use client"
import React, { useState, useEffect, useRef } from "react"
import { motion, useScroll, useVelocity, useTransform, useSpring, AnimatePresence } from "framer-motion"
import { Sidebar } from "@/components/sidebar"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { DensityBalanceDisplay } from "@/components/density-balance-display"
import Image from "next/image"
import { Zap, Gift, MessageCircle, Dice1, AlertTriangle, TrendingUp, Flame, Users, Terminal, Sparkles, Send } from "lucide-react"
import { fetchRandomGoliathNFTs } from "@/app/actions/fetch-nfts"

const Particle = ({ velocityY }: { velocityY: any }) => {
    // Generate random values for CSS variables
    // Use stable values if possible or just render logic
    // Since this is a client component, random on render is "okay" but better to be stable. 
    // However, for dust, lightweight re-renders are fine.
    // To avoid hydration mismatch if this were SSR, we'd need useEffect, but let's assume client-side only for now or use suppressHydrationWarning.
    // Actually, to be safe and performant, we can just calculate these once or inline.

    // We'll trust React's hydration or the fact it's a small visual effect.
    // For pure randomness without hydration issues, usually we use useEffect to set them,
    // but that adds JS overhead back. 
    // Let's rely on the fact this is likely inside a client component with "use client".

    const style = {
        '--tx': `${Math.random() * 800 - 400}px`,
        '--ty': `${Math.random() < 0.5 ? -(Math.random() * 400 + 100) : (Math.random() * 400 + 100)}px`,
        '--s': `${0.5 + Math.random() * 1.5}`,
        '--d': `${7 + Math.random() * 10}s`,
        '--del': `${Math.random() * 12}s`,
        top: '43%',
        left: '71%',
        boxShadow: '0 0 12px 3px rgba(168, 85, 247, 0.7)',
    } as React.CSSProperties;

    return (
        <div
            className="absolute w-1 h-1 bg-purple-400 rounded-full blur-[0.5px] opacity-0 animate-[particle-float_var(--d)_linear_infinite_var(--del)]"
            style={style}
        />
    )
}

const DensityOrb = () => {
    return (
        <div className="absolute inset-0 pointer-events-none h-full w-full">
            {/* Background Glow */}
            <div
                className="absolute w-64 h-64 bg-purple-600/20 rounded-full blur-[80px]"
                style={{
                    top: '43%',
                    left: '71%',
                    transform: 'translate(-50%, -50%)',
                }}
            />
            {/* The Entropy Orb - Video Version (No Circle) */}
            <motion.div
                className="absolute w-32 h-32 z-0 pointer-events-none"
                style={{
                    top: '43%',
                    left: '71%',
                    x: '-50%',
                    y: '-50%',
                }}
                animate={{
                    scale: [1, 1.05, 1],
                    opacity: [0.9, 1, 0.9],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-contain mix-blend-screen"
                >
                    <source src="/videos/density/density_hero.webm" type="video/webm" />
                </video>
            </motion.div>
        </div>
    )
}

const DustOverlay = () => {
    return (
        <div className="absolute inset-0 pointer-events-none h-full w-full z-20">
            {/* Particles - Higher Quantity - In Front of Image */}
            {[...Array(120)].map((_, i) => (
                <Particle key={i} velocityY={0} />
            ))}
        </div>
    )
}

const DiscordSimulator = () => {
    const [inputText, setInputText] = useState("");
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const [avatars, setAvatars] = useState<string[]>([]);
    const [mounted, setMounted] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<any[]>([
        { type: 'user', name: "Lak3", message: "Anyone seen the dealer lately?", color: "#f23f42" },
        { type: 'user', name: "Cipher", message: "Probably lurking in the shadows", color: "#34d399" },
        { type: 'user', name: "Vortex", message: "I need some fresh $DENSITY for the rift", color: "#ffffff" },
        { type: 'user', name: "Ghost", message: "Waiting for the next drop...", color: "#ffffff" },
        { type: 'user', name: "Titan", message: "Patience... he always returns", color: "#ffffff" }
    ]);

    useEffect(() => {
        setMounted(true);
        const loadAvatars = async () => {
            const result = await fetchRandomGoliathNFTs();
            if (result.success && result.images) {
                setAvatars(result.images);
            }
        };
        loadAvatars();
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        if (inputText.toLowerCase().startsWith("/dealdust")) {
            setIsPopupOpen(true);
        } else {
            setIsPopupOpen(false);
        }
    }, [inputText]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if ((e.key === 'Tab' || e.key === 'ArrowRight') && inputText.toLowerCase().startsWith("/") && "/dealdust".startsWith(inputText.toLowerCase())) {
            e.preventDefault();
            setInputText("/dealdust ");
        }
        if (e.key === 'Enter') {
            const trimmed = inputText.trim();
            if (trimmed.toLowerCase().startsWith("/dealdust")) {
                const parts = trimmed.split(" ");
                const amount = parts.length > 1 ? parseInt(parts[1]) : 0;
                if (amount > 0) {
                    addBotMessage(amount);
                    setInputText("");
                } else if (parts.length === 1) {
                    setIsPopupOpen(true);
                }
            } else if (trimmed !== "") {
                setMessages(prev => [...prev, { type: 'user', name: "You", message: trimmed, color: "#8b5cf6" }]);
                setInputText("");
            }
        }
    };

    const addBotMessage = (amt: number) => {
        setMessages(prev => [...prev, {
            type: 'bot',
            amount: amt,
            timestamp: new Date().toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit', hour: 'numeric', minute: '2-digit', hour12: true })
        }]);
    };

    const handleSelectAmount = (amt: number) => {
        addBotMessage(amt);
        setInputText("");
        setIsPopupOpen(false);
    };

    const users = [
        { name: "Lak3", message: "Anyone seen the dealer lately?" },
        { name: "Cipher", message: "Probably lurking in the shadows" },
        { name: "Vortex", message: "I need some fresh $DENSITY for the rift" },
        { name: "Ghost", message: "Waiting for the next drop..." },
        { name: "Titan", message: "Patience... he always returns" }
    ];

    if (!mounted) return null;

    return (
        <div className="bg-[#313338] rounded-xl overflow-hidden border border-white/5 shadow-2xl font-sans text-[#dbdee1] h-[550px] flex flex-col relative">
            {/* Header */}
            <div className="bg-[#313338] border-b border-[#1e1f22] p-4 flex items-center space-x-3 shadow-md z-10 shrink-0">
                <div className="text-[#80848e] font-bold text-xl">⛺</div>
                <div className="font-bold text-white tracking-tight">base-camp</div>
            </div>

            {/* Chat Messages */}
            <div
                ref={chatRef}
                className="flex-grow overflow-y-auto p-4 space-y-6 scrollbar-thin scrollbar-thumb-black/20 pb-20"
            >
                {messages.map((msg, i) => (
                    msg.type === 'user' ? (
                        <div key={i} className="flex space-x-4 hover:bg-[#2e3035] -mx-4 px-4 py-1 group transition-colors">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 bg-[#1e1f22]">
                                <Image
                                    src={avatars[i % avatars.length] || "/images/nft-placeholder.jpg"}
                                    alt={msg.name} width={40} height={40} className="object-cover"
                                />
                            </div>
                            <div>
                                <div className="flex items-center space-x-2">
                                    <span style={{ color: msg.color }} className="font-medium hover:underline cursor-pointer">{msg.name}</span>
                                    <span className="text-[10px] text-[#949ba4]">Today at 1:45 PM</span>
                                </div>
                                <div className="text-[#dbdee1] text-sm leading-relaxed">{msg.message}</div>
                            </div>
                        </div>
                    ) : (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex space-x-4 bg-purple-500/5 -mx-4 px-4 py-3 border-l-4 border-[#8b5cf6]"
                        >
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 mt-1 bg-[#1e1f22]">
                                <Image
                                    src="/images/density/dustdealerpfp.webp"
                                    alt="Dust dealer" width={40} height={40} className="object-cover"
                                />
                            </div>
                            <div className="flex-grow">
                                <div className="flex items-center space-x-2">
                                    <span className="font-bold text-white">Dust dealer</span>
                                    <span className="bg-[#5865f2] text-white text-[10px] px-1 rounded-[3px] font-bold uppercase py-0.5 leading-tight">App</span>
                                    <span className="text-[10px] text-[#949ba4]">{msg.timestamp}</span>
                                </div>
                                <div className="mt-1">
                                    <p className="text-sm text-[#dbdee1]">The Dust Dealer moves in silence, slipping {msg.amount} $DENSITY ({Math.floor(msg.amount / 5)} each) into the hands of the chosen few:</p>
                                    <div className="flex flex-wrap items-center mt-2">
                                        {["Lak3", "Cipher", "Vortex", "Ghost", "Titan"].map((name, idx, arr) => (
                                            <div key={idx} className="flex items-center">
                                                <span className="bg-[#3e4147] text-[#949cf7] px-1 rounded-[3px] hover:bg-[#5865f2] hover:text-white cursor-pointer transition-colors text-sm font-medium">@{name}</span>
                                                {idx < arr.length - 1 && <span className="text-[#949ba4] mr-1.5 text-sm">,</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                ))}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-[#313338] relative shrink-0">
                {/* Pop-up options */}
                <AnimatePresence>
                    {isPopupOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute bottom-[calc(100%+8px)] left-4 right-4 bg-[#2b2d31] rounded-lg border border-[#1e1f22] shadow-2xl overflow-hidden z-20"
                        >
                            <div className="p-4 border-b border-[#1e1f22]">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-bold text-white text-sm">amount</span>
                                    <span className="text-sm text-[#dbdee1]">Amount of Density to distribute to 5 lucky winners</span>
                                </div>
                                <div className="bg-[#1e1f22] rounded flex items-center p-2 space-x-3">
                                    <div className="w-6 h-6 rounded-full overflow-hidden bg-purple-500 flex items-center justify-center">
                                        <Image src="/images/density/dustdealerpfp.webp" alt="Dealer" width={24} height={24} />
                                    </div>
                                    <div className="flex items-center space-x-1 font-mono text-sm">
                                        <span className="text-[#dbdee1]">/dealdust</span>
                                        <div className="bg-[#3e4147] px-2 py-0.5 rounded text-white">amount</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-[#2b2d31] p-2">
                                <div className="text-[11px] font-bold text-[#b5bac1] px-2 py-2 uppercase tracking-tight">Options</div>
                                <div className="space-y-0.5">
                                    {[
                                        { amt: 5, each: 5 },
                                        { amt: 10, each: 2 },
                                        { amt: 25, each: 5 },
                                        { amt: 100, each: 20 },
                                        { amt: 250, each: 50 }
                                    ].map((opt) => (
                                        <button
                                            key={opt.amt}
                                            onClick={() => handleSelectAmount(opt.amt)}
                                            className="w-full text-left px-2 py-1.5 rounded hover:bg-[#35373c] transition-colors flex justify-between items-center group"
                                        >
                                            <span className="text-sm text-[#dbdee1] group-hover:text-white font-medium">{opt.amt} $DENSITY ({opt.each} to each)</span>
                                            <Zap className="w-3.5 h-3.5 text-purple-400 opacity-60 group-hover:opacity-100 transition-opacity" />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="bg-[#383a40] rounded-lg p-3 flex items-center space-x-3 shadow-inner relative">
                    <div className="bg-[#4e5058] rounded-full p-1 text-white hover:bg-[#dbdee1] hover:text-[#313338] transition-colors cursor-pointer shrink-0">
                        <span className="text-xl leading-none">+</span>
                    </div>
                    <div className="flex-grow relative flex items-center">
                        <input
                            className="bg-transparent border-none outline-none text-[#dbdee1] flex-grow placeholder:text-[#949ba4] text-sm z-10"
                            placeholder="Message #base-camp"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        {inputText.toLowerCase().startsWith("/") && "/dealdust".startsWith(inputText.toLowerCase()) && inputText.length > 0 && inputText.length < 9 && (
                            <div className="absolute left-0 text-sm text-[#949ba4] pointer-events-none">
                                <span className="text-transparent">{inputText}</span>
                                <span>{"/dealdust".substring(inputText.length)}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function DensityPage() {
    return (
        <>
            <Header />
            <Sidebar />
            <div className="min-h-screen bg-black relative">
                {/* Section 1 - Hero */}
                <section className="min-h-screen relative flex items-center justify-center overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/density/page33bg.webp"
                            alt="Background"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 pt-[72px] md:ml-[79px] px-4 sm:px-8 md:px-12 w-[calc(100%-79px)]">
                        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center py-12 lg:py-20">
                            {/* Left - Text */}
                            <motion.div
                                className="space-y-8"
                                initial={{ opacity: 0, x: -50 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 1 }}
                            >
                                <motion.div
                                    className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-2"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.3, duration: 0.8 }}
                                >
                                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                                    <span className="text-xs font-pt-mono font-bold text-white uppercase tracking-widest">ECOSYSTEM TOKEN</span>
                                </motion.div>

                                <motion.h1
                                    className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter font-montserrat text-white leading-none"
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5, duration: 1 }}
                                >
                                    $DENSITY
                                </motion.h1>

                                <motion.p
                                    className="text-2xl sm:text-3xl md:text-4xl font-pt-mono text-gray-300 max-w-2xl"
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.7, duration: 0.8 }}
                                >
                                    The lifeblood of the Old Rock ecosystem
                                </motion.p>

                                {/* Balance Display */}
                                <motion.div
                                    initial={{ opacity: 0, y: 30 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.9, duration: 0.8 }}
                                    className="pt-4 max-w-xl"
                                >
                                    <DensityBalanceDisplay />
                                </motion.div>
                            </motion.div>

                            {/* Right - Graphic */}
                            <motion.div
                                className="relative aspect-square w-full max-w-lg mx-auto"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.5, duration: 1, type: "spring" }}
                            >
                                <video
                                    autoPlay
                                    loop
                                    muted
                                    playsInline
                                    className="w-full h-full object-contain"
                                >
                                    <source src="/videos/density/density_hero.webm" type="video/webm" />
                                </video>
                            </motion.div>
                        </div>
                    </div>

                    {/* Scroll Indicator */}
                    <motion.div
                        className="absolute bottom-8 left-1/2 -translate-x-1/2"
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
                            <div className="w-1.5 h-3 bg-white/50 rounded-full" />
                        </div>
                    </motion.div>
                </section>

                {/* Section 2 - Where Density Lives */}
                <section className="relative py-12 overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/density/page34bg.webp"
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 pt-[72px] md:ml-[79px] px-4 sm:px-8 md:px-12 w-full lg:w-[calc(100%-79px)]">
                        <div className="max-w-7xl mx-auto py-12 lg:py-20">
                            <motion.div
                                className="text-center mb-12"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white mb-4">
                                    WHERE $DENSITY LIVES
                                </h2>
                                <p className="text-lg font-pt-mono text-gray-400 max-w-2xl mx-auto">
                                    $DENSITY currently exists inside the <span className="text-purple-400 font-bold">Old Rock Ecosystem Balance</span> — a unified, centralized balance used across our experiences.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                                {/* Amplify Card */}
                                <motion.div
                                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col h-full"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.2, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                >
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0">
                                            <Zap className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black font-montserrat text-white tracking-tight">AMPLIFY</h3>
                                    </div>
                                    <p className="text-sm font-pt-mono text-purple-300 mb-6 font-bold uppercase tracking-wider">Soft Staking</p>
                                    <ul className="space-y-4 text-sm font-pt-mono text-gray-300 flex-grow">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-purple-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed text-gray-200">Passive daily emissions</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-purple-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed">Generated through <strong className="text-white font-bold">Old Rock NFT ownership</strong></span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-purple-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed text-gray-200">No lockups, no friction</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-purple-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed text-gray-200">Designed for long-term participation</span>
                                        </li>
                                    </ul>
                                </motion.div>

                                {/* Airdrop Card */}
                                <motion.div
                                    className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 flex flex-col h-full"
                                    initial={{ opacity: 0, y: 40 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4, duration: 0.8 }}
                                    viewport={{ once: true }}
                                    whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                                >
                                    <div className="flex items-center space-x-3 mb-6">
                                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center shrink-0">
                                            <Gift className="w-6 h-6 text-white" />
                                        </div>
                                        <h3 className="text-xl font-black font-montserrat text-white tracking-tight">AIRDROP SEASONS</h3>
                                    </div>
                                    <p className="text-sm font-pt-mono text-orange-300 mb-6 font-bold uppercase tracking-wider">Community Rewards</p>
                                    <ul className="space-y-4 text-sm font-pt-mono text-gray-300 flex-grow">
                                        <li className="flex items-start space-x-3">
                                            <span className="text-orange-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed text-gray-200">Distributed through ecosystem participation</span>
                                        </li>
                                        <li className="flex items-start space-x-3">
                                            <span className="text-orange-400 mt-1 flex-shrink-0">
                                                <div className="w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                                            </span>
                                            <span className="leading-relaxed text-gray-200">Rewarding early users, contributors, and explorers</span>
                                        </li>
                                    </ul>
                                </motion.div>
                            </div>

                        </div>
                    </div>
                </section>

                {/* Section 3 - Dust Dealer & Simulator */}
                <section className="relative py-12 overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/density/page35bg.webp"
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 pt-12 md:ml-[79px] px-4 sm:px-8 md:px-12 w-full lg:w-[calc(100%-79px)]">
                        <div className="max-w-7xl mx-auto py-8">
                            {/* Header */}
                            <motion.div
                                className="text-center mb-12"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                viewport={{ once: true }}
                            >
                                <p className="text-sm font-pt-mono text-purple-400 mb-2 uppercase">A new way to earn $DENSITY before launch</p>
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white mb-4 uppercase">
                                    MEET THE DUST DEALER
                                </h2>
                                <p className="text-lg font-pt-mono text-gray-400 max-w-3xl mx-auto">
                                    A live, community-driven $DENSITY distribution system that lives directly inside the <span className="text-purple-400 font-bold">Old Rock Discord</span>.
                                </p>
                            </motion.div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch">
                                {/* Left Column - Mechanics */}
                                <div className="space-y-6">
                                    {/* Mini Cards Row */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Hourly Dust Drops */}
                                        <motion.div
                                            className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full"
                                            initial={{ opacity: 0, x: -30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.2, duration: 0.8 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                                                    <Dice1 className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-black font-montserrat text-white uppercase leading-tight mt-1">HOURLY DUST DROPS</h3>
                                            </div>
                                            <ul className="space-y-2 text-[13px] font-pt-mono text-gray-300">
                                                <li className="flex items-start space-x-2"><span className="text-purple-400">•</span><span>Every hour, there is a <strong className="text-purple-300">5% chance</strong> the Dust Dealer appears</span></li>
                                                <li className="flex items-start space-x-2"><span className="text-purple-400">•</span><span>Reward size: <strong className="text-purple-300 font-bold">20–200 $DENSITY</strong></span></li>
                                                <li className="flex items-start space-x-2"><span className="text-purple-400">•</span><span>The drop appears publicly in chat</span></li>
                                                <li className="flex items-start space-x-2"><span className="text-purple-400">•</span><span>Users have <strong className="text-purple-300">12 hours to act</strong> before it flows to Overload</span></li>
                                            </ul>
                                        </motion.div>

                                        {/* Dealdust Explainer */}
                                        <motion.div
                                            className="bg-gradient-to-r from-blue-900/40 to-indigo-900/40 backdrop-blur-md border border-white/20 rounded-2xl p-6 h-full"
                                            initial={{ opacity: 0, x: 30 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.3, duration: 0.8 }}
                                            viewport={{ once: true }}
                                        >
                                            <div className="flex items-center space-x-3 mb-4">
                                                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center shrink-0">
                                                    <Terminal className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-black font-montserrat text-white uppercase leading-tight mt-1">/DEALDUST COMMAND</h3>
                                            </div>
                                            <ul className="space-y-2 text-[13px] font-pt-mono text-gray-300">
                                                <li className="flex items-start space-x-2"><span className="text-indigo-400">•</span><span>Type <code className="bg-black/30 px-1 rounded text-white">/dealdust</code> to share your wealth</span></li>
                                                <li className="flex items-start space-x-2"><span className="text-indigo-400">•</span><span>Specify an amount to split among 5 people</span></li>
                                                <li className="flex items-start space-x-2"><span className="text-indigo-400">•</span><span>Promotes social risk and community growth</span></li>
                                                <li className="flex items-start space-x-2"><span className="text-indigo-400">•</span><span>The $DENSITY slips it into their hands silently</span></li>
                                            </ul>
                                        </motion.div>
                                    </div>

                                    {/* Discord Simulator */}
                                    <motion.div
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-[#5865f2] rounded-lg flex items-center justify-center shrink-0">
                                                <MessageCircle className="w-5 h-5 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-black font-montserrat text-white uppercase leading-tight">DISCORD SIMULATOR</h3>
                                                <p className="text-[10px] font-pt-mono text-purple-400">EXPERIENCE THE DEALER LIVE</p>
                                            </div>
                                        </div>
                                        <DiscordSimulator />
                                    </motion.div>
                                </div>

                                {/* Right Column - Dust Dealer */}
                                <div className="flex items-center justify-center mt-12 lg:mt-0">
                                    <motion.div
                                        className="relative w-full max-w-lg"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="relative aspect-square w-full">
                                            <DensityOrb />
                                            <Image
                                                src="/images/density/dustdealer_v2.webp"
                                                alt="Dust Dealer"
                                                fill
                                                className="object-contain relative z-10 pointer-events-none"
                                            />
                                            <DustOverlay />
                                        </div>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 4 - Mechanics & Consequences */}
                <section className="relative py-12 overflow-hidden">
                    {/* Background */}
                    <div className="absolute inset-0">
                        <Image
                            src="/images/density/page36bg.webp"
                            alt="Background"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/80 to-black" />
                    </div>

                    {/* Content */}
                    <div className="relative z-10 pt-8 md:ml-[79px] px-4 sm:px-8 md:px-12 w-full lg:w-[calc(100%-79px)]">
                        <div className="max-w-7xl mx-auto py-8">
                            <div className="text-center mb-12">
                                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-montserrat text-white uppercase tracking-tighter">
                                    MECHANICS & CONSEQUENCES
                                </h2>
                                <p className="text-sm font-pt-mono text-gray-400 mt-2 italic">Risk everything, or gain it all through community chaos.</p>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                                {/* Left Column - Risks */}
                                <div className="space-y-8 flex flex-col h-full">
                                    {/* Claim or Risk It */}
                                    <motion.div
                                        className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex-1"
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.2, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center shrink-0">
                                                <AlertTriangle className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black font-montserrat text-white uppercase">CLAIM OR RISK IT</h3>
                                        </div>
                                        <div className="space-y-4 text-sm font-pt-mono">
                                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                                <p className="text-gray-400 mb-2 font-bold uppercase text-xs">If reward is below 50 $DENSITY</p>
                                                <p className="text-green-400 font-bold">→ Only option: Claim</p>
                                            </div>
                                            <div className="bg-black/40 rounded-xl p-4 border border-white/5">
                                                <p className="text-gray-400 mb-2 font-bold uppercase text-xs">If reward is 50 $DENSITY or more</p>
                                                <p className="text-white mb-3">→ Choose your path:</p>
                                                <div className="flex gap-3">
                                                    <div className="flex-1 bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-center">
                                                        <span className="text-green-400 font-black text-xs block">CLAIM</span>
                                                        <span className="text-[10px] text-gray-400">Safe Extract</span>
                                                    </div>
                                                    <div className="flex-1 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 text-center">
                                                        <span className="text-purple-400 font-black text-xs block">OPEN A RIFT</span>
                                                        <span className="text-[10px] text-gray-400">Social Gamble</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>

                                    {/* Opening a Rift */}
                                    <motion.div
                                        className="bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-md border border-white/20 rounded-2xl p-6 flex-1"
                                        initial={{ opacity: 0, x: -30 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.4, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-red-500 rounded-lg flex items-center justify-center shrink-0">
                                                <Flame className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-xl font-black font-montserrat text-white uppercase">OPENING A RIFT</h3>
                                        </div>
                                        <p className="text-sm font-pt-mono text-gray-400 mb-6">Probability for a social risk/reward events. <strong className="text-white">33.3% chance for each:</strong></p>
                                        <div className="space-y-3 text-sm font-pt-mono">
                                            <div className="flex items-center space-x-4 bg-black/40 rounded-xl p-4 border border-white/5">
                                                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-red-500/20 rounded-lg">❌</div>
                                                <div>
                                                    <p className="text-red-400 font-black text-xs uppercase">Total Loss</p>
                                                    <p className="text-[11px] text-gray-400">All dust is lost to the Overload</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 bg-black/40 rounded-xl p-4 border border-white/5">
                                                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-green-500/20 rounded-lg">📈</div>
                                                <div>
                                                    <p className="text-green-400 font-black text-xs uppercase">Amplified Win</p>
                                                    <p className="text-[11px] text-gray-400">Receive your dust + <strong className="text-white">150% bonus</strong></p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-4 bg-black/40 rounded-xl p-4 border border-white/5">
                                                <div className="text-2xl w-10 h-10 flex items-center justify-center bg-purple-500/20 rounded-lg">🌪️</div>
                                                <div>
                                                    <p className="text-purple-400 font-black text-xs uppercase">Dust Spill</p>
                                                    <p className="text-[11px] text-gray-400">The entire amount spills into chat</p>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Right Column - Consequences */}
                                <div className="space-y-8 flex flex-col h-full">
                                    {/* Overload System */}
                                    <motion.div
                                        className="bg-gradient-to-r from-orange-900/50 to-red-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 flex-1"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center space-x-4 mb-8">
                                            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-orange-500/20">
                                                <TrendingUp className="w-6 h-6 text-white" />
                                            </div>
                                            <h3 className="text-2xl font-black font-montserrat text-white uppercase leading-none mt-1">OVERLOAD SYSTEM</h3>
                                        </div>
                                        <p className="text-sm font-pt-mono text-gray-400 mb-6 leading-relaxed">
                                            Dust that is <strong className="text-white">lost</strong> or <strong className="text-white">unclaimed</strong> flows into the Overload pool.
                                        </p>
                                        <div className="bg-black/50 rounded-2xl p-6 mb-6 border border-white/10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <TrendingUp className="w-12 h-12 text-white" />
                                            </div>
                                            <p className="text-sm font-pt-mono text-white mb-4 uppercase tracking-tighter">When Pool Hits <span className="text-orange-400 font-black text-lg">500 $DENSITY</span>:</p>
                                            <ul className="space-y-4 text-sm font-pt-mono text-gray-300">
                                                <li className="flex items-center space-x-3">
                                                    <span className="w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                                                    <span>Chance to <strong className="text-orange-300">burst</strong> every hour</span>
                                                </li>
                                                <li className="flex items-center space-x-3">
                                                    <span className="w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                                                    <span>On burst: All dust spills into chat</span>
                                                </li>
                                                <li className="flex items-center space-x-3">
                                                    <span className="w-1 h-1 bg-orange-400 rounded-full shrink-0"></span>
                                                    <span>Last 10 active split the bounty</span>
                                                </li>
                                            </ul>
                                        </div>
                                        <div className="bg-orange-500/10 border border-orange-500/30 rounded-xl p-4">
                                            <p className="text-xs font-pt-mono text-orange-400 text-center italic">
                                                "Overload turns your silence into their survival."
                                            </p>
                                        </div>
                                    </motion.div>

                                    {/* Why This Matters */}
                                    <motion.div
                                        className="bg-gradient-to-r from-purple-900/50 to-blue-900/50 backdrop-blur-md border border-white/20 rounded-2xl p-6 sm:p-8 flex-1"
                                        initial={{ opacity: 0, y: 40 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5, duration: 0.8 }}
                                        viewport={{ once: true }}
                                    >
                                        <div className="flex items-center space-x-4 mb-8">
                                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl flex items-center justify-center shrink-0">
                                                <Sparkles className="w-6 h-6 text-white shrink-0" />
                                            </div>
                                            <h3 className="text-2xl font-black font-montserrat text-white uppercase leading-none mt-1">WHY THIS MATTERS</h3>
                                        </div>
                                        <ul className="space-y-5 text-sm font-pt-mono">
                                            {[
                                                { text: "$DENSITY is earned ", highlight: "before markets" },
                                                { text: "Distribution is tied to ", highlight: "human behavior" },
                                                { text: "Risk and generosity are ", highlight: "rewarded" },
                                                { text: "Every token stems from ", highlight: "participation" }
                                            ].map((item, i) => (
                                                <li key={i} className="flex items-center space-x-4">
                                                    <div className="w-2 h-2 bg-purple-500 rounded-full shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.8)]"></div>
                                                    <span className="text-gray-300">{item.text} <strong className="text-white">{item.highlight}</strong></span>
                                                </li>
                                            ))}
                                        </ul>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                <div className="h-12"></div> {/* Tighter space before footer */}
            </div>
            <Footer />
        </>
    )
}
