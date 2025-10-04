"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { motion } from "framer-motion"

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <CyberpunkBackground />
      <Header />

      <main className="relative z-20 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-black font-montserrat mb-8">Privacy Policy</h1>
            <p className="text-gray-400 font-pt-mono mb-8">Last updated: January 2025</p>

            <div className="space-y-8 font-pt-mono text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you create an account, participate in
                  our games, or communicate with us. This may include wallet addresses, gameplay data, and communication
                  preferences.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">How We Use Your Information</h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, process
                  transactions, communicate with you, and ensure the security of our platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Information Sharing</h2>
                <p>
                  We do not sell, trade, or otherwise transfer your personal information to third parties without your
                  consent, except as described in this policy or as required by law.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Data Security</h2>
                <p>
                  We implement appropriate security measures to protect your personal information against unauthorized
                  access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Blockchain Data</h2>
                <p>
                  Please note that blockchain transactions are public and permanent. Any information recorded on the
                  blockchain cannot be deleted or modified.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us through our Discord server or
                  official communication channels.
                </p>
              </section>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  )
}
