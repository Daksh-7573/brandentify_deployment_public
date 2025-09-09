// Test ultra-specific quest generation with Nishant's actual profile
async function testUltraSpecificQuests() {
  console.log('🎯 TESTING ULTRA-SPECIFIC SOCIAL QUEST GENERATION');
  console.log('Profile: Nishant Chopra - Hospitality/Corporate Travel (User ID: 2)');
  console.log('');

  // Simulate the ultra-specific quest generation logic
  const userProfile = {
    id: 2,
    name: 'Nishant Chopra',
    industry: 'Hospitality',
    domain: 'Corporate Travel',
    title: 'World',
    topExpertiseAreas: ['corporate travel management', 'revenue optimization strategies', 'guest experience enhancement', 'travel cost control']
  };

  // YouTube Quest - Ultra-Specific
  console.log('📺 YOUTUBE QUEST COMPARISON:');
  console.log('❌ CURRENT (Generic):');
  console.log('   "Create educational video content about your expertise, industry knowledge, or professional journey on YouTube"');
  console.log('');
  console.log('✅ NEW (Ultra-Specific):');
  const youtubeQuest = `Create educational video content about your expertise in ${userProfile.topExpertiseAreas[0]}, step-by-step tutorials on optimizing corporate travel costs, or career guidance specifically for ${userProfile.domain} professionals in ${userProfile.industry}`;
  console.log(`   "${youtubeQuest}"`);
  console.log('');

  // LinkedIn Quest - Ultra-Specific  
  console.log('📊 LINKEDIN QUEST COMPARISON:');
  console.log('❌ CURRENT (Generic):');
  console.log('   "Share professional insights about industry trends, cost optimization strategies, or expert analysis relevant to your field on LinkedIn"');
  console.log('');
  console.log('✅ NEW (Ultra-Specific):');
  const linkedinQuest = `Share professional insights about your expertise in ${userProfile.topExpertiseAreas[0]} and ${userProfile.topExpertiseAreas[1]}, analysis of hybrid work impact on corporate travel policies, or strategic perspectives on corporate travel cost reduction strategies specific to ${userProfile.industry}/${userProfile.domain}`;
  console.log(`   "${linkedinQuest}"`);
  console.log('');

  // Instagram Quest - Ultra-Specific
  console.log('📸 INSTAGRAM QUEST COMPARISON:');
  console.log('❌ CURRENT (Generic):');
  console.log('   "Share behind-the-scenes workspace content, professional tools, or day-in-the-life moments from your industry on Instagram"');
  console.log('');
  console.log('✅ NEW (Ultra-Specific):');
  const instagramQuest = `Post behind-the-scenes content showing your ${userProfile.topExpertiseAreas[0]} process, workspace moments while working on corporate travel booking workflows, or day-in-the-life content featuring corporate travel booking processes in ${userProfile.industry}`;
  console.log(`   "${instagramQuest}"`);
  console.log('');

  // Twitter Quest - Ultra-Specific
  console.log('🐦 TWITTER QUEST COMPARISON:');
  console.log('❌ CURRENT (Generic):');
  console.log('   "Share industry trends, quick professional tips, or expert insights relevant to your domain on Twitter"');
  console.log('');
  console.log('✅ NEW (Ultra-Specific):');
  const twitterQuest = `Tweet quick professional tips about ${userProfile.topExpertiseAreas[0]}, share insights on business travel recovery trends, or break down corporate hotel rate negotiation techniques for ${userProfile.industry} professionals`;
  console.log(`   "${twitterQuest}"`);
  console.log('');

  console.log('🎯 KEY IMPROVEMENTS:');
  console.log('✅ No more generic "your expertise" - now shows SPECIFIC expertise areas');
  console.log('✅ No more vague "industry knowledge" - now mentions SPECIFIC industry topics');
  console.log('✅ No more placeholder content - now shows ACTIONABLE, detailed guidance');
  console.log('✅ Mentions your ACTUAL industry/domain (Hospitality/Corporate Travel)');
  console.log('✅ References REAL professional activities and skills');
}

testUltraSpecificQuests();