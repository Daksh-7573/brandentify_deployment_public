export default function DomainAuthorizationHelp() {
  const currentDomain = window.location.hostname;
  
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-900/20 border border-red-600 rounded-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-red-400 mb-4">🚨 Google Authentication Not Working</h1>
          <p className="text-red-200 text-lg">
            The Google sign-in popup is blank because this domain is not authorized in Firebase Console.
          </p>
        </div>

        <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-yellow-400 mb-4">REQUIRED ACTION</h2>
          <p className="text-yellow-200 mb-4">
            You must add the current domain to Firebase Console to fix the blank popup issue.
          </p>
          
          <div className="bg-yellow-800/30 p-4 rounded-lg mb-4">
            <h3 className="text-yellow-300 font-semibold mb-2">Current Domain to Add:</h3>
            <code className="text-yellow-100 text-lg bg-yellow-900/50 px-3 py-2 rounded block">
              {currentDomain}
            </code>
          </div>
        </div>

        <div className="bg-blue-900/20 border border-blue-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-blue-400 mb-4">Step-by-Step Instructions</h2>
          
          <ol className="list-decimal list-inside space-y-4 text-blue-200">
            <li>
              <strong>Go to Firebase Console:</strong>
              <br />
              <a 
                href="https://console.firebase.google.com/" 
                target="_blank" 
                className="text-blue-300 underline hover:text-blue-200"
                rel="noopener noreferrer"
              >
                https://console.firebase.google.com/
              </a>
            </li>
            
            <li>
              <strong>Select your project:</strong>
              <br />
              <code className="bg-blue-800/30 px-2 py-1 rounded">brandentifier-app</code>
            </li>
            
            <li>
              <strong>Navigate to:</strong>
              <br />
              Authentication → Settings → Authorized domains
            </li>
            
            <li>
              <strong>Click "Add domain" and add:</strong>
              <br />
              <code className="bg-blue-800/30 px-2 py-1 rounded text-sm">{currentDomain}</code>
            </li>
            
            <li>
              <strong>Also add these for future compatibility:</strong>
              <br />
              <code className="bg-blue-800/30 px-2 py-1 rounded text-sm mr-2">*.replit.dev</code>
              <code className="bg-blue-800/30 px-2 py-1 rounded text-sm">*.replit.app</code>
            </li>
          </ol>
        </div>

        <div className="bg-green-900/20 border border-green-600 rounded-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold text-green-400 mb-4">What This Will Fix</h2>
          
          <div className="space-y-3 text-green-200">
            <div className="flex items-center">
              <span className="text-red-400 mr-3">❌</span>
              <span className="line-through">Blank popup that closes after 6-7 seconds</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-3">✅</span>
              <span>Google login page will display in popup</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-3">✅</span>
              <span>Authentication will complete successfully</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-3">✅</span>
              <span>Users can sign in with their Google accounts</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Current Status</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="text-gray-300 font-semibold mb-2">Working ✅</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Firebase initialization</li>
                <li>• Environment variables</li>
                <li>• Auth state listener</li>
                <li>• OAuth request creation</li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-gray-300 font-semibold mb-2">Blocked ❌</h3>
              <ul className="space-y-1 text-gray-400">
                <li>• Google login page display</li>
                <li>• Authentication completion</li>
                <li>• User sign-in process</li>
                <li>• Domain not authorized</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-400">
            After adding the domain to Firebase Console, try the Google sign-in again.
            <br />
            The popup should show Google's login page instead of a blank screen.
          </p>
        </div>
      </div>
    </div>
  );
}