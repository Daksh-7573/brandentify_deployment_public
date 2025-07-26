import { useState } from 'react';

export default function URLInputDemo() {
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaUrls, setMediaUrls] = useState<string[]>([]);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [message, setMessage] = useState('');

  const addMediaUrl = () => {
    if (!mediaUrlInput.trim()) {
      setMessage("Please enter a valid URL.");
      return;
    }

    try {
      new URL(mediaUrlInput);
    } catch {
      setMessage("Please enter a valid URL format.");
      return;
    }

    if (mediaType === 'image' && mediaUrls.length >= 10) {
      setMessage("You can only add up to 10 images.");
      return;
    }

    if (mediaType === 'video' && mediaUrls.length >= 1) {
      setMessage("You can only add one video.");
      return;
    }

    setMediaUrls([...mediaUrls, mediaUrlInput]);
    setMediaUrlInput("");
    setMessage(`${mediaType === 'image' ? 'Image' : 'Video'} URL added successfully.`);
  };

  const removeMediaUrl = (index: number) => {
    setMediaUrls(mediaUrls.filter((_, i) => i !== index));
    setMessage("URL removed.");
  };

  return (
    <div style={{ 
      padding: "20px", 
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#1a1a1a",
      minHeight: "100vh",
      color: "white"
    }}>
      <div style={{
        maxWidth: "800px",
        margin: "0 auto",
        backgroundColor: "rgba(255, 255, 255, 0.05)",
        padding: "30px",
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.1)"
      }}>
        <h1 style={{ color: "white", marginBottom: "10px" }}>
          Brandentifier - URL Input Demo
        </h1>
        <p style={{ color: "#ccc", marginBottom: "30px" }}>
          This is the missing URL input functionality you requested!
        </p>

        {/* Media Type Tabs */}
        <div style={{ marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
            <button
              onClick={() => {
                setMediaType('image');
                setMediaUrls([]);
                setMessage('');
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: mediaType === 'image' ? "#007bff" : "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Images (up to 10)
            </button>
            <button
              onClick={() => {
                setMediaType('video');
                setMediaUrls([]);
                setMessage('');
              }}
              style={{
                padding: "10px 20px",
                backgroundColor: mediaType === 'video' ? "#007bff" : "#444",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer"
              }}
            >
              Video (1 only)
            </button>
          </div>
        </div>

        {/* URL Input Section */}
        <div style={{
          backgroundColor: "rgba(255, 255, 255, 0.05)",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px"
        }}>
          <h3 style={{ color: "white", marginBottom: "15px" }}>
            🔗 Add {mediaType === 'image' ? 'Image' : 'Video'} URL
          </h3>
          
          <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
            <input
              type="url"
              placeholder={mediaType === 'image' 
                ? "https://example.com/image.jpg" 
                : "https://example.com/video.mp4"}
              value={mediaUrlInput}
              onChange={(e) => setMediaUrlInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addMediaUrl();
                }
              }}
              style={{
                flex: 1,
                padding: "12px",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "6px",
                color: "white",
                fontSize: "16px"
              }}
            />
            <button 
              onClick={addMediaUrl}
              disabled={mediaUrls.length >= (mediaType === 'image' ? 10 : 1)}
              style={{
                padding: "12px 24px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "16px",
                opacity: mediaUrls.length >= (mediaType === 'image' ? 10 : 1) ? 0.5 : 1
              }}
            >
              Add URL
            </button>
          </div>
          
          <p style={{ color: "#999", fontSize: "14px", margin: 0 }}>
            Add {mediaType} URLs directly for preview - no file upload needed!
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div style={{
            padding: "10px",
            backgroundColor: message.includes('successfully') ? "#d4edda" : "#f8d7da",
            color: message.includes('successfully') ? "#155724" : "#721c24",
            borderRadius: "6px",
            marginBottom: "20px"
          }}>
            {message}
          </div>
        )}

        {/* Added URLs Display */}
        {mediaUrls.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <h3 style={{ color: "white", marginBottom: "15px" }}>
              Added {mediaType === 'image' ? 'Images' : 'Videos'} ({mediaUrls.length})
            </h3>
            
            {mediaType === 'image' ? (
              <div style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", 
                gap: "15px" 
              }}>
                {mediaUrls.map((url, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img 
                      src={url} 
                      alt={`Preview ${index}`}
                      style={{
                        width: "100%",
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        border: "1px solid rgba(255, 255, 255, 0.2)"
                      }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => removeMediaUrl(index)}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "25px",
                        height: "25px",
                        cursor: "pointer",
                        fontSize: "14px"
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ position: "relative" }}>
                <video
                  src={mediaUrls[0]}
                  controls
                  style={{
                    width: "100%",
                    maxHeight: "400px",
                    borderRadius: "8px",
                    border: "1px solid rgba(255, 255, 255, 0.2)"
                  }}
                />
                <button
                  onClick={() => removeMediaUrl(0)}
                  style={{
                    position: "absolute",
                    top: "10px",
                    right: "10px",
                    backgroundColor: "#dc3545",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    padding: "5px 10px",
                    cursor: "pointer"
                  }}
                >
                  Remove Video
                </button>
              </div>
            )}
          </div>
        )}

        <div style={{
          backgroundColor: "#e8f5e8",
          color: "#155724",
          padding: "15px",
          borderRadius: "8px",
          marginTop: "30px"
        }}>
          <h3 style={{ margin: "0 0 10px 0" }}>✅ URL Input Feature Working!</h3>
          <p style={{ margin: 0 }}>
            This is the exact functionality that has been added to the Create Pulse page. 
            You can now add media URLs directly instead of uploading files.
          </p>
        </div>
      </div>
    </div>
  );
}