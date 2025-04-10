import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share, Download, Copy, QrCode, Link2 } from 'lucide-react';
import { UserData } from '@/types/user';
import QRCodeGenerator from './qr-code-generator';
import { useToast } from '@/hooks/use-toast';

interface ShareVisitingCardProps {
  userData: UserData;
  cardType: string;
}

const ShareVisitingCard: React.FC<ShareVisitingCardProps> = ({ userData, cardType }) => {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  
  // Format profile link
  const profileUrl = `https://brandentifier.com/@${userData.name ? userData.name.replace(/\s+/g, '') : userData.username}`;
  
  // Contact information as vCard format
  const vCardData = `BEGIN:VCARD
VERSION:3.0
FN:${userData.name || ''}
ORG:${userData.company || ''}
TITLE:${userData.title || ''}
TEL:${userData.phoneNumber || ''}
EMAIL:${userData.email || ''}
URL:${profileUrl}
END:VCARD`;

  // Handle copying profile link
  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Link Copied",
      description: "Profile link copied to clipboard",
    });
  };
  
  // Handle copying vCard data
  const handleCopyVCard = () => {
    navigator.clipboard.writeText(vCardData);
    toast({
      title: "Contact Data Copied",
      description: "Contact information copied to clipboard",
    });
  };
  
  // Handle downloading vCard
  const handleDownloadVCard = () => {
    const blob = new Blob([vCardData], { type: 'text/vcard' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userData.name?.replace(/\s+/g, '') || 'contact'}.vcf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "vCard Downloaded",
      description: "Contact card has been downloaded",
    });
  };
  
  // Handle taking screenshot of the QR code
  const handleDownloadQRCode = () => {
    if (!qrCodeRef.current) return;
    
    try {
      // Convert SVG to a data URL
      const svgElement = qrCodeRef.current.querySelector('svg');
      if (!svgElement) return;
      
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const img = new Image();
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);
        
        const imgURL = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = imgURL;
        a.download = `${userData.name?.replace(/\s+/g, '') || 'contact'}-qrcode.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        toast({
          title: "QR Code Downloaded",
          description: "QR code has been downloaded as an image",
        });
      };
      
      img.src = url;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading the QR code",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 mt-4 w-full"
          onClick={() => setDialogOpen(true)}
        >
          <Share className="h-4 w-4" />
          Share Contact Card
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Digital Visiting Card</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="qrcode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="qrcode">QR Code</TabsTrigger>
            <TabsTrigger value="links">Links & Downloads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="qrcode" className="mt-4">
            <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
              <div ref={qrCodeRef} className="mb-4">
                <QRCodeGenerator 
                  text={profileUrl}
                  size={200}
                  primaryColor={cardType === "minimalist" ? "#1e40af" : "#000000"}
                  backgroundColor="#ffffff"
                />
              </div>
              <p className="text-sm text-center text-gray-500 mb-3">
                Scan this QR code to view my profile and contact information
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-2"
                onClick={handleDownloadQRCode}
              >
                <Download className="h-4 w-4" />
                Download QR Code
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="links" className="mt-4">
            <div className="space-y-4">
              <div className="flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Profile Link</h3>
                <div className="flex items-center">
                  <div className="flex-1 bg-gray-50 dark:bg-gray-900 p-2 rounded-l-md text-sm truncate">
                    {profileUrl}
                  </div>
                  <Button 
                    variant="secondary" 
                    size="icon" 
                    className="h-10 rounded-l-none"
                    onClick={handleCopyLink}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 flex flex-col space-y-2">
                <h3 className="text-sm font-medium">Download Options</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2"
                    onClick={handleDownloadVCard}
                  >
                    <Download className="h-4 w-4" />
                    vCard (.vcf)
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2"
                    onClick={handleCopyVCard}
                  >
                    <Copy className="h-4 w-4" />
                    Copy Data
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default ShareVisitingCard;