"use client"

import { Header } from "@/components/header"
import { CyberpunkBackground } from "@/components/cyberpunk-background"
import { motion } from "framer-motion"

export default function CookiePolicy() {
  return (
    <div className="min-h-screen text-white overflow-hidden relative">
      <CyberpunkBackground />
      <Header />

      <main className="relative z-20 pt-32 pb-20">
        <div className="max-w-4xl mx-auto px-6">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <h1 className="text-4xl md:text-5xl font-black font-montserrat mb-8">Cookie Policy</h1>
            <p className="text-gray-400 font-pt-mono mb-8">Last updated: January 2025</p>

            <div className="space-y-8 font-pt-mono text-gray-300 leading-relaxed">
              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">What Are Cookies</h2>
                <p>
                  Cookies are small text files that are stored on your device when you visit our website. They help us
                  provide you with a better experience by remembering your preferences and improving our services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">How We Use Cookies</h2>
                <p>
                  We use cookies to enhance your browsing experience, analyze website traffic, remember your
                  preferences, and provide personalized content. This helps us improve our platform and gaming services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Types of Cookies We Use</h2>
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    <strong>Essential Cookies:</strong> Necessary for the website to function properly
                  </li>
                  <li>
                    <strong>Analytics Cookies:</strong> Help us understand how visitors interact with our website
                  </li>
                  <li>
                    <strong>Preference Cookies:</strong> Remember your settings and preferences
                  </li>
                  <li>
                    <strong>Marketing Cookies:</strong> Used to deliver relevant advertisements
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Managing Cookies</h2>
                <p>
                  You can control and manage cookies through your browser settings. However, disabling certain cookies
                  may affect the functionality of our website and gaming platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Third-Party Cookies</h2>
                <p>
                  We may use third-party services that place cookies on your device. These services have their own
                  privacy policies and cookie practices.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Updates to This Policy</h2>
                <p>
                  We may update this Cookie Policy from time to time. Any changes will be posted on this page with an
                  updated revision date.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-black font-montserrat text-white mb-4">Contact Us</h2>
                <p>
                  If you have any questions about our use of cookies, please contact us through our Discord server or
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
