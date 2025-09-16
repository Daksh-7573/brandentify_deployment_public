import{c as s,f as t}from"./index-kczp_S5U.js";/**
 * @license lucide-react v0.453.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const n=s("BriefcaseBusiness",[["path",{d:"M12 12h.01",key:"1mp3jc"}],["path",{d:"M16 6V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2",key:"1ksdt3"}],["path",{d:"M22 13a18.15 18.15 0 0 1-20 0",key:"12hx5q"}],["rect",{width:"20",height:"14",x:"2",y:"6",rx:"2",key:"i6l2r4"}]]);function c(e,o={}){return t({queryKey:["/api/users",e,"profile"],enabled:!!e&&o.enabled!==!1,queryFn:async()=>{if(!e)throw new Error("User ID is required");console.log(`Fetching comprehensive profile data for user ${e}`);const r=await fetch(`/api/users/${e}/profile`);if(!r.ok)throw new Error(`Failed to fetch user profile data: ${r.statusText}`);const a=await r.json();return console.log(`Received comprehensive profile data for user ${e}:`,a),a},retry:1})}export{n as B,c as u};
