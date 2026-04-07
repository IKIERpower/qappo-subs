import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/dashboard', '/settings', '/auth/callback'],
        },
        sitemap: 'https://subs.qappo.pl/sitemap.xml',
    }
}