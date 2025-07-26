import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';

export default function DebugAuthClick() {
  const { signInWithGoogle, isLoading, user, isAuthenticated } = useAuth();

  const handleTestClick = () => {
    console.log("🧪 Test button clicked!");
    console.log("Auth state:", { 
      isLoading, 
      user: user ? { uid: user.uid, email: user.email } : null, 
      isAuthenticated 
    });
    
    // Test if signInWithGoogle function exists
    console.log("signInWithGoogle function:", typeof signInWithGoogle);
    
    if (typeof signInWithGoogle === 'function') {
      console.log("Calling signInWithGoogle...");
      signInWithGoogle().then(() => {
        console.log("signInWithGoogle promise resolved");
      }).catch((error) => {
        console.error("signInWithGoogle promise rejected:", error);
      });
    } else {
      console.error("signInWithGoogle is not a function!");
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Auth Click</h1>
      <div style={{ marginBottom: '20px' }}>
        <p>isLoading: {isLoading.toString()}</p>
        <p>isAuthenticated: {isAuthenticated.toString()}</p>
        <p>user: {user ? user.email : 'null'}</p>
        <p>signInWithGoogle type: {typeof signInWithGoogle}</p>
      </div>
      
      <Button onClick={handleTestClick} disabled={isLoading}>
        Test Auth Click
      </Button>
      
      <div style={{ marginTop: '20px' }}>
        <p>Check browser console for detailed logs</p>
      </div>
    </div>
  );
}