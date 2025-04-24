import React from 'react';
import SharedCardView from '@/components/profile/shared-card-view';

interface SharedCardPageProps {
  userId: string;
}

const SharedCardPage: React.FC<SharedCardPageProps> = ({ userId }) => {
  return <SharedCardView userId={userId} />;
};

export default SharedCardPage;