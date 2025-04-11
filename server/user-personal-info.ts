import { IStorage } from './storage';
import { InsertUserPersonalInfo, UserPersonalInfo } from '../shared/schema';

/**
 * Add the UserPersonalInfo methods to the MemStorage class by
 * directly modifying the prototype
 */
export function addUserPersonalInfoMethods(MemStoragePrototype: any) {
  // User Personal Info operations
  MemStoragePrototype.getUserPersonalInfoByUserId = async function(userId: number): Promise<UserPersonalInfo | undefined> {
    return Array.from(this.userPersonalInfo.values())
      .find(info => info.userId === userId);
  };

  MemStoragePrototype.createUserPersonalInfo = async function(personalInfo: InsertUserPersonalInfo): Promise<UserPersonalInfo> {
    const id = this.currentUserPersonalInfoId++;
    const createdAt = new Date();
    const userPersonalInfo: UserPersonalInfo = { 
      ...personalInfo, 
      id,
      createdAt,
      updatedAt: createdAt,
      contactEmail: personalInfo.contactEmail ?? null,
      contactPhone: personalInfo.contactPhone ?? null,
      website: personalInfo.website ?? null,
      githubProfile: personalInfo.githubProfile ?? null,
      linkedinProfile: personalInfo.linkedinProfile ?? null,
      twitterProfile: personalInfo.twitterProfile ?? null,
      instagramProfile: personalInfo.instagramProfile ?? null,
      preferredContactMethod: personalInfo.preferredContactMethod ?? null
    };
    this.userPersonalInfo.set(id, userPersonalInfo);
    return userPersonalInfo;
  };

  MemStoragePrototype.updateUserPersonalInfo = async function(id: number, personalInfoData: Partial<UserPersonalInfo>): Promise<UserPersonalInfo | undefined> {
    const personalInfo = this.userPersonalInfo.get(id);
    if (!personalInfo) return undefined;
    
    const updatedPersonalInfo = { ...personalInfo, ...personalInfoData };
    this.userPersonalInfo.set(id, updatedPersonalInfo);
    return updatedPersonalInfo;
  };

  MemStoragePrototype.deleteUserPersonalInfo = async function(id: number): Promise<boolean> {
    return this.userPersonalInfo.delete(id);
  };
}