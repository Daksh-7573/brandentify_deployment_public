/**
 * A simple PDF parser that extracts text directly from a buffer.
 * This approach bypasses OpenAI completely, avoiding any API issues.
 */

/**
 * Extract text from binary file data
 * @param fileBuffer The binary file buffer
 * @returns The extracted text content
 */
export async function extractTextFromBinaryData(fileBuffer: Buffer): Promise<string> {
  try {
    console.log(`Starting text extraction from binary data, buffer size: ${fileBuffer.length} bytes`);
    
    // Check if it's a PDF by looking at the signature
    const isPdf = fileBuffer.length > 4 && 
                  fileBuffer[0] === 0x25 && // %
                  fileBuffer[1] === 0x50 && // P
                  fileBuffer[2] === 0x44 && // D
                  fileBuffer[3] === 0x46;   // F
    
    if (isPdf) {
      console.log("File identified as PDF based on signature");
      return extractTextFromPdf(fileBuffer);
    } else {
      console.log("File not identified as PDF, attempting to extract as plain text");
      return extractPlainText(fileBuffer);
    }
  } catch (error: unknown) {
    console.error("Error in extractTextFromBinaryData:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to extract text from binary data: ${errorMessage}`);
  }
}

/**
 * Extract text from a PDF buffer using pdf.js
 * @param fileBuffer PDF file buffer
 * @returns The extracted text content
 */
async function extractTextFromPdf(fileBuffer: Buffer): Promise<string> {
  try {
    console.log("Attempting to use pdf.js to extract text");
    
    // Try to use pdfjs-dist
    try {
      const pdfjsLib = await import('pdfjs-dist');
      
      // Configure the worker source
      if (!pdfjsLib.GlobalWorkerOptions.workerSrc) {
        const pdfjsVersion = pdfjsLib.version;
        console.log(`PDF.js version: ${pdfjsVersion}`);
        
        // For browser environments, this would be a CDN URL, but for Node.js, we need to use the node modules
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsVersion}/pdf.worker.min.js`;
      }
      
      console.log("Loading PDF document with pdf.js");
      const pdf = await pdfjsLib.getDocument({ data: fileBuffer }).promise;
      console.log(`PDF loaded successfully. Pages: ${pdf.numPages}`);
      
      let extractedText = '';
      
      // Process each page
      for (let i = 1; i <= pdf.numPages; i++) {
        console.log(`Extracting text from page ${i} of ${pdf.numPages}`);
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
        extractedText += strings.join(' ') + '\n';
      }
      
      console.log(`Extracted ${extractedText.length} characters of text from PDF using pdf.js`);
      return extractedText;
    } catch (pdfJsError) {
      console.error("Error using pdf.js:", pdfJsError);
      console.log("Falling back to basic pattern-based extraction");
      return basicPdfTextExtraction(fileBuffer);
    }
  } catch (error: unknown) {
    console.error("Error in PDF text extraction:", error);
    // Fall back to basic pattern-based extraction as last resort
    try {
      return basicPdfTextExtraction(fileBuffer);
    } catch (fallbackError) {
      console.error("Error in fallback extraction:", fallbackError);
      return "";
    }
  }
}

/**
 * Basic PDF text extraction using simple patterns
 * @param fileBuffer The PDF buffer
 * @returns The extracted text content
 */
function basicPdfTextExtraction(fileBuffer: Buffer): string {
  try {
    console.log("Performing basic pattern-based PDF text extraction");
    
    // Convert buffer to string
    const pdfText = fileBuffer.toString('utf-8');
    
    // Try multiple patterns to extract text
    let extractedText = '';
    
    // Pattern 1: Look for text markers in PDF between parentheses
    const textContentPattern = /\(([^()]*(?:\([^()]*\)[^()]*)*)\)/g;
    const matches = pdfText.match(textContentPattern) || [];
    
    // Create a list of common PDF metadata markers and noise patterns
    const noisePatterns = [
      /node\d+/g,                   // Node IDs
      /D:\d{14}[-+]\d{2}'\d{2}'/g,  // Date stamps
      /uuid:\S+/g,                  // UUID markers
      /xmp\.did:\S+/g,              // XMP identifiers
      /xmp\.iid:\S+/g,              // More XMP identifiers
      /adobe:docid:\S+/g,           // Adobe document IDs
      /^[A-Z][a-z]+ [A-Z][a-z]+$/,  // Just names (like "John Doe" alone)
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/g, // Isolated emails
      /[A-Z0-9]{10,}/g,             // Random long strings of uppercase/numbers
      /adobe\S*/gi,                 // Adobe metadata
      /acrobat\S*/gi,               // Acrobat references
      /^en\s/g,                     // 'en' prefixes for language markers
      /\bTJ\b|\bTm\b|\bTf\b|\bTc\b|\bTw\b|\bTz\b|\bBT\b|\bET\b/g, // PDF operators
    ];

    // Filter out matches that are just PDF operators or metadata
    const filteredMatches = matches.filter(match => {
      // Skip if the content is too small (likely not real content)
      const content = match.slice(1, -1);
      if (content.length < 2) return false;
      
      // Skip if the content is likely metadata or noise
      for (const pattern of noisePatterns) {
        if (content.match(pattern)) return false;
      }
      
      return true;
    });
    
    // Extract text from parentheses (simplified PDF text extraction)
    extractedText = filteredMatches
      .map(match => match.slice(1, -1)) // Remove surrounding parentheses
      .join(' ')
      .replace(/\\(\d{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
      .replace(/\\[nr]/g, '\n') // Replace PDF newlines and returns
      .replace(/\s+/g, ' '); // Normalize whitespace
    
    // Pattern 2: Try another approach if the first one doesn't yield much
    if (extractedText.length < 100) {
      console.log("Trying alternative pattern extraction method");
      
      // Look for text markers with BT ... ET tags in PDF
      const textBlockPattern = /BT\s*([^]*?)\s*ET/g;
      const textBlocks = pdfText.match(textBlockPattern) || [];
      
      if (textBlocks.length > 0) {
        // Extract text content from text blocks
        const blockText = textBlocks
          .map(block => {
            // Extract strings from the text block
            const strings = block.match(/\(([^)]*)\)/g) || [];
            return strings
              .map(s => s.slice(1, -1)
                .replace(/\\(\d{3})/g, (match, octal) => String.fromCharCode(parseInt(octal, 8)))
                .replace(/\\[nr]/g, '\n'))
              .join(' ');
          })
          .join('\n')
          .replace(/\s+/g, ' '); // Normalize whitespace
        
        console.log(`Block pattern extraction produced ${blockText.length} characters`);
        
        if (blockText.length > extractedText.length) {
          extractedText = blockText;
        }
      }
    }
    
    // Pattern 3: Look for Unicode text markers
    if (extractedText.length < 100) {
      console.log("Trying Unicode pattern extraction");
      
      // Look for Unicode text markers in PDF
      const unicodePattern = /\<([0-9a-fA-F]+)\>/g; 
      const unicodeMatches = pdfText.match(unicodePattern) || [];
      
      if (unicodeMatches.length > 0) {
        const unicodeText = unicodeMatches
          .map(match => {
            // Convert hex to text
            const hex = match.slice(1, -1);
            let text = '';
            for (let i = 0; i < hex.length; i += 2) {
              const hexChar = hex.substring(i, i + 2);
              text += String.fromCharCode(parseInt(hexChar, 16));
            }
            return text;
          })
          .join(' ')
          .replace(/\s+/g, ' '); // Normalize whitespace
          
        console.log(`Unicode pattern extraction produced ${unicodeText.length} characters`);
        
        if (unicodeText.length > extractedText.length) {
          extractedText = unicodeText;
        }
      }
    }
    
    // Pattern 4: Look for keyword indicators
    if (extractedText.length < 100) {
      console.log("Searching for common resume keywords in raw text");
      
      // Check if the raw PDF text contains common resume keywords
      const resumeKeywords = [
        'resume', 'cv', 'curriculum', 'experience', 'education', 'skills', 
        'employment', 'work', 'job', 'position', 'project', 'university',
        'college', 'degree', 'certificate', 'reference', 'email', 'phone',
        'address', 'summary', 'profile', 'objective', 'professional'
      ];
      
      let keywordMatches = '';
      
      // For each keyword, find surrounding text
      resumeKeywords.forEach(keyword => {
        const regex = new RegExp(`[^\\(\\)\\<\\>]{0,30}${keyword}[^\\(\\)\\<\\>]{0,50}`, 'gi');
        const keywordContexts = pdfText.match(regex) || [];
        keywordMatches += keywordContexts.join(' ') + ' ';
      });
      
      if (keywordMatches.length > 100) {
        console.log(`Keyword extraction produced ${keywordMatches.length} characters`);
        extractedText = keywordMatches;
      }
    }
    
    // Advanced extraction: Try to find common resume sections
    if (extractedText.length < 200) {
      console.log("Trying advanced pattern-based extraction focused on resume sections");
      
      // Look for common resume section headers in the text
      const sectionHeaderRegex = /(?:EDUCATION|EXPERIENCE|SKILLS|WORK HISTORY|CERTIFICATIONS|PROJECTS|PROFESSIONAL EXPERIENCE|PROFILE|SUMMARY|OBJECTIVE)(?:\s*[:|-])?/gi;
      
      // Find all resume section locations
      const sections: { header: string, index: number }[] = [];
      let match;
      
      while ((match = sectionHeaderRegex.exec(pdfText)) !== null) {
        sections.push({
          header: match[0],
          index: match.index
        });
      }
      
      // If we found at least one section
      if (sections.length > 0) {
        console.log(`Found ${sections.length} potential section headers:`, sections.map(s => s.header).join(', '));
        
        // Extract content around each section
        let sectionsText = '';
        
        sections.forEach((section, idx) => {
          const nextIndex = idx < sections.length - 1 ? sections[idx + 1].index : Math.min(section.index + 2000, pdfText.length);
          const sectionContent = pdfText.substring(section.index, nextIndex);
          
          // Extract ASCII content from this section
          const readableContent = sectionContent
            .replace(/[^\x20-\x7E]/g, ' ') // Keep only ASCII printable characters
            .replace(/\s+/g, ' '); // Normalize whitespace
            
          sectionsText += readableContent + "\n\n";
        });
        
        if (sectionsText.length > extractedText.length) {
          extractedText = sectionsText;
          console.log(`Section-based extraction produced ${extractedText.length} characters`);
        }
      }
    }
    
    // Try deep content cleaning to extract meaningful text
    if (extractedText.length < 300) {
      console.log("Applying deep content cleaning to extract meaningful text");
      
      // First, try extracting multiple sentences (meaningful text sequences)
      const sentencePattern = /[A-Z][a-z]{2,}[^.!?]{10,}[.!?]/g;
      const sentences = pdfText.match(sentencePattern) || [];
      
      if (sentences.length > 5) {
        const sentenceText = sentences.join(' ');
        console.log(`Sentence extraction found ${sentences.length} sentences, ${sentenceText.length} characters`);
        
        if (sentenceText.length > extractedText.length) {
          extractedText = sentenceText;
        }
      }
    }
    
    // Last resort: Fall back to extracting readable characters from raw content
    if (extractedText.length < 300) {
      console.log("All pattern extractions failed, extracting readable ASCII text from raw content");
      
      // Extract only readable ASCII characters (letters, numbers, punctuation)
      const readableText = pdfText
        .replace(/[^\x20-\x7E]/g, ' ') // Keep only ASCII printable characters
        .replace(/\s+/g, ' ') // Normalize whitespace
        .trim();
      
      // Take a reasonable chunk of readable text
      const MAX_RAW_LENGTH = 10000;
      extractedText = readableText.substring(0, MAX_RAW_LENGTH);
      console.log(`Raw ASCII extraction produced ${extractedText.length} characters`);
      
      // Apply post-processing to strip out non-meaningful content
      extractedText = cleanExtractedContent(extractedText);
    }
    
    console.log(`Basic extraction produced ${extractedText.length} characters total`);
    return extractedText;
  } catch (error: unknown) {
    console.error("Error in basic PDF text extraction:", error);
    // Return empty string if all methods fail
    return "";
  }
}

/**
 * Cleans extracted content to remove garbage text and binary artifacts
 * @param extractedText The raw extracted text
 * @returns Cleaned text with non-meaningful content removed
 */
function cleanExtractedContent(extractedText: string): string {
  // Skip cleaning if text is too short
  if (extractedText.length < 100) return extractedText;
  
  console.log("Cleaning extracted content to remove noise");
  
  // Remove repeating character sequences that are likely binary artifacts
  // (e.g., "aaaaaaaa" or "........" with more than 5 repetitions)
  let cleanedText = extractedText.replace(/(.)\1{5,}/g, ' ');
  
  // Remove strings that are likely not meaningful text (random character sequences)
  cleanedText = cleanedText.replace(/\b[a-zA-Z0-9]{15,}\b/g, ' ');
  
  // Remove PDF operators and binary markers
  cleanedText = cleanedText.replace(/\b(obj|endobj|stream|endstream|xref|trailer|startxref)\b/g, ' ');
  
  // Remove hexadecimal sequences
  cleanedText = cleanedText.replace(/\b[A-F0-9]{6,}\b/g, ' ');
  
  // Handle unicode escape sequences and normalize whitespace
  cleanedText = cleanedText
    .replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/\s+/g, ' ')
    .trim();
  
  // Remove PDF comments
  cleanedText = cleanedText.replace(/%[^\n\r]*/g, '');
  
  // Extract likely meaningful text using a scoring system
  // Split text into chunks and keep only those that look like natural language
  const chunks = cleanedText.split(/\s{2,}|\n/);
  const meaningfulChunks = chunks.filter(chunk => {
    // Skip short chunks
    if (chunk.length < 10) return false;
    
    // Calculate "text-like" score for the chunk
    let score = 0;
    
    // Check for capitalization patterns (indicates sentences)
    if (/[A-Z][a-z]/.test(chunk)) score += 2;
    
    // Check for common punctuation (periods, commas)
    if (/[.,;:]/.test(chunk)) score += 2;
    
    // Check for common small words (indicates natural language)
    if (/\b(the|and|to|of|in|for|with|as|at|by|on)\b/i.test(chunk)) score += 3;
    
    // Check for word variety (ratio of unique words to total words)
    const words = chunk.match(/\b[a-zA-Z]{2,}\b/g) || [];
    const uniqueWords = new Set(words.map(w => w.toLowerCase()));
    if (words.length > 0) {
      const wordVarietyRatio = uniqueWords.size / words.length;
      // Natural text has a good balance of repeated and unique words
      if (wordVarietyRatio > 0.4 && wordVarietyRatio < 0.9) score += 3;
    }
    
    // Keep chunks with a minimum score
    return score >= 4;
  });
  
  // Join meaningful chunks with appropriate spacing
  const result = meaningfulChunks.join('\n\n');
  
  console.log(`Content cleaning reduced text from ${extractedText.length} to ${result.length} characters`);
  return result.length > 100 ? result : extractedText; // Fall back to original if we removed too much
}

/**
 * Extract text from non-PDF binary data
 * @param fileBuffer The binary file buffer
 * @returns The extracted text content
 */
function extractPlainText(fileBuffer: Buffer): string {
  try {
    console.log("Attempting to extract text from binary file as plain text");
    
    // Try UTF-8 first
    let text = fileBuffer.toString('utf-8');
    
    // If the text contains mostly unprintable characters, try other encodings
    if (text.replace(/[\x20-\x7E]/g, '').length > text.length * 0.7) {
      console.log("UTF-8 decoding produced mostly unprintable characters, trying latin1");
      text = fileBuffer.toString('latin1');
    }
    
    // Clean up the text (remove control characters)
    const cleanText = text
      .replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, '') // Remove control chars except \n (0x0A) and \r (0x0D)
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
    
    // Apply deeper cleaning for potentially binary files
    const finalText = cleanExtractedContent(cleanText);
    
    console.log(`Extracted ${finalText.length} characters from non-PDF file`);
    return finalText;
  } catch (error: unknown) {
    console.error("Error in plain text extraction:", error);
    return "";
  }
}