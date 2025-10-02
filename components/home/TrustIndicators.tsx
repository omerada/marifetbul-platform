'use client';

import { Shield, CheckCircle, Award, Users } from 'lucide-react';

const partnerships = [
  { name: 'TechCorp', logo: '/partners/techcorp.png' },
  { name: 'DesignStudio', logo: '/partners/design.png' },
  { name: 'StartupHub', logo: '/partners/startup.png' },
  { name: 'Innovation Labs', logo: '/partners/innovation.png' },
];

const certifications = [
  {
    icon: Shield,
    title: 'SSL Güvenlik',
    description: '256-bit şifreleme',
  },
  {
    icon: CheckCircle,
    title: 'Doğrulanmış Kimlikler',
    description: '%100 kimlik kontrolü',
  },
  {
    icon: Award,
    title: 'ISO Sertifikalı',
    description: 'Kalite standardı',
  },
  {
    icon: Users,
    title: 'Güvenilir Topluluk',
    description: 'Aktif moderasyon',
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="mb-12">
          <div className="mb-8 text-center">
            <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
              Güvenilir ve Sertifikalı Platform
            </p>
          </div>
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <cert.icon className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-center text-sm font-semibold text-gray-900">
                  {cert.title}
                </h3>
                <p className="mt-1 text-center text-xs text-gray-500">
                  {cert.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Logos */}
        <div>
          <div className="mb-8 text-center">
            <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
              Güvenilen Ortaklarımız
            </p>
          </div>
          <div className="grid grid-cols-2 items-center justify-items-center gap-8 opacity-60 md:grid-cols-4">
            {partnerships.map((partner, index) => (
              <div
                key={index}
                className="flex h-12 w-24 items-center justify-center rounded bg-white px-4 shadow-sm"
              >
                <span className="text-sm font-medium text-gray-600">
                  {partner.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
