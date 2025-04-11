import { MemStorage } from './storage';
import { UserPersonalInfo, InsertUserPersonalInfo } from "@shared/schema";

// Add the UserPersonalInfo methods to the MemStorage prototype
export function addUserPersonalInfoMethods(memStoragePrototype: any) {
  // Get personal info by user ID
  memStoragePrototype.getUserPersonalInfoByUserId = async function(userId: number): Promise<UserPersonalInfo | undefined> {
    const personalInfos = Array.from(this.userPersonalInfo.values());
    return personalInfos.find(info => info.userId === userId);
  };
  
  // Create personal info
  memStoragePrototype.createUserPersonalInfo = async function(insertPersonalInfo: InsertUserPersonalInfo): Promise<UserPersonalInfo> {
    const id = this.currentUserPersonalInfoId++;
    const personalInfo: UserPersonalInfo = { 
      ...insertPersonalInfo, 
      id,
      // Handle nullable fields with explicit nulls instead of undefined
      contactEmail: insertPersonalInfo.contactEmail ?? null,
      contactPhone: insertPersonalInfo.contactPhone ?? null,
      website: insertPersonalInfo.website ?? null,
      githubProfile: insertPersonalInfo.githubProfile ?? null,
      linkedinProfile: insertPersonalInfo.linkedinProfile ?? null,
      twitterProfile: insertPersonalInfo.twitterProfile ?? null,
      instagramProfile: insertPersonalInfo.instagramProfile ?? null,
      calendlyLink: insertPersonalInfo.calendlyLink ?? null,
      preferredContactMethod: insertPersonalInfo.preferredContactMethod ?? null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.userPersonalInfo.set(id, personalInfo);
    return personalInfo;
  };
  
  // Update personal info
  memStoragePrototype.updateUserPersonalInfo = async function(id: number, personalInfoData: Partial<UserPersonalInfo>): Promise<UserPersonalInfo | undefined> {
    const personalInfo = this.userPersonalInfo.get(id);
    if (!personalInfo) return undefined;
    
    const updatedInfo = { 
      ...personalInfo, 
      ...personalInfoData,
      updatedAt: new Date() 
    };
    
    this.userPersonalInfo.set(id, updatedInfo);
    return updatedInfo;
  };
  
  // Delete personal info
  memStoragePrototype.deleteUserPersonalInfo = async function(id: number): Promise<boolean> {
    return this.userPersonalInfo.delete(id);
  };
}