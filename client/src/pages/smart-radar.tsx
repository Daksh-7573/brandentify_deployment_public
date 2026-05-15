import { ArrowLeft, Radar, MapPin, TrendingUp, Users, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLocation } from 'wouter';
import { Helmet } from 'react-helmet';

export default function SmartRadarPage() {
  const [, setLocation] = useLocation();

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Brandentify Smart Radar",
    "description": "Location-based professional networking and opportunity discovery platform",
    "url": "https://brandentify.com/smart-radar",
    "applicationCategory": "SocialNetworkingApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Location-Based Discovery",
      "Trend Tracking",
      "Smart Networking",
      "Opportunity Radar"
    ]
  };

  return (
    <div className="w-full min-h-full text-white selection:bg-white/20 font-['Outfit'] relative flex justify-center px-4 sm:px-6 lg:px-8 py-8">
      <Helmet>
        <title>Smart Radar - Location-Based Professional Discovery | Brandentify</title>
        <meta name="description" content="Coming soon: Smart Radar helps you discover professionals, opportunities, and trends in your geographic area. Location-based networking with privacy-first approach." />
        <meta name="keywords" content="location-based networking, professional discovery, geographic networking, career opportunities, location-based services" />
        <meta property="og:title" content="Smart Radar - Location-Based Professional Discovery" />
        <meta property="og:description" content="Discover professionals and opportunities in your area with Smart Radar - coming soon" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://brandentify.com/smart-radar-og-image.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Smart Radar - Location-Based Discovery" />
        <link rel="canonical" href="https://brandentify.com/smart-radar" />
        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="w-full max-w-5xl">
        {/* Main Content Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8">
          {/* Back Button */}
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => setLocation('/')}
              className="text-gray-400 hover:text-white hover:bg-white/10 border border-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          {/* Main Content */}
          <div className="text-center py-8">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-full">
                <Radar className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-white mb-4">
            Smart Radar
          </h1>

          {/* Subtitle */}
          <h2 className="text-xl text-white/80 mb-6">
            Coming Soon
          </h2>

          {/* Description */}
          <p className="text-white/70 text-lg max-w-2xl mx-auto mb-8">
            We're building something powerful to help you track opportunities, trends, and signals in your industry.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <MapPin className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Location-Based Discovery</h3>
                <p className="text-white/60 text-sm">Find professionals and opportunities near you</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Trend Tracking</h3>
                <p className="text-white/60 text-sm">Stay ahead of industry trends and movements</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <Users className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Smart Networking</h3>
                <p className="text-white/60 text-sm">Connect with relevant professionals intelligently</p>
              </CardContent>
            </Card>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
              <CardContent className="p-3 text-center">
                <Compass className="h-8 w-8 text-orange-400 mx-auto mb-2" />
                <h3 className="text-white font-semibold mb-1">Opportunity Radar</h3>
                <p className="text-white/60 text-sm">Discover hidden opportunities in your field</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white/5 border border-white/10 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-xl font-semibold text-white mb-3">
              Be the First to Know
            </h3>
            <p className="text-white/70 mb-4">
              We're working hard to bring Smart Radar to life. Get notified when it launches.
            </p>
            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              Notify Me When Available
            </Button>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-gray-400 text-sm">
            <p>Smart Radar will help you discover professionals, opportunities, and trends in your geographic area and industry.</p>
            <p className="mt-2">Privacy-first location sharing with full control over your visibility.</p>
          </div>

          {/* Smart Radar FAQ Section for SEO */}
          <section id="radar-faq" className="mt-12 text-left bg-white/5 border border-white/10 rounded-lg p-6 backdrop-blur-sm">
            <h2 className="text-2xl font-bold text-white mb-6">Smart Radar FAQ</h2>
            <div className="space-y-6" itemScope itemType="https://schema.org/FAQPage">
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">How does Smart Radar location discovery work?</h3>
                <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                  <p itemProp="text" className="text-gray-400">Smart Radar uses privacy-first location sharing to help you discover professionals and opportunities in your geographic area, with full control over your visibility.</p>
                </div>
              </div>
              <div itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name" className="text-lg font-semibold text-white mb-2">What types of opportunities can I discover?</h3>
                <div itemProp="acceptedAnswer" itemScope itemType="https://schema.org/Answer">
                  <p itemProp="text" className="text-gray-400">Discover networking events, job opportunities, industry trends, and professional connections in your specific geographic area and industry.</p>
                </div>
              </div>
            </div>
          </section>
          </div>
        </div>
      </div>
    </div>
  );
}
