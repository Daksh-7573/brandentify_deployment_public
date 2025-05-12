import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

// Data request types
export enum DataRequestType {
  ACCESS = 'access',
  DELETION = 'deletion',
  CORRECTION = 'correction',
  RESTRICTION = 'restriction',
  PORTABILITY = 'portability',
  OBJECTION = 'objection'
}

interface DataRequestFormProps {
  userId: string;
  onRequestSubmitted?: () => void;
}

const DataRequestForm: React.FC<DataRequestFormProps> = ({ userId, onRequestSubmitted }) => {
  const [requestType, setRequestType] = useState<DataRequestType>(DataRequestType.ACCESS);
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      setStatus('error');
      setErrorMessage('Please sign in to submit a data request.');
      return;
    }
    
    setStatus('loading');
    
    try {
      const response = await fetch('/api/privacy/data-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': userId
        },
        body: JSON.stringify({
          type: requestType,
          description
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit data request');
      }
      
      setStatus('success');
      setDescription('');
      
      if (onRequestSubmitted) {
        onRequestSubmitted();
      }
    } catch (error) {
      console.error('Error submitting data request:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Failed to submit data request');
    }
  };

  const requestTypeDescriptions = {
    [DataRequestType.ACCESS]: 'Request a copy of all personal data we have about you.',
    [DataRequestType.DELETION]: 'Request deletion of your personal data from our systems.',
    [DataRequestType.CORRECTION]: 'Request correction of inaccurate personal data.',
    [DataRequestType.RESTRICTION]: 'Request restriction of processing of your personal data.',
    [DataRequestType.PORTABILITY]: 'Request transfer of your data to another service provider.',
    [DataRequestType.OBJECTION]: 'Object to processing of your personal data.',
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Data Request Form</CardTitle>
        <CardDescription>
          Submit a request about your personal data. We'll respond within 30 days.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6">
          {status === 'success' && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Request Submitted</AlertTitle>
              <AlertDescription className="text-green-700">
                Your data request has been submitted successfully. We'll process your request and respond within 30 days.
              </AlertDescription>
            </Alert>
          )}
          
          {status === 'error' && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                {errorMessage || 'There was an error submitting your request. Please try again.'}
              </AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Request Type</h3>
            <RadioGroup
              defaultValue={requestType}
              value={requestType}
              onValueChange={(value) => setRequestType(value as DataRequestType)}
              className="space-y-3"
            >
              {Object.values(DataRequestType).map((type) => (
                <div key={type} className="flex items-start space-x-2">
                  <RadioGroupItem value={type} id={`request-type-${type}`} />
                  <div className="grid gap-1 leading-none">
                    <Label htmlFor={`request-type-${type}`} className="font-medium capitalize">
                      {type.replace('_', ' ')}
                    </Label>
                    <p className="text-sm text-muted-foreground">{requestTypeDescriptions[type]}</p>
                  </div>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          <div className="space-y-3">
            <Label htmlFor="description" className="text-sm font-medium">
              Additional Details <span className="text-xs text-muted-foreground">(Optional)</span>
            </Label>
            <Textarea
              id="description"
              placeholder="Please provide any additional details about your request..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              If requesting data correction, please specify what information needs to be corrected.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          <Button
            type="submit"
            disabled={status === 'loading'}
          >
            {status === 'loading' ? 'Submitting...' : 'Submit Request'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DataRequestForm;