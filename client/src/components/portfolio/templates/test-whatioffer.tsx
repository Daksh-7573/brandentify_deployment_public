import React from "react";

interface TestWhatIOfferProps {
  userInfo: {
    whatIOffer: string | null;
  };
}

export default function TestWhatIOffer({ userInfo }: TestWhatIOfferProps) {
  return (
    <div className="p-8 bg-white rounded shadow-md">
      <h1 className="text-2xl font-bold mb-4">Test What I Offer</h1>
      
      <div className="p-4 bg-gray-100 rounded mb-4">
        <h2 className="font-semibold mb-2">Data Debug:</h2>
        <pre className="overflow-auto bg-gray-800 text-white p-4 rounded">
          {JSON.stringify({
            whatIOffer: userInfo.whatIOffer,
            type: typeof userInfo.whatIOffer,
            isEmpty: !userInfo.whatIOffer,
            length: userInfo.whatIOffer?.length || 0
          }, null, 2)}
        </pre>
      </div>

      <div className="p-4 bg-blue-50 rounded mb-4">
        <h2 className="font-semibold mb-2">Conditional Rendering Test:</h2>
        {userInfo.whatIOffer ? (
          <div className="bg-green-100 p-4 rounded">
            <p>Content exists and is shown:</p>
            <p className="font-bold">{userInfo.whatIOffer}</p>
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded">
            <p>No content (null or empty string)</p>
          </div>
        )}
      </div>

      <div className="p-4 bg-purple-50 rounded mb-4">
        <h2 className="font-semibold mb-2">Enhanced Conditional Test:</h2>
        {userInfo.whatIOffer && userInfo.whatIOffer.length > 0 ? (
          <div className="bg-green-100 p-4 rounded">
            <p>Content exists, is not empty, and is shown:</p>
            <p className="font-bold">{userInfo.whatIOffer}</p>
          </div>
        ) : (
          <div className="bg-red-100 p-4 rounded">
            <p>No content (null or empty string)</p>
          </div>
        )}
      </div>
    </div>
  );
}