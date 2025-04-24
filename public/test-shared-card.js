async function testShareLink() {
  try {
    // Generate a test URL using ID 2
    const shareUrl = `${window.location.origin}/profile/card/2`;
    console.log("Test share URL:", shareUrl);
    
    // Fetch the data from our shared-card endpoint
    const response = await fetch("/api/shared-card/2");
    if (!response.ok) {
      throw new Error(`Shared card API failed with status: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log("Shared card user data:", userData);
    console.log("SUCCESS: Shared card endpoint is working properly");
    
    return { success: true, shareUrl, userData };
  } catch (error) {
    console.error("ERROR: Shared card test failed:", error);
    return { success: false, error };
  }
}

if (typeof window !== "undefined") {
  console.log("Running shared card test...");
  testShareLink().then(result => {
    console.log("Test result:", result.success ? "SUCCESS" : "FAILED");
  });
}
