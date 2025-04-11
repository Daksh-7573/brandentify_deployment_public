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
      
      // First check if there's any educations API at all using direct call to the education endpoint
      console.log('Testing direct endpoint access');
      
      try {
        const educationsResponse = await fetch('/api/educations');
        const educationsText = await educationsResponse.text();
        console.log('Response status from /api/educations:', educationsResponse.status);
        
        // Try to parse the response as JSON
        try {
          const educationsJson = JSON.parse(educationsText);
          console.log('Educations endpoint response:', educationsJson);
        } catch(e) {
          console.log('Raw response from educations endpoint:', educationsText.substring(0, 200) + '...');
        }
      } catch (endpointError) {
        console.error('Error accessing educations endpoint:', endpointError);
      }
      
      // Now try the original endpoint
      console.log('Testing GET /api/users/1/educations with proper endpoint');
      
      const response = await fetch('/api/users/1/educations');
      console.log('Response status from user educations:', response.status);
      console.log('Response headers:', {
        contentType: response.headers.get('content-type'),
        contentLength: response.headers.get('content-length')
      });
      
      const text = await response.text();
      
      try {
        // Try to parse as JSON if possible
        const json = JSON.parse(text);
        console.log('GET education response:', json);
        setResult(`GET Success: ${JSON.stringify(json, null, 2)}`);
      } catch (e) {
        // If not JSON, show the raw text with truncation to avoid overwhelming the UI
        console.error('Error parsing JSON:', e);
        console.log('GET education raw response (first 500 chars):', text.substring(0, 500));
        setResult(`GET Raw response (first 1000 chars): ${text.substring(0, 1000)}...`);
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
      
      console.log('Testing with absolute URL first to verify API path');
      const absoluteUrl = window.location.origin + '/api/educations';
      console.log('Using absolute URL:', absoluteUrl);
      
      // First with fetch directly using absolute URL
      const absoluteResponse = await fetch(absoluteUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      const absoluteText = await absoluteResponse.text();
      let absoluteResult = '';
      
      try {
        const absoluteJson = JSON.parse(absoluteText);
        absoluteResult = `Absolute URL Response: ${JSON.stringify(absoluteJson, null, 2)}`;
      } catch (e) {
        absoluteResult = `Absolute URL Raw Response: ${absoluteText.substring(0, 500)}...`;
        console.error('Error parsing JSON from absolute URL:', e);
      }
      
      // Now with relative URL
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
        fetchResult = `Fetch Raw Response: ${fetchText.substring(0, 500)}...`;
        console.error('Error parsing JSON from relative URL:', e);
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
        
        setResult(`${absoluteResult}\n\n${fetchResult}\n\n${apiResult}`);
      } catch (apiError) {
        console.error('Error with apiRequest:', apiError);
        setResult(`${absoluteResult}\n\n${fetchResult}\n\nAPI Request Error: ${apiError instanceof Error ? apiError.message : String(apiError)}`);
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