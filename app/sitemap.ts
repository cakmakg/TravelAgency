import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://www.russoluxtours.de'

    // Static pages
    const staticPages = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 1,
        },
    ]

    // Package detail pages
    const packagePages = [1, 2, 3, 4].map((id) => ({
        url: `${baseUrl}/packages/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    // Fair detail pages
    const fairPages = [1, 2, 3, 4].map((id) => ({
        url: `${baseUrl}/fairs/${id}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    return [...staticPages, ...packagePages, ...fairPages]
}
