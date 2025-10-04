"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { motion } from "framer-motion"

export default function TermsOfService() {
  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <CyberpunkBackground />
      <Header />

      <main className="relative z-20 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-black font-montserrat mb-8">Terms of Service</h1>
            <p className="text-gray-400 font-pt-mono mb-8">Last updated: January 2025</p>

            <div className="space-y-8 font-pt-mono text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Acceptance of Terms</h2>
                <p>
                  By accessing and using Old Rock NFT services, including our games and platforms, you accept and agree
                  to be bound by these Terms of Service.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Use of Services</h2>
                <p>
                  You may use our services only for lawful purposes and in accordance with these Terms. You agree not to
                  use the services in any way that could damage, disable, or impair our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Gaming and NFTs</h2>
                <p>
                  Our games involve digital assets and NFTs. You understand that these have no inherent monetary value
                  and their value may fluctuate. Participation in games is at your own risk.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Prohibited Activities</h2>
                <p>
                  You may not engage in cheating, exploiting bugs, using unauthorized software, or any other activities
                  that give you an unfair advantage or harm the gaming experience for others.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Limitation of Liability</h2>
                <p>
                  Old Rock NFT shall not be liable for any indirect, incidental, special, or consequential damages
                  arising from your use of our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Modifications</h2>
                <p>
                  We reserve the right to modify these terms at any time. Continued use of our services after changes
                  constitutes acceptance of the new terms.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Contact Information</h2>
                <p>
                  For questions about these Terms of Service, please contact us through our official Discord server or
                  communication channels.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
