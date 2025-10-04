'use client';

import { Shield, CheckCircle, Award, Users } from 'lucide-react';

// SVG Icons for major tech companies
const GoogleIcon = () => (
  <svg className="h-12 w-12" viewBox="0 0 24 24" fill="currentColor">
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      className="text-gray-400"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      className="text-gray-500"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      className="text-gray-400"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      className="text-gray-500"
    />
  </svg>
);

const MicrosoftIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M11.4 11.4H2V2h9.4v9.4z" />
    <path d="M22 11.4h-9.4V2H22v9.4z" />
    <path d="M11.4 22H2v-9.4h9.4V22z" />
    <path d="M22 22h-9.4v-9.4H22V22z" />
  </svg>
);

const AmazonIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M.045 18.02c.072-.116.168-.22.287-.312 2.098-1.62 4.698-2.756 7.331-3.204.339-.061.679-.081 1.019-.081.32 0 .639.02.959.061.639.081 1.259.224 1.858.428.639.204 1.258.469 1.857.795.18.102.36.204.539.327.12.082.24.163.359.265.12.081.219.183.299.285.08.122.12.265.12.408 0 .122-.04.244-.12.346-.08.102-.179.183-.299.244-.639.346-1.378.632-2.158.857-.699.204-1.418.346-2.158.407-.719.081-1.458.102-2.198.041-.699-.041-1.398-.122-2.077-.265-.699-.122-1.378-.305-2.037-.548-.659-.244-1.298-.549-1.917-.916-.12-.082-.219-.183-.299-.305-.08-.122-.12-.265-.12-.407-.02-.163.02-.326.099-.469z" />
    <path d="M18.305 15.408c-.12 0-.24-.041-.34-.102-.819-.509-1.738-.897-2.717-1.162-.08-.02-.16-.061-.22-.122-.06-.061-.1-.142-.1-.224 0-.102.04-.204.12-.285.08-.082.18-.143.28-.163.999-.265 1.958-.652 2.837-1.162.1-.061.22-.102.34-.102.139 0 .279.041.379.122.1.082.16.204.16.327 0 .122-.06.244-.16.326-.88.51-1.838.897-2.837 1.162-.1.02-.2.082-.28.163-.08.081-.12.183-.12.285 0 .082.04.163.1.224.06.061.14.102.22.122.979.265 1.898.653 2.717 1.162.1.061.24.102.34.102z" />
  </svg>
);

const MetaIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
  </svg>
);

const NetflixIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M5.398 0v.006c0 .012 0 .018.006.024V24l4.537-1.505V.01L5.398 0zm13.2 0v22.494L23.135 24V0h-4.537zM10.06.006V24l4.538-1.505V.01L10.06.006z" />
  </svg>
);

const SpotifyIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
  </svg>
);

const AdobeIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M13.966 22.624l-1.69-4.281H8.122l3.892-9.144 5.662 13.425zM8.884 1.376v21.248L0 1.376h8.884zm6.232 0L24 22.624V1.376h-8.884z" />
  </svg>
);

const SalesforceIcon = () => (
  <svg
    className="h-12 w-12 text-gray-400"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M8.562 14.146c-.474 0-.859-.385-.859-.859s.385-.859.859-.859.859.385.859.859-.385.859-.859.859zm0-1.367c-.28 0-.508.228-.508.508s.228.508.508.508.508-.228.508-.508-.228-.508-.508-.508z" />
    <path d="M9.709 18.16c-.789-.002-1.426-.642-1.428-1.43v-.001c-.002-.789.635-1.431 1.424-1.433h.004c.789.002 1.426.642 1.428 1.43v.001c.002.789-.635 1.431-1.424 1.433h-.004z" />
    <path d="M15.438 14.146c-.474 0-.859-.385-.859-.859s.385-.859.859-.859.859.385.859.859-.385.859-.859.859zm0-1.367c-.28 0-.508.228-.508.508s.228.508.508.508.508-.228.508-.508-.228-.508-.508-.508z" />
    <path d="M14.291 18.16c-.789-.002-1.426-.642-1.428-1.43v-.001c-.002-.789.635-1.431 1.424-1.433h.004c.789.002 1.426.642 1.428 1.43v.001c.002.789-.635 1.431-1.424 1.433h-.004z" />
  </svg>
);

const partnerships = [
  { name: 'Google', component: GoogleIcon },
  { name: 'Microsoft', component: MicrosoftIcon },
  { name: 'Amazon', component: AmazonIcon },
  { name: 'Meta', component: MetaIcon },
  { name: 'Netflix', component: NetflixIcon },
  { name: 'Spotify', component: SpotifyIcon },
  { name: 'Adobe', component: AdobeIcon },
  { name: 'Salesforce', component: SalesforceIcon },
];

const certifications = [
  {
    icon: Shield,
    title: 'SSL Güvenlik',
  },
  {
    icon: CheckCircle,
    title: 'Kimlik Kontrolü',
  },
  {
    icon: Award,
    title: 'ISO Sertifikalı',
  },
  {
    icon: Users,
    title: 'Güvenilir Topluluk',
  },
];

export function TrustIndicators() {
  return (
    <section className="bg-gray-50 py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Badges */}
        <div className="mb-8">
          <div className="mb-6 text-center">
            <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
              Güvenilir Platform
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="flex flex-col items-center rounded-lg bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                  <cert.icon className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-center text-sm font-medium text-gray-900">
                  {cert.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership Logos - Simplified */}
        <div>
          <div className="mb-6 text-center">
            <p className="text-sm font-medium tracking-wider text-gray-500 uppercase">
              Güvenilen Ortaklar
            </p>
          </div>

          {/* Static Logo Grid */}
          <div className="flex items-center justify-center">
            <div className="grid grid-cols-4 gap-8 md:grid-cols-8">
              {partnerships.slice(0, 8).map((partner, index) => (
                <div
                  key={index}
                  className="flex h-12 w-12 items-center justify-center opacity-60 transition-all duration-300 hover:scale-110 hover:opacity-100"
                >
                  <partner.component />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
