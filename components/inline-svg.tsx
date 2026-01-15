"use client"

import { useState, useEffect } from "react"

interface InlineSVGProps {
    src: string
    alt: string
    className?: string
    width?: number
    height?: number
    parentTriggerClass?: string
    scaleGroup?: string
    onError?: () => void
}

export function InlineSVG({ src, alt, className = "", width, height, parentTriggerClass, scaleGroup, onError }: InlineSVGProps) {
    const [svgContent, setSvgContent] = useState<string | null>(null)
    const [uniqueId] = useState(() => `badge-${Math.random().toString(36).slice(2, 11)}`)

    useEffect(() => {
        const fetchSVG = async () => {
            try {
                const response = await fetch(src)
                if (!response.ok) throw new Error("Failed to load SVG")
                const text = await response.text()

                // Parse the SVG text
                const parser = new DOMParser()
                const doc = parser.parseFromString(text, "image/svg+xml")
                const svgElement = doc.querySelector("svg")

                if (!svgElement) throw new Error("No SVG found")

                const viewBox = svgElement.getAttribute("viewBox") || "0 0 100 100" // Fallback
                const originalContent = svgElement.innerHTML

                // Construct new SVG structure
                // We use CSS for hover state to avoid re-parsing SVG on hover
                const newSvg = `
                    <svg viewBox="${viewBox}" width="100%" height="100%" style="overflow: visible;">
                        <defs>
                            <linearGradient id="${uniqueId}-shine" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stop-color="transparent" />
                                <stop offset="40%" stop-color="white" stop-opacity="0.1" />
                                <stop offset="50%" stop-color="white" stop-opacity="0.6" />
                                <stop offset="60%" stop-color="white" stop-opacity="0.1" />
                                <stop offset="100%" stop-color="transparent" />
                            </linearGradient>
                            <clipPath id="${uniqueId}-clip">
                                <use href="#${uniqueId}-content" />
                            </clipPath>
                            <style>
                                #${uniqueId}-shine-rect {
                                    transition: transform 0.8s ease-out;
                                    transform: translateX(-100%);
                                }
                                /* Trigger shine on self-hover OR parent trigger class hover */
                                #${uniqueId}-wrapper:hover #${uniqueId}-shine-rect,
                                ${parentTriggerClass ? `.${parentTriggerClass}:hover #${uniqueId}-shine-rect` : ''} {
                                    transform: translateX(100%);
                                }
                            </style>
                        </defs>
                        
                        <g id="${uniqueId}-content">
                            ${originalContent}
                        </g>
                        
                        <rect 
                            id="${uniqueId}-shine-rect"
                            x="0" y="0" width="100%" height="100%" 
                            fill="url(#${uniqueId}-shine)" 
                            clip-path="url(#${uniqueId}-clip)"
                            style="pointer-events: none;"
                        />
                    </svg>
                `

                setSvgContent(newSvg)
            } catch (err) {
                console.error("SVG Load Error:", err)
                onError?.()
            }
        }

        fetchSVG()
    }, [src, uniqueId, parentTriggerClass, onError])

    if (!svgContent) return null

    // Determine scaling class: Always scale on self hover (group/badge), optionally scale on parent group
    const scaleClass = `group-hover/badge:scale-110 ${scaleGroup ? `group-hover/${scaleGroup}:scale-110` : ''}`

    return (
        <div
            id={`${uniqueId}-wrapper`}
            className={`relative cursor-pointer group/badge ${className}`}
            style={{ width, height }}
            role="img"
            aria-label={alt}
        >
            <div
                className={`w-full h-full transition-transform duration-300 ease-out ${scaleClass}`}
                dangerouslySetInnerHTML={{ __html: svgContent }}
            />
        </div>
    )
}
