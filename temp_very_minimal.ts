
import { db } from "./server/db";
import { users } from "./shared/schema";

async function run() {
  try {
    const user = await db.query.users.findFirst();
    console.log(JSON.stringify({ user }));
  } catch (error: any) {
    console.log(JSON.stringify({ error: error.message }));
  }
}

run().then(() => process.exit(0));

