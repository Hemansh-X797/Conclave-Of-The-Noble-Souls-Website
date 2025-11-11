export const metadata = {

  title: {
    default: 'The Conclave Of The Noble Souls',
    template: '%s | The Conclave'
  },
  description: 'A noble, multi-pathway community that connects like-minded individuals in gaming, productivity, knowledge-sharing, and intellectual growth.',
  
  keywords: [
    'Noble Souls',
    'luxury community',
    'gaming',
    'productivity',
    'anime',
    'manga',
    'manhua',
    'manhwa',
    'novels',
    'light novels',
    'web novels',
    'webtoons',
    'donghua',
    'self-improvement',
    'skill development',
    'personal growth',
    'education',
    'learning',
    'elite communities',
    'intellectual growth',
    'technology',
    'entrepreneurship',
    'philosophy',
    'mindfulness',
    'creative writing',
    'art',
    'digital art',
    'storytelling',
    'leadership',
    'mental wellness',
    'Discord community'
  ],

  authors: [
    { 
      name: 'Hemansh Kumar Mishra', 
      email: 'kundansmishra@gmail.com',
      url: process.env.NEXT_PUBLIC_SITE_URL 
    }

  ],
  creator: 'Hemansh Kumar Mishra',
  publisher: 'The Conclave',
  email: "kundansmishra@gmail.com",
  private: true, 

  contact: {
    email: "kundansmishra@gmail.com",
    discord: "darkpower797",  
  },

  social: {
    discord: "darkpower797",  
    email: "kundansmishra@gmail.com",
    twitter: "@YourTwitterHandle",  // Your Twitter handle (optional)
  },

  language: "en",  
  robots: "index, follow, noarchive",  // Allow indexing but prevent archiving
  viewport: "width=device-width, initial-scale=1.0",
  themeColor: "#ffd700",  // Luxurious gold for mobile devices

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    siteName: 'The Conclave Of The Noble Souls',
    title: 'The Conclave Of The Noble Souls',
    description: 'A noble, multi-pathway community fostering creativity, growth, and collaboration across various domains.',
    images: [
      {
        url: '/Assets/Images/CNS_logo1.png',
        width: 1200,
        height: 630,
        alt: 'The Conclave Logo',
        type: 'image/png'
      }
    ]
  },

  twitter: {
    card: 'summary_large_image',
    title: 'The Conclave Of The Noble Souls',
    description: 'Join The Conclave Of The Noble Souls, where community members from diverse backgrounds unite to share knowledge, passions, and ideas.',
    images: ['/Assets/Images/CNS_logo1.png'],
    creator: '@YourTwitterHandle',
    site: '@YourTwitterHandle'
  },

  schemaOrg: {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "The Conclave Of The Noble Souls",
    url: "https://yourwebsite.com",  // Replace with your actual URL
    logo: "/assets/Images/CNS_logo1.jpg",  
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      email: "kundansmishra@gmail.com",
    },
  },

  robots: {
    index: true,
    follow: true,
    noarchive: true,
    nocache: false,
    noimageindex: false,
    nosnippet: false
  },
  icons: {
    icon: [
      { url: '/favicon/favicon.ico', sizes: 'any' },
      { url: '/favicon/icon.svg', type: 'image/svg+xml' }
    ],
    apple: [
      { url: '/Assets/Images/CNS_logo1.png', sizes: '180x180', type: 'image/png' }
    ]
  },
  manifest: '/manifest.json',
  applicationName: 'The Conclave',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'The Conclave'
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code'
  },
  repository: {
    type: "git",
    user: "Hemansh-X797",
    url: "https://github.com/Hemansh-X797/Conclave-Of-The-Noble-Souls-Website.git"
  },

  category: 'community',
  classification: 'Community & Social',
  referrer: 'origin-when-cross-origin'
};

export default metadata;