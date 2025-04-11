import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiRequest } from '@/lib/queryClient';

export default function TestEducationAPI() {
  const [result, setResult] = useState<string>('No results yet');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const testGetEducation = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      console.log('Testing GET /api/users/1/educations');
      
      const response = await fetch('/api/users/1/educations');
      const text = await response.text();
      
      try {
        // Try to parse as JSON if possible
        const json = JSON.parse(text);
        console.log('GET education response:', json);
        setResult(`GET Success: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        // If not JSON, show the raw text
        console.log('GET education raw response:', text);
        setResult(`GET Raw response: ${text}`);
      }
    } catch (error) {
      console.error('Error testing GET education API:', error);
      setErrorMessage(`GET Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateEducation = async () => {
    setLoading(true);
    setErrorMessage(null);
    
    try {
      const testData = {
        userId: 1,
        degree: 'Test Degree',
        institution: 'Test University',
        location: 'Test Location',
        startDate: '2020-01'
      };
      
      console.log('Testing POST /api/educations with data:', testData);
      
      // First with fetch directly
      const fetchResponse = await fetch('/api/educations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const fetchText = await fetchResponse.text();
      let fetchResult = '';
      
      try {
        const fetchJson = JSON.parse(fetchText);
        fetchResult = `Fetch Response: ${JSON.stringify(fetchJson, null, 2)}`;
      } catch (e) {
        fetchResult = `Fetch Raw Response: ${fetchText}`;
      }
      
      // Now with apiRequest
      console.log('Testing POST /api/educations with apiRequest');
      
      try {
        const apiResponse = await apiRequest({
          method: 'POST',
          url: '/api/educations',
          data: testData
        });
        
        const apiText = await apiResponse.text();
        let apiResult = '';
        
        try {
          const apiJson = JSON.parse(apiText);
          apiResult = `apiRequest Response: ${JSON.stringify(apiJson, null, 2)}`;
        } catch (e) {
          apiResult = `apiRequest Raw Response: ${apiText}`;
        }
        
        setResult(`${fetchResult}\n\n${apiResult}`);
      } catch (apiError) {
        console.error('Error with apiRequest:', apiError);
        setResult(`${fetchResult}\n\nAPI Request Error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
      }
    } catch (error) {
      console.error('Error testing POST education API:', error);
      setErrorMessage(`POST Error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Education API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex space-x-4 mb-4">
          <Button 
            onClick={testGetEducation} 
            disabled={loading}
            variant="outline"
          >
            Test GET Education
          </Button>
          <Button 
            onClick={testCreateEducation} 
            disabled={loading}
            variant="default"
          >
            Test Create Education
          </Button>
        </div>
        
        {loading && <p>Loading...</p>}
        {errorMessage && <p className="text-red-500">{errorMessage}</p>}
        
        <div className="mt-4 p-4 bg-gray-50 rounded-md">
          <pre className="whitespace-pre-wrap text-sm">{result}</pre>
        </div>
      </CardContent>
    </Card>
  );
}