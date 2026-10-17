import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OSShell, OSModuleId } from '../os/OSShell';

interface StandalonePageProps {
  module: OSModuleId | 'project-detail';
}

export const StandalonePage: React.FC<StandalonePageProps> = ({ module }) => {
  const params = useParams<{ slug?: string }>();
  const navigate = useNavigate();

  const activeModule: OSModuleId =
    module === 'project-detail' ? 'projects' : (module as OSModuleId);

  return (
    <OSShell
      mode="standalone"
      initialModule={activeModule}
      initialSlug={params.slug}
      onNavigateRoute={(path) => navigate(path)}
    />
  );
};
