import { storage } from "../storage";
import { updateDemoUserProfile } from "../update-demo-profile";

async function main() {
  console.log("Starting demo profile update...");
  
  try {
    await updateDemoUserProfile(storage);
    console.log("Successfully updated demo user profile!");
  } catch (error) {
    console.error("Error updating demo user profile:", error);
  }
}

main();