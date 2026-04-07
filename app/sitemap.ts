import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: 'https://subs.qappo.pl',
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: 'https://subs.qappo.pl/auth/login',
            lastModified: new Date(),
            changeFrequency: 'never',
            priority: 0.3,
        },
        {
            url: 'https://subs.qappo.pl/auth/register',
            lastModified: new Date(),
            changeFrequency: 'never',
            priority: 0.5,
        },
    ]
}